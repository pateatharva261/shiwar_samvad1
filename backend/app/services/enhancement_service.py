import shutil
import site
import sys
import threading
from time import perf_counter
import zipfile
from pathlib import Path

import cv2
import numpy as np

from backend.app.core.config import get_settings


_ESRGAN_MODEL = None
_ESRGAN_DEVICE = None
_ESRGAN_MODEL_PATH: Path | None = None
_ESRGAN_LOCK = threading.Lock()
_ESRGAN_SCALE = 4
_ESRGAN_TILE_SIZE = 256
_ESRGAN_TILE_PAD = 24
_CUDA_AVAILABLE: bool | None = None


def is_blurry(image_path: str | Path, threshold: float | None = None) -> tuple[bool, float]:
    settings = get_settings()
    effective_threshold = settings.blur_threshold if threshold is None else threshold
    image = cv2.imread(str(image_path))
    if image is None:
        raise ValueError("Unable to read uploaded image for blur detection.")
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    return bool(blur_score < effective_threshold), float(blur_score)


def _ensure_ml_import_paths() -> None:
    user_site = site.getusersitepackages()
    if user_site and user_site not in sys.path:
        sys.path.insert(0, user_site)

    settings = get_settings()
    if settings.ml_site_packages and settings.ml_site_packages.exists():
        ml_path = str(settings.ml_site_packages)
        if ml_path not in sys.path:
            sys.path.append(ml_path)


def materialize_realesrgan_checkpoint() -> Path | None:
    settings = get_settings()
    source = settings.realesrgan_archive_dir

    if source.is_file():
        return source

    archive_dir = source / "archive"
    data_pkl = archive_dir / "data.pkl"
    if not data_pkl.exists():
        return None

    target = settings.materialized_esrgan_path
    if target.exists() and target.stat().st_size > 0 and target.stat().st_mtime >= data_pkl.stat().st_mtime:
        return target

    target.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_STORED) as zf:
        for path in archive_dir.rglob("*"):
            if path.is_file():
                zf.write(path, Path("archive") / path.relative_to(archive_dir))
    return target


def _cuda_available() -> bool:
    global _CUDA_AVAILABLE
    if _CUDA_AVAILABLE is not None:
        return _CUDA_AVAILABLE

    try:
        _ensure_ml_import_paths()
        import torch

        _CUDA_AVAILABLE = bool(torch.cuda.is_available())
    except Exception:
        _CUDA_AVAILABLE = False
    return _CUDA_AVAILABLE


def _resize_to_limits(image: np.ndarray, max_side: int, max_pixels: int | None = None) -> tuple[np.ndarray, float]:
    height, width = image.shape[:2]
    scale = 1.0
    if max_side > 0:
        scale = min(scale, max_side / max(height, width))
    if max_pixels and max_pixels > 0 and height * width > max_pixels:
        scale = min(scale, (max_pixels / float(height * width)) ** 0.5)

    if scale >= 1.0:
        return image, 1.0

    resized = cv2.resize(
        image,
        (max(1, int(width * scale)), max(1, int(height * scale))),
        interpolation=cv2.INTER_AREA,
    )
    return resized, scale


