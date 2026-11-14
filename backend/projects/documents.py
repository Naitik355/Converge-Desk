import json
import os
import uuid
from urllib.parse import urlencode

import requests
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core import signing
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User

from .models import Membership, Projects, ProjectDocuments


def etherpad_api(method, **params):
    """Call Etherpad's API without exposing its API key to the frontend."""
    base_url = getattr(settings, "ETHERPAD_API_URL", "http://127.0.0.1:9001").rstrip("/")
    api_key = getattr(settings, "ETHERPAD_API_KEY", "")

    if not api_key:
        return {}

    response = requests.post(
        f"{base_url}/api/1/{method}",
        data={"apikey": api_key, **params},
        timeout=5,
    )
    response.raise_for_status()
    payload = response.json()

    if payload.get("code") != 0:
        raise RuntimeError(payload.get("message", "Etherpad API request failed"))

    return payload.get("data", {})


def serialize_document(document, request=None):
    base_url = getattr(settings, "ETHERPAD_API_URL", "http://127.0.0.1:9001").rstrip("/")
    pad_id = getattr(document, "pad_id", "") or ""
    return {
        "id": document.id,
        "project": document.project_id,
        "title": document.title,
        "content": getattr(document, "content", "") or "",
        "pad_id": pad_id,
        "embed_url": (
            f"{base_url}/p/{pad_id}?showChat=false&showLineNumbers=true"
            if pad_id else ""
        ),
        "created_by": document.created_by_id,
        "created_by_username": getattr(document.created_by, "username", "") if document.created_by else "",
        "created_at": document.created_at.isoformat(),
        "updated_at": document.updated_at.isoformat(),
    }


@login_required
@require_http_methods(["GET", "POST"])
def project_documents(request, project_id):
    membership = get_object_or_404(
        Membership.objects.select_related("project"),
        project_id=project_id,
        user=request.user,
    )
    project = membership.project

    if request.method == "GET":
        documents = ProjectDocuments.objects.filter(
            project=project
        ).select_related("created_by").order_by("-created_at")

        return JsonResponse({
            "documents": [
                serialize_document(document, request)
                for document in documents
            ]
        })

    if membership.role == Membership.Role.VIEWER:
        return JsonResponse(
            {"error": "Viewers cannot create documents."},
            status=403,
        )

    try:
        body = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    title = body.get("title")
    if not isinstance(title, str) or not title.strip():
        return JsonResponse({"error": "A title is required."}, status=400)

    title = title.strip()
    if len(title) > 200:
        return JsonResponse(
            {"error": "Title must be 200 characters or fewer."},
            status=400,
        )

    pad_id = f"project_{project_id}_{uuid.uuid4().hex}"

    try:
        if getattr(settings, "ETHERPAD_API_KEY", None):
            etherpad_api(
                "createPad",
                padID=pad_id,
                text=f"{title}\n\n",
            )
    except Exception:
        # Etherpad optional, do not block native collaborative editing
        pass

    initial_content = body.get("content", "")
    if not isinstance(initial_content, str):
        initial_content = ""

    document = ProjectDocuments.objects.create(
        project=project,
        title=title,
        content=initial_content,
        pad_id=pad_id,
        created_by=request.user,
    )

    return JsonResponse(
        {"document": serialize_document(document, request)},
        status=201,
    )


@login_required
@require_http_methods(["GET", "PUT", "PATCH", "DELETE"])
def document_detail(request, pk):
    document = get_object_or_404(
        ProjectDocuments.objects.select_related("project", "created_by"),
        pk=pk,
    )

    membership = Membership.objects.filter(
        project=document.project,
        user=request.user,
    ).first()

    if not membership:
        return JsonResponse({"error": "You do not have access to this document."}, status=403)

    if request.method == "GET":
        return JsonResponse({"document": serialize_document(document, request)})

    if request.method in ["PUT", "PATCH"]:
        if membership.role == Membership.Role.VIEWER:
            return JsonResponse({"error": "Viewers cannot edit document details."}, status=403)

        try:
            body = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON."}, status=400)

        title = body.get("title")
        if title is not None:
            clean_title = str(title).strip()
            if not clean_title:
                return JsonResponse({"error": "Title cannot be empty."}, status=400)
            document.title = clean_title[:200]

        if "content" in body:
            document.content = str(body["content"])

        document.save()
        return JsonResponse({"document": serialize_document(document, request)})

    if request.method == "DELETE":
        is_owner_or_admin = membership.role in [Membership.Role.OWNER, "admin"]
        is_creator = document.created_by_id == request.user.id

        if not (is_owner_or_admin or is_creator):
            return JsonResponse(
                {"error": "Only the document creator or project owners can delete documents."},
                status=403,
            )

        document.delete()
        return JsonResponse({"message": "Document deleted successfully."})


@login_required
@require_http_methods(["GET"])
def document_collab_token(request, pk):
    """
    Returns a signed token for connecting to the collaboration WebSocket server.
    """
    document = get_object_or_404(
        ProjectDocuments.objects.select_related("project"),
        pk=pk,
    )

    membership = Membership.objects.filter(
        project=document.project,
        user=request.user,
    ).first()

    if not membership:
        return JsonResponse({"error": "Access denied to this document."}, status=403)

    token = signing.dumps(
        {
            "user_id": request.user.id,
            "username": request.user.username,
            "document_id": document.id,
            "project_id": document.project_id,
        },
        salt="collab-token",
    )

    return JsonResponse({
        "token": token,
        "document_id": document.id,
        "project_id": document.project_id,
        "user_id": request.user.id,
        "username": request.user.username,
    })


@csrf_exempt
@require_http_methods(["GET"])
def collaboration_authorization(request, pk):
    """
    Called by @hocuspocus/server during onAuthenticate to verify access.
    Accepts:
      - Authorization: Bearer <signed_token>
      - Standard Django session cookie if authenticated
    """
    user = None

    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        raw_token = auth_header[7:].strip()
        try:
            payload = signing.loads(raw_token, max_age=86400, salt="collab-token")
            token_doc_id = payload.get("document_id")
            if token_doc_id and int(token_doc_id) == int(pk):
                user = User.objects.filter(id=payload.get("user_id")).first()
        except (signing.BadSignature, signing.SignatureExpired, ValueError, TypeError):
            user = None

    if user is None and request.user.is_authenticated:
        user = request.user

    if user is None:
        return JsonResponse({"error": "Authentication required"}, status=401)

    has_access = Membership.objects.filter(
        project__documents__id=pk,
        user=user,
    ).exists()

    if not has_access:
        return JsonResponse({"error": "Document access denied"}, status=403)

    document = get_object_or_404(ProjectDocuments, pk=pk)

    return JsonResponse({
        "authorized": True,
        "document_id": document.id,
        "project_id": document.project_id,
        "user_id": user.id,
        "username": user.username,
    })
