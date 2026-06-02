from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import FileResponse

from backend.app.core.config import get_settings
from backend.app.services.enhancement_service import enhance_image, is_blurry
from backend.app.services.herbicide_service import get_herbicide_details
from backend.app.services.vit_service import vit_detector


router = APIRouter(prefix="/vision", tags=["Weed Detection"])


async def _save_upload(file: UploadFile) -> Path:
    settings = get_settings()
    suffix = Path(file.filename or "image.jpg").suffix.lower() or ".jpg"
    if suffix not in {".jpg", ".jpeg", ".png", ".webp", ".bmp"}:
        raise HTTPException(status_code=400, detail="Upload a valid image file.")
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    destination = settings.upload_dir / f"{uuid4().hex}{suffix}"
    destination.write_bytes(await file.read())
    return destination


def _get_enhanced_file(filename: str) -> Path:
    settings = get_settings()
    safe_name = Path(filename).name
    if not filename or safe_name != filename:
        raise HTTPException(status_code=400, detail="Invalid enhanced image file name.")

    settings.enhanced_dir.mkdir(parents=True, exist_ok=True)
    enhanced_dir = settings.enhanced_dir.resolve()
    file_path = (settings.enhanced_dir / safe_name).resolve()

    try:
        file_path.relative_to(enhanced_dir)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid enhanced image path.") from exc

    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="Enhanced image not found.")
    return file_path


@router.post("/blur-check")
async def blur_check(file: UploadFile = File(...)):
    image_path = await _save_upload(file)
    blurry, blur_score = await run_in_threadpool(is_blurry, image_path)
    return {"is_blurry": blurry, "blur_score": round(blur_score, 2), "image_url": f"/uploads/{image_path.name}"}


@router.post("/enhance")
async def enhance(file: UploadFile = File(...)):
    image_path = await _save_upload(file)
    blurry, blur_score = await run_in_threadpool(is_blurry, image_path)
    enhanced_path = get_settings().enhanced_dir / f"{image_path.stem}_enhanced.png"
    enhancement = await run_in_threadpool(enhance_image, image_path, enhanced_path)
    after_blurry, after_score = await run_in_threadpool(is_blurry, enhanced_path)
    return {
        "original_url": f"/uploads/{image_path.name}",
        "enhanced_url": f"/uploads/enhanced/{enhanced_path.name}",
        "is_blurry": blurry,
        "blur_score": round(blur_score, 2),
        "enhanced_blur_score": round(after_score, 2),
        "enhancement_status": "enhanced",
        "engine": enhancement["engine"],
        "fallback_reason": enhancement.get("fallback_reason"),
        "processing_seconds": enhancement.get("processing_seconds"),
        "still_blurry": after_blurry,
    }


@router.get("/download/enhanced/{filename}")
async def download_enhanced(filename: str):
    file_path = _get_enhanced_file(filename)
    return FileResponse(
        path=file_path,
        filename=file_path.name,
        media_type="application/octet-stream",
    )


@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_path = await _save_upload(file)
    blurry, blur_score = await run_in_threadpool(is_blurry, image_path)
    prediction_path = image_path
    enhancement_payload = None

    if blurry:
        enhanced_path = get_settings().enhanced_dir / f"{image_path.stem}_enhanced.png"
        enhancement = await run_in_threadpool(enhance_image, image_path, enhanced_path)
        prediction_path = enhanced_path
        _, enhanced_score = await run_in_threadpool(is_blurry, enhanced_path)
        enhancement_payload = {
            "original_url": f"/uploads/{image_path.name}",
            "enhanced_url": f"/uploads/enhanced/{enhanced_path.name}",
            "engine": enhancement["engine"],
            "fallback_reason": enhancement.get("fallback_reason"),
            "processing_seconds": enhancement.get("processing_seconds"),
            "enhanced_blur_score": round(enhanced_score, 2),
        }

    try:
        prediction = await run_in_threadpool(vit_detector.predict, prediction_path)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc

    recommendation = get_herbicide_details(prediction["predicted_class"])
    return {
        "image_url": f"/uploads/{image_path.name}",
        "prediction_image_url": f"/uploads/enhanced/{prediction_path.name}" if prediction_path != image_path else f"/uploads/{image_path.name}",
        "blur": {"is_blurry": blurry, "blur_score": round(blur_score, 2), "threshold": get_settings().blur_threshold},
        "enhancement": enhancement_payload,
        "prediction": prediction,
        "recommendation": recommendation,
    }
