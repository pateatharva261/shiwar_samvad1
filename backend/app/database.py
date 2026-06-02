import asyncio
from typing import Any

from bson import ObjectId

from backend.app.core.config import get_settings

try:
    from motor.motor_asyncio import AsyncIOMotorClient
except Exception:  # pragma: no cover - optional runtime dependency
    AsyncIOMotorClient = None

try:
    from pymongo import MongoClient
except Exception:  # pragma: no cover - optional runtime dependency
    MongoClient = None


class MongoRepository:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._async_client: Any = None
        self._sync_client: Any = None
        self.db: Any = None
        self.is_async = False
        self.ready = False

    async def connect(self) -> None:
        if AsyncIOMotorClient is not None:
            self._async_client = AsyncIOMotorClient(self.settings.mongodb_url, serverSelectionTimeoutMS=2500)
            self.db = self._async_client[self.settings.mongodb_db]
            self.is_async = True
            await self._async_client.admin.command("ping")
            self.ready = True
            return

        if MongoClient is None:
            raise RuntimeError("Install motor or pymongo to use MongoDB authentication.")

        self._sync_client = MongoClient(self.settings.mongodb_url, serverSelectionTimeoutMS=2500)
        await asyncio.to_thread(self._sync_client.admin.command, "ping")
        self.db = self._sync_client[self.settings.mongodb_db]
        self.is_async = False
        self.ready = True

    async def close(self) -> None:
        client = self._async_client or self._sync_client
        if client is not None:
            client.close()
        self.ready = False

    def ensure_ready(self) -> None:
        if not self.ready or self.db is None:
            raise RuntimeError("MongoDB is not connected. Start MongoDB or update MONGODB_URL in .env.")

    async def find_user_by_email(self, email: str) -> dict[str, Any] | None:
        self.ensure_ready()
        query = {"email": email.lower()}
        if self.is_async:
            return await self.db.users.find_one(query)
        return await asyncio.to_thread(self.db.users.find_one, query)

    async def find_user_by_id(self, user_id: str) -> dict[str, Any] | None:
        self.ensure_ready()
        if not ObjectId.is_valid(user_id):
            return None
        query = {"_id": ObjectId(user_id)}
        if self.is_async:
            return await self.db.users.find_one(query)
        return await asyncio.to_thread(self.db.users.find_one, query)

    async def create_user(self, payload: dict[str, Any]) -> dict[str, Any]:
        self.ensure_ready()
        if self.is_async:
            result = await self.db.users.insert_one(payload)
        else:
            result = await asyncio.to_thread(self.db.users.insert_one, payload)
        payload["_id"] = result.inserted_id
        return payload

    async def save_contact(self, payload: dict[str, Any]) -> None:
        self.ensure_ready()
        if self.is_async:
            await self.db.contacts.insert_one(payload)
        else:
            await asyncio.to_thread(self.db.contacts.insert_one, payload)


repository = MongoRepository()
