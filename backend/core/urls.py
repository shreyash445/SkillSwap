from django.urls import path

from . import views

urlpatterns = [
    path("auth/register", views.RegisterView.as_view()),
    path("auth/login", views.LoginView.as_view()),
    path("auth/logout", views.LogoutView.as_view()),
    path("auth/me", views.MeView.as_view()),
    path("me/skills", views.MeSkillsView.as_view()),
    path("me/skills/<uuid:pk>", views.MeSkillsView.as_view()),
    path("skills", views.SkillListView.as_view()),
    path("users", views.UserListView.as_view()),
    path("users/<uuid:pk>", views.UserDetailView.as_view()),
    path("exchanges", views.ExchangeListCreateView.as_view()),
    path("exchanges/<uuid:pk>", views.ExchangeDetailView.as_view()),
    path("exchanges/<uuid:pk>/rate", views.RatingCreateView.as_view()),
    path("exchanges/<uuid:pk>/messages", views.MessageListView.as_view()),
    path("notifications", views.UnreadCountView.as_view()),
    path("leaderboard", views.LeaderboardView.as_view()),
]