def _enhance_with_opencv(input_path: Path, output_path: Path, fallback_reason: str | None = None) -> dict:
    settings = get_settings()
    image = cv2.imread(str(input_path), cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Unable to read uploaded image for enhancement.")

    height, width = image.shape[:2]
    max_output_side = max(1, settings.enhancement_max_output_side)
    scale = min(2.0, max_output_side / max(height, width))
    if abs(scale - 1.0) > 0.01:
        interpolation = cv2.INTER_CUBIC if scale > 1.0 else cv2.INTER_AREA
        working = cv2.resize(
            image,
            (max(1, int(width * scale)), max(1, int(height * scale))),
            interpolation=interpolation,
        )
    else:
        working = image.copy()

    lab = cv2.cvtColor(working, cv2.COLOR_BGR2LAB)
    lightness, channel_a, channel_b = cv2.split(lab)
    lightness = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(lightness)
    contrast_boosted = cv2.cvtColor(cv2.merge((lightness, channel_a, channel_b)), cv2.COLOR_LAB2BGR)
    blurred = cv2.GaussianBlur(contrast_boosted, (0, 0), 0.9)
    sharpened = cv2.addWeighted(contrast_boosted, 1.75, blurred, -0.75, 0)
    cv2.imwrite(str(output_path), sharpened)

    result = {"engine": "OpenCV fast enhancement", "path": str(output_path), "output_scale": round(scale, 3)}
    if fallback_reason:
        result["fallback_reason"] = fallback_reason
    return result


def _build_rrdbnet(torch):
    nn = torch.nn
    functional = torch.nn.functional

    class ResidualDenseBlock(nn.Module):
        def __init__(self, num_feat: int = 64, num_grow_ch: int = 32):
            super().__init__()
            self.conv1 = nn.Conv2d(num_feat, num_grow_ch, 3, 1, 1)
            self.conv2 = nn.Conv2d(num_feat + num_grow_ch, num_grow_ch, 3, 1, 1)
            self.conv3 = nn.Conv2d(num_feat + 2 * num_grow_ch, num_grow_ch, 3, 1, 1)
            self.conv4 = nn.Conv2d(num_feat + 3 * num_grow_ch, num_grow_ch, 3, 1, 1)
            self.conv5 = nn.Conv2d(num_feat + 4 * num_grow_ch, num_feat, 3, 1, 1)
            self.lrelu = nn.LeakyReLU(negative_slope=0.2, inplace=True)

        def forward(self, x):
            x1 = self.lrelu(self.conv1(x))
            x2 = self.lrelu(self.conv2(torch.cat((x, x1), 1)))
            x3 = self.lrelu(self.conv3(torch.cat((x, x1, x2), 1)))
            x4 = self.lrelu(self.conv4(torch.cat((x, x1, x2, x3), 1)))
            x5 = self.conv5(torch.cat((x, x1, x2, x3, x4), 1))
            return x5 * 0.2 + x

    class RRDB(nn.Module):
        def __init__(self, num_feat: int = 64, num_grow_ch: int = 32):
            super().__init__()
            self.rdb1 = ResidualDenseBlock(num_feat, num_grow_ch)
            self.rdb2 = ResidualDenseBlock(num_feat, num_grow_ch)
            self.rdb3 = ResidualDenseBlock(num_feat, num_grow_ch)

        def forward(self, x):
            out = self.rdb1(x)
            out = self.rdb2(out)
            out = self.rdb3(out)
            return out * 0.2 + x

    class RRDBNet(nn.Module):
        def __init__(self, num_block: int = 23, num_feat: int = 64, num_grow_ch: int = 32):
            super().__init__()
            self.conv_first = nn.Conv2d(3, num_feat, 3, 1, 1)
            self.body = nn.Sequential(*[RRDB(num_feat, num_grow_ch) for _ in range(num_block)])
            self.conv_body = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
            self.conv_up1 = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
            self.conv_up2 = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
            self.conv_hr = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
            self.conv_last = nn.Conv2d(num_feat, 3, 3, 1, 1)
            self.lrelu = nn.LeakyReLU(negative_slope=0.2, inplace=True)

        def forward(self, x):
            feat = self.conv_first(x)
            body_feat = self.conv_body(self.body(feat))
            feat = feat + body_feat
            feat = self.lrelu(self.conv_up1(functional.interpolate(feat, scale_factor=2, mode="nearest")))
            feat = self.lrelu(self.conv_up2(functional.interpolate(feat, scale_factor=2, mode="nearest")))
            return self.conv_last(self.lrelu(self.conv_hr(feat)))

    return RRDBNet()


def _load_realesrgan_model(model_path: Path):
    global _ESRGAN_DEVICE, _ESRGAN_MODEL, _ESRGAN_MODEL_PATH

    if _ESRGAN_MODEL is not None and _ESRGAN_MODEL_PATH == model_path:
        return _ESRGAN_MODEL, _ESRGAN_DEVICE

    _ensure_ml_import_paths()
    import torch

    checkpoint = torch.load(model_path, map_location="cpu")
    state_dict = checkpoint.get("params_ema") or checkpoint.get("params") or checkpoint

    model = _build_rrdbnet(torch)
    model.load_state_dict(state_dict, strict=True)
    _ESRGAN_DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(_ESRGAN_DEVICE)
    model.eval()

    _ESRGAN_MODEL = model
    _ESRGAN_MODEL_PATH = model_path
    return _ESRGAN_MODEL, _ESRGAN_DEVICE


def _run_esrgan_tile(model, tensor, y0: int, y1: int, x0: int, x1: int, tile_pad: int, scale: int):
    _, _, height, width = tensor.shape
    pad_y0 = max(y0 - tile_pad, 0)
    pad_y1 = min(y1 + tile_pad, height)
    pad_x0 = max(x0 - tile_pad, 0)
    pad_x1 = min(x1 + tile_pad, width)

    tile = tensor[:, :, pad_y0:pad_y1, pad_x0:pad_x1]
    output = model(tile).clamp_(0, 1)

    crop_y0 = (y0 - pad_y0) * scale
    crop_y1 = crop_y0 + (y1 - y0) * scale
    crop_x0 = (x0 - pad_x0) * scale
    crop_x1 = crop_x0 + (x1 - x0) * scale
    return output[:, :, crop_y0:crop_y1, crop_x0:crop_x1]


def _enhance_with_local_realesrgan(input_path: Path, output_path: Path, model_path: Path) -> None:
    _ensure_ml_import_paths()
    import torch

    image = cv2.imread(str(input_path), cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Unable to read uploaded image for Real-ESRGAN enhancement.")

    settings = get_settings()
    image, _ = _resize_to_limits(image, settings.realesrgan_max_input_side, settings.realesrgan_max_input_pixels)
    model, device = _load_realesrgan_model(model_path)
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    tensor = torch.from_numpy(np.transpose(rgb, (2, 0, 1))).float().unsqueeze(0) / 255.0
    tensor = tensor.to(device)

    _, channels, height, width = tensor.shape
    output = np.zeros((height * _ESRGAN_SCALE, width * _ESRGAN_SCALE, channels), dtype=np.uint8)

    with torch.inference_mode():
        for y0 in range(0, height, _ESRGAN_TILE_SIZE):
            y1 = min(y0 + _ESRGAN_TILE_SIZE, height)
            for x0 in range(0, width, _ESRGAN_TILE_SIZE):
                x1 = min(x0 + _ESRGAN_TILE_SIZE, width)
                tile = _run_esrgan_tile(
                    model,
                    tensor,
                    y0,
                    y1,
                    x0,
                    x1,
                    _ESRGAN_TILE_PAD,
                    _ESRGAN_SCALE,
                )
                tile_image = tile.squeeze(0).permute(1, 2, 0).cpu().numpy()
                tile_image = (tile_image * 255.0).round().astype(np.uint8)
                output[y0 * _ESRGAN_SCALE:y1 * _ESRGAN_SCALE, x0 * _ESRGAN_SCALE:x1 * _ESRGAN_SCALE] = tile_image

    output_image = cv2.cvtColor(output, cv2.COLOR_RGB2BGR)
    cv2.imwrite(str(output_path), output_image)


def enhance_image(input_path: str | Path, output_path: str | Path) -> dict:
    """Enhance an image with the configured Real-ESRGAN checkpoint, with OpenCV as a last-resort fallback."""
    started_at = perf_counter()
    input_path = Path(input_path)
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    settings = get_settings()
    model_path = materialize_realesrgan_checkpoint()

    try:
        if model_path is None:
            raise RuntimeError("Real-ESRGAN checkpoint archive was not found.")

        if not _cuda_available() and not settings.realesrgan_cpu_enabled:
            return _enhance_with_opencv(
                input_path,
                output_path,
                "Real-ESRGAN was skipped because CUDA is unavailable and CPU mode is too slow for requests.",
            ) | {"processing_seconds": round(perf_counter() - started_at, 2)}

        with _ESRGAN_LOCK:
            _enhance_with_local_realesrgan(input_path, output_path, model_path)
        return {
            "engine": "Real-ESRGAN",
            "path": str(output_path),
            "model_path": str(model_path),
            "processing_seconds": round(perf_counter() - started_at, 2),
        }
    except Exception as exc:
        result = _enhance_with_opencv(input_path, output_path, str(exc))
        result["processing_seconds"] = round(perf_counter() - started_at, 2)
        return result


def copy_static_image(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)
