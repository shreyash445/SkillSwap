import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.exchange_id = self.scope["url_route"]["kwargs"]["exchange_id"]
        self.room_group_name = f"chat_{self.exchange_id}"
        self.user = self.scope.get("user", AnonymousUser())

        if self.user.is_anonymous:
            await self.close()
            return

        is_participant = await self.check_participant()
        if not is_participant:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        content = data.get("content", "").strip()

        if not content:
            return

        message = await self.save_message(content)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": {
                    "id": str(message.id),
                    "exchange_id": str(self.exchange_id),
                    "sender": str(self.user.id),
                    "sender_name": self.user.full_name,
                    "recipient": str(message.recipient_id),
                    "content": message.content,
                    "read": False,
                    "created_at": message.created_at.isoformat(),
                },
            },
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))

    @database_sync_to_async
    def check_participant(self):
        from .models import Exchange

        exchange = Exchange.objects.filter(id=self.exchange_id).first()
        if not exchange:
            return False
        return exchange.proposer_id == self.user.id or exchange.recipient_id == self.user.id

    @database_sync_to_async
    def save_message(self, content):
        from .models import Exchange, Message

        exchange = Exchange.objects.filter(id=self.exchange_id).first()
        recipient = (
            exchange.recipient
            if exchange.proposer_id == self.user.id
            else exchange.proposer
        )
        return Message.objects.create(
            exchange=exchange,
            sender=self.user,
            recipient=recipient,
            content=content,
        )
