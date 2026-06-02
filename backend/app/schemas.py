from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    language: Literal["English", "Hindi", "Marathi"] = "English"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    name: str
    email: EmailStr
    language: str = "English"
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class HerbicideRequest(BaseModel):
    weed_type: str


class DosageRequest(BaseModel):
    weed_type: str
    crop_type: str
    land_area: float = Field(gt=0, description="Land area in acres")
    weather: str
    severity: Literal["Low", "Medium", "High"]
    application_timing: str


class CostRequest(BaseModel):
    crop_type: str
    weather: str
    land_area: float = Field(gt=0)
    application_time: str
    herbicide_type: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=3000)
    language: Literal["English", "Hindi", "Marathi"] = "English"
    context: dict | None = None


class ContactRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    phone: str = Field(default="", max_length=30)
    message: str = Field(min_length=5, max_length=2000)
