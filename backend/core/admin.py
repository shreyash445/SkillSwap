from django.contrib import admin

from .models import Exchange, Message, Rating, Skill, User, UserSkill


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["email", "full_name", "avg_rating", "rating_count", "created_at"]


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ["name", "category"]
    list_filter = ["category"]


@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    list_display = ["user", "skill", "direction", "proficiency_level"]


@admin.register(Exchange)
class ExchangeAdmin(admin.ModelAdmin):
    list_display = ["proposer", "recipient", "status", "created_at"]
    list_filter = ["status"]


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ["exchange", "rater", "ratee", "stars"]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["exchange", "sender", "recipient", "read", "created_at"]