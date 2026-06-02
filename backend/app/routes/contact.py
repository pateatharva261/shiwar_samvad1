from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from backend.app.database import repository
from backend.app.schemas import ContactRequest


router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("")
async def contact(payload: ContactRequest):
    data = payload.model_dump()
    data["created_at"] = datetime.now(timezone.utc)
    try:
        await repository.save_contact(data)
    except Exception:
        return {"status": "received", "stored": False, "message": "Contact message received locally."}
    return {"status": "received", "stored": True}
