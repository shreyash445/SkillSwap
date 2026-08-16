import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.db.models import Avg, Count


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email).lower()
        user = self.model(email=email, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True)
    bio = models.CharField(max_length=150, blank=True)
    availability = models.CharField(max_length=255, blank=True)
    avatar_color = models.CharField(max_length=7, default="#7C5CFF")
    avg_rating = models.FloatField(default=0)
    rating_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name"]

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def initials(self):
        parts = [self.first_name, self.last_name]
        return "".join(p[0].upper() for p in parts if p)[:2]

    def __str__(self):
        return self.email


class Skill(models.Model):
    CATEGORY_CHOICES = [
        ("technical", "Technical"),
        ("creative", "Creative"),
        ("language", "Language"),
        ("sports", "Sports"),
    ]

    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class UserSkill(models.Model):
    LEVEL_CHOICES = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_skills")
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    direction = models.CharField(
        max_length=10,
        choices=[("offered", "Offered"), ("wanted", "Wanted")],
    )
    proficiency_level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default="intermediate")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "skill", "direction"],
                name="unique_user_skill_direction",
            )
        ]


class Exchange(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    proposer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="proposed_exchanges")
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_exchanges")
    skill_offered = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="+")
    skill_wanted = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="+")
    proposed_duration = models.IntegerField(choices=[(30, 30), (60, 60), (90, 90)])
    proposed_date = models.DateField(null=True, blank=True)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.proposer.email} <-> {self.recipient.email}"


class Rating(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exchange = models.ForeignKey(Exchange, on_delete=models.CASCADE, related_name="ratings")
    rater = models.ForeignKey(User, on_delete=models.CASCADE, related_name="given_ratings")
    ratee = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_ratings")
    stars = models.IntegerField()
    feedback = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["exchange", "rater"], name="unique_rating_per_exchange_rater")
        ]

    def save(self, *args, **kwargs):
        if not (1 <= self.stars <= 5):
            raise ValueError("Stars must be between 1 and 5")
        super().save(*args, **kwargs)
        self._refresh_ratee_stats()

    def _refresh_ratee_stats(self):
        agg = Rating.objects.filter(ratee=self.ratee).aggregate(
            avg=Avg("stars"), cnt=Count("id")
        )
        self.ratee.avg_rating = round(agg["avg"] or 0, 2)
        self.ratee.rating_count = agg["cnt"] or 0
        self.ratee.save(update_fields=["avg_rating", "rating_count", "updated_at"])


class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_messages")
    exchange = models.ForeignKey(Exchange, on_delete=models.CASCADE, related_name="messages")
    content = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]