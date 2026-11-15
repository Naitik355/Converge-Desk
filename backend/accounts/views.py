from django.shortcuts import render
from django.contrib.auth.models import User
import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.auth import authenticate,login as auth_login,logout as auth_logout
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.middleware.csrf import get_token
from django.conf import settings


# Create your views here.

@csrf_exempt
@require_POST
def signup(request):
    try:
        data=json.loads(request.body)
        username=data['username']
        email=data['email']
        password=data['password']

        if User.objects.filter(username=username).exists():
            return JsonResponse({"error":"Username already exists"},status=400)
        user=User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        return JsonResponse({
            "messages":"Account created successfully",
            "username":user.username
        },status=201)
    except(KeyError,json.JSONDecodeError):
        return JsonResponse({
            "error":"Please provide username,email and password"
        },status=400)


@csrf_exempt
@require_POST
def login(request):
    try:
        data=json.loads(request.body)
        username=data['username']
        password=data['password']
    except(KeyError,json.JSONDecodeError):
        return JsonResponse({"error":"Username and password are required"},status=400)

    user=authenticate(
        request,
        username=username,
        password=password
    )
    if user is not None:
        auth_login(request,user)
        csrf_token = get_token(request)
        response = JsonResponse({
            "message":"Login Successful",
            "username":user.username,
            "csrfToken": csrf_token,
        })
        response.set_cookie(
            'csrftoken',
            csrf_token,
            samesite=getattr(settings, 'CSRF_COOKIE_SAMESITE', 'None'),
            secure=getattr(settings, 'CSRF_COOKIE_SECURE', True),
            httponly=False,
        )
        return response
    return JsonResponse({"error":"Invalid username or password"},status=401)

@csrf_exempt
@require_POST
def logout(request):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Already logged out"})
    auth_logout(request)
    return JsonResponse({
        "message": "Logout successful"
    })

def current_user(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)
    user = request.user
    csrf_token = get_token(request)

    response = JsonResponse({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "csrfToken": csrf_token,
    })
    response.set_cookie(
        'csrftoken',
        csrf_token,
        samesite=getattr(settings, 'CSRF_COOKIE_SAMESITE', 'None'),
        secure=getattr(settings, 'CSRF_COOKIE_SECURE', True),
        httponly=False,
    )
    return response
