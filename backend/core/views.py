from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, permissions, status, views
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Exchange, Message, Rating, Skill, User, UserSkill
from .serializers import (
    ExchangeSerializer,
    MessageSerializer,
    RatingSerializer,
    RegisterSerializer,
    SkillSerializer,
    UserDetailSerializer,
    UserSummarySerializer,
)


class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        user = User.objects.create_user(
            email=data["email"],
            password=data["password"],
            first_name=data["first_name"],
            last_name=data.get("last_name", ""),
        )
        token = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(token.access_token),
                "refresh": str(token),
                "user": UserDetailSerializer(user, context={"request": request}).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").lower()
        password = request.data.get("password", "")
        user = User.objects.filter(email=email).first()
        if not user or not user.check_password(password):
            return Response({"detail": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)
        token = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(token.access_token),
                "refresh": str(token),
                "user": UserDetailSerializer(user, context={"request": request}).data,
            }
        )


class LogoutView(views.APIView):
    def post(self, request):
        refresh = request.data.get("refresh")
        if refresh:
            try:
                RefreshToken(refresh).blacklist()
            except Exception:
                pass
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(views.APIView):
    def get(self, request):
        return Response(UserDetailSerializer(request.user, context={"request": request}).data)

    def patch(self, request):
        user = request.user
        for field in ("first_name", "last_name", "bio", "availability", "avatar_color"):
            if field in request.data:
                if field == "bio" and len(request.data[field]) > 150:
                    raise ValidationError({"bio": "Bio must be 150 characters or fewer"})
                setattr(user, field, request.data[field])
        user.save()
        return Response(UserDetailSerializer(user, context={"request": request}).data)


class SkillListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get("category")
        q = self.request.query_params.get("q")
        if category:
            qs = qs.filter(category=category)
        if q:
            qs = qs.filter(name__icontains=q)
        return qs


