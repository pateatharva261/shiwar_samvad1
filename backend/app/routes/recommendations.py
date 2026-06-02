from fastapi import APIRouter

from backend.app.schemas import CostRequest, DosageRequest, HerbicideRequest
from backend.app.services.calculator_service import build_cost_estimate, build_dosage_recommendation
from backend.app.services.herbicide_service import HERBICIDE_DATA, get_herbicide_details


router = APIRouter(prefix="/agri", tags=["Agriculture Intelligence"])


@router.get("/weeds")
async def weed_catalog():
    return {"weeds": list(HERBICIDE_DATA.keys())}


@router.post("/herbicide")
async def herbicide(payload: HerbicideRequest):
    return get_herbicide_details(payload.weed_type)


@router.post("/dosage")
async def dosage(payload: DosageRequest):
    return build_dosage_recommendation(payload)


@router.post("/cost")
async def cost(payload: CostRequest):
    return build_cost_estimate(payload)
