from rest_framework import serializers

from .models import Exchange, Message, Rating, Skill, User, UserSkill


class UserSkillSerializer(serializers.ModelSerializer):
    skill_id = serializers.IntegerField(write_only=True)
    skill_name = serializers.CharField(source="skill.name", read_only=True)
    category = serializers.CharField(source="skill.category", read_only=True)

    class Meta:
        model = UserSkill
        fields = ["id", "skill_id", "skill_name", "category", "direction", "proficiency_level"]
        read_only_fields = ["id", "direction"]

    def validate_skill_id(self, value):
        if not Skill.objects.filter(id=value).exists():
            raise serializers.ValidationError("Unknown skill")
        return value


class UserSummarySerializer(serializers.ModelSerializer):
    offers = serializers.SerializerMethodField()
    wants = serializers.SerializerMethodField()
    match_score = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", "full_name", "initials",
            "avatar_color", "bio", "availability", "avg_rating", "rating_count",
            "offers", "wants", "match_score", "created_at",
        ]

    def get_offers(self, obj):
        return [
            {"skill_id": us.skill_id, "name": us.skill.name, "level": us.proficiency_level}
            for us in obj.user_skills.filter(direction="offered").select_related("skill")
        ]

    def get_wants(self, obj):
        return [
            {"skill_id": us.skill_id, "name": us.skill.name}
            for us in obj.user_skills.filter(direction="wanted").select_related("skill")
        ]

    def get_match_score(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated or request.user.id == obj.id:
            return None
        return compute_match_score(request.user, obj)


class UserDetailSerializer(UserSummarySerializer):
    recent_ratings = serializers.SerializerMethodField()

    class Meta(UserSummarySerializer.Meta):
        fields = UserSummarySerializer.Meta.fields + ["email", "recent_ratings"]

    def get_email(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated and request.user.id == obj.id:
            return obj.email
        return None

    def get_recent_ratings(self, obj):
        ratings = obj.received_ratings.select_related("rater").order_by("-created_at")[:10]
        return RatingSerializer(ratings, many=True).data


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "category", "description"]


class ExchangeSerializer(serializers.ModelSerializer):
    skill_offered_name = serializers.CharField(source="skill_offered.name", read_only=True)
    skill_wanted_name = serializers.CharField(source="skill_wanted.name", read_only=True)
    proposer = UserSummarySerializer(read_only=True)
    recipient = UserSummarySerializer(read_only=True)
    other_user = serializers.SerializerMethodField()
    proposer_id = serializers.UUIDField(write_only=True)
    recipient_id = serializers.UUIDField(write_only=True)
    skill_offered_id = serializers.IntegerField(write_only=True)
    skill_wanted_id = serializers.IntegerField(write_only=True)
    my_rating = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Exchange
        fields = [
            "id", "proposer", "recipient", "other_user", "proposer_id", "recipient_id",
            "skill_offered_id", "skill_wanted_id",
            "skill_offered_name", "skill_wanted_name", "proposed_duration", "proposed_date",
            "message", "status", "created_at", "updated_at", "my_rating", "last_message",
        ]
        read_only_fields = ["proposer", "recipient", "status"]

    def validate(self, attrs):
        if attrs["proposer_id"] == attrs["recipient_id"]:
            raise serializers.ValidationError("Cannot propose an exchange with yourself")
        return attrs

    def get_other_user(self, obj):
        request = self.context.get("request")
        if not request:
            return None
        other = obj.recipient if obj.proposer_id == request.user.id else obj.proposer
        return UserSummarySerializer(other, context=self.context).data

    def get_my_rating(self, obj):
        request = self.context.get("request")
        if not request:
            return None
        rating = obj.ratings.filter(rater=request.user).first()
        if rating:
            return RatingSerializer(rating).data
        return None

    def get_last_message(self, obj):
        msg = obj.messages.order_by("-created_at").select_related("sender").first()
        if not msg:
            return None
        return {
            "content": msg.content,
            "sender_name": msg.sender.full_name,
            "sender_id": str(msg.sender_id),
            "created_at": msg.created_at.isoformat(),
        }


class RatingSerializer(serializers.ModelSerializer):
    rater_name = serializers.CharField(source="rater.full_name", read_only=True)
    rater_initials = serializers.CharField(source="rater.initials", read_only=True)

    class Meta:
        model = Rating
        fields = ["id", "exchange_id", "rater", "rater_name", "rater_initials", "ratee", "stars", "feedback", "created_at"]
        read_only_fields = ["rater", "ratee"]


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.full_name", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "exchange_id", "sender", "sender_name", "recipient", "content", "read", "created_at"]
        read_only_fields = ["sender", "recipient", "read"]


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists")
        return value


def compute_match_score(a, b):
    """
    Complementary match score 0..100.
    +50 if A offers what B wants; +50 if B offers what A wants.
    """
    a_offer = set(a.user_skills.filter(direction="offered").values_list("skill_id", flat=True))
    a_want = set(a.user_skills.filter(direction="wanted").values_list("skill_id", flat=True))
    b_offer = set(b.user_skills.filter(direction="offered").values_list("skill_id", flat=True))
    b_want = set(b.user_skills.filter(direction="wanted").values_list("skill_id", flat=True))

    score = 0
    if a_offer & b_want:
        score += 50
    if b_offer & a_want:
        score += 50
    return score