class MeSkillsView(views.APIView):
    def post(self, request):
        direction = request.data.get("direction")
        if direction not in ("offered", "wanted"):
            raise ValidationError({"direction": "Must be 'offered' or 'wanted'"})
        skill_id = request.data.get("skill_id")
        level = request.data.get("proficiency_level", "intermediate")

        offered_count = request.user.user_skills.filter(direction="offered").count()
        wanted_count = request.user.user_skills.filter(direction="wanted").count()
        limit = 5
        if direction == "offered" and offered_count >= limit:
            raise ValidationError({"detail": f"Maximum of {limit} offered skills"})
        if direction == "wanted" and wanted_count >= limit:
            raise ValidationError({"detail": f"Maximum of {limit} wanted skills"})

        us, created = UserSkill.objects.get_or_create(
            user=request.user,
            skill_id=skill_id,
            direction=direction,
            defaults={"proficiency_level": level},
        )
        if not created:
            us.proficiency_level = level
            us.save()
        return Response(
            {"id": us.id, "skill_id": us.skill_id, "name": us.skill.name, "direction": direction,
             "proficiency_level": us.proficiency_level},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        us = UserSkill.objects.filter(id=pk, user=request.user).first()
        if not us:
            return Response(status=status.HTTP_404_NOT_FOUND)
        us.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserListView(views.APIView):
    def get(self, request):
        qs = User.objects.exclude(id=request.user.id).filter(is_active=True).prefetch_related("user_skills__skill")

        direction = request.query_params.get("direction")  # 'offered' or 'wanted'
        skill_id = request.query_params.get("skill_id")

        if direction and skill_id:
            qs = qs.filter(user_skills__direction=direction, user_skills__skill_id=skill_id).distinct()

        sort = request.query_params.get("sort", "recent")
        if sort == "rating":
            qs = qs.order_by("-avg_rating", "-rating_count")
        else:
            qs = qs.order_by("-created_at")

        users = list(qs[:100])
        payload = UserSummarySerializer(
            users, many=True, context={"request": request}
        ).data
        if sort == "match":
            payload.sort(key=lambda u: (u.get("match_score") or 0), reverse=True)
        return Response(payload)


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.filter(is_active=True).prefetch_related("user_skills__skill")
    serializer_class = UserDetailSerializer
    lookup_field = "pk"


class ExchangeListCreateView(views.APIView):
    def get(self, request):
        qs = Exchange.objects.filter(Q(proposer=request.user) | Q(recipient=request.user)).select_related(
            "proposer", "recipient", "skill_offered", "skill_wanted"
        ).prefetch_related("messages")
        return Response(ExchangeSerializer(qs, many=True, context={"request": request}).data)

    def post(self, request):
        data = dict(request.data)
        data["proposer_id"] = request.user.id
        ser = ExchangeSerializer(data=data, context={"request": request})
        ser.is_valid(raise_exception=True)
        exchange = Exchange.objects.create(
            proposer_id=ser.validated_data["proposer_id"],
            recipient_id=ser.validated_data["recipient_id"],
            skill_offered_id=ser.validated_data["skill_offered_id"],
            skill_wanted_id=ser.validated_data["skill_wanted_id"],
            proposed_duration=ser.validated_data.get("proposed_duration", 60),
            proposed_date=ser.validated_data.get("proposed_date"),
            message=ser.validated_data.get("message", ""),
        )
        return Response(
            ExchangeSerializer(exchange, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class ExchangeDetailView(views.APIView):
    def _get(self, request, pk):
        exchange = Exchange.objects.filter(pk=pk).select_related(
            "proposer", "recipient", "skill_offered", "skill_wanted"
        ).first()
        if not exchange:
            return None, Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        if exchange.proposer_id != request.user.id and exchange.recipient_id != request.user.id:
            return None, Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        return exchange, None

    def patch(self, request, pk):
        exchange, err = self._get(request, pk)
        if err:
            return err

        action = request.data.get("action")
        if action == "accept":
            if exchange.recipient_id != request.user.id:
                raise PermissionDenied("Only the recipient can accept")
            if exchange.status != "pending":
                raise ValidationError({"detail": "Only pending exchanges can be accepted"})
            exchange.status = "accepted"
        elif action == "decline":
            if exchange.recipient_id != request.user.id:
                raise PermissionDenied("Only the recipient can decline")
            if exchange.status != "pending":
                raise ValidationError({"detail": "Only pending exchanges can be declined"})
            exchange.status = "cancelled"
        elif action == "cancel":
            if exchange.proposer_id != request.user.id:
                raise PermissionDenied("Only the proposer can cancel")
            if exchange.status != "pending":
                raise ValidationError({"detail": "Only pending exchanges can be cancelled"})
            exchange.status = "cancelled"
        elif action == "complete":
            if exchange.status != "accepted":
                raise ValidationError({"detail": "Only accepted exchanges can be completed"})
            exchange.status = "completed"
        else:
            raise ValidationError({"detail": "Invalid action"})

        exchange.save()
        return Response(ExchangeSerializer(exchange, context={"request": request}).data)


class RatingCreateView(views.APIView):
    def post(self, request, pk):
        exchange = Exchange.objects.filter(pk=pk).first()
        if not exchange:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        if exchange.status != "completed":
            raise ValidationError({"detail": "Only completed exchanges can be rated"})
        if exchange.proposer_id != request.user.id and exchange.recipient_id != request.user.id:
            raise PermissionDenied("Not allowed")
        if exchange.ratings.filter(rater=request.user).exists():
            raise ValidationError({"detail": "You have already rated this exchange"})

        ratee_id = exchange.proposer_id if exchange.recipient_id == request.user.id else exchange.recipient_id
        ser = RatingSerializer(data={"exchange_id": exchange.id, "stars": request.data.get("stars")})
        ser.is_valid(raise_exception=True)

        rating = Rating.objects.create(
            exchange=exchange,
            rater=request.user,
            ratee_id=ratee_id,
            stars=int(request.data["stars"]),
            feedback=request.data.get("feedback", "")[:200],
        )
        return Response(RatingSerializer(rating).data, status=status.HTTP_201_CREATED)


class MessageListView(views.APIView):
    def get(self, request, pk):
        exchange = Exchange.objects.filter(pk=pk).first()
        if not exchange:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        if exchange.proposer_id != request.user.id and exchange.recipient_id != request.user.id:
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        Message.objects.filter(exchange=exchange, recipient=request.user, read=False).update(read=True)
        return Response(MessageSerializer(exchange.messages.select_related("sender"), many=True).data)

    def post(self, request, pk):
        exchange = Exchange.objects.filter(pk=pk).first()
        if not exchange:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        if exchange.proposer_id != request.user.id and exchange.recipient_id != request.user.id:
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        content = request.data.get("content", "").strip()
        if not content:
            raise ValidationError({"content": "Message cannot be empty"})
        msg = Message.objects.create(
            exchange=exchange,
            sender=request.user,
            recipient=exchange.recipient if exchange.proposer_id == request.user.id else exchange.proposer,
            content=content,
        )
        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)


class UnreadCountView(views.APIView):
    def get(self, request):
        unread = (
            Message.objects.filter(recipient=request.user, read=False)
            .values("exchange_id")
            .distinct()
            .count()
        )
        pending = Exchange.objects.filter(recipient=request.user, status="pending").count()
        return Response({"unread_messages": unread, "pending_exchanges": pending})


class LeaderboardView(views.APIView):
    def get(self, request):
        users = (
            User.objects.filter(is_active=True)
            .annotate(
                completed=models.Count(
                    "proposed_exchanges", filter=models.Q(proposed_exchanges__status="completed")
                )
                + models.Count(
                    "received_exchanges", filter=models.Q(received_exchanges__status="completed")
                )
            )
            .order_by("-avg_rating", "-rating_count")
        )
        rows = [
            {
                "rank": i + 1,
                "user": UserSummarySerializer(u, context={"request": request}).data,
                "avg_rating": u.avg_rating,
                "rating_count": u.rating_count,
                "completed_exchanges": u.completed,
            }
            for i, u in enumerate(users[:50])
        ]
        return Response(rows)


from django.db import models  # noqa: E402