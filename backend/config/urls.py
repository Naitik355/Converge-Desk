"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from projects.documents import collaboration_authorization

def health_check(request):
    return JsonResponse({
        "status": "ok",
        "message": "Converge-Desk API is running"
    })

urlpatterns = [
    path('', health_check, name="root-health"),
    path('api/', health_check, name="api-health"),
    path('admin/', admin.site.urls),
    path('api/projects/', include("projects.urls")),
    path('api/accounts/', include("accounts.urls")),
    path('api/collaboration/documents/<int:pk>/authorize/', collaboration_authorization, name="collab-authorize"),
    path('api/', include("tasks.urls")), 
    path('api/', include("board.urls")),
]
