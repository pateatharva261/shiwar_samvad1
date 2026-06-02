from pathlib import Path
import sys

from backend.app.core.config import get_settings


class ViTWeedDetector:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.model = None
        self.processor = None
        self.device = None
        self._torch = None
        self._functional = None

    def predict_remote(self, image_path: str | Path) -> dict:
        if self.settings.vit_predict_url.rstrip("/").endswith("/predict"):
            import requests

            image_path = Path(image_path)
            with image_path.open("rb") as image_file:
                response = requests.post(
                    self.settings.vit_predict_url,
                    files={"file": (image_path.name, image_file, "application/octet-stream")},
                    timeout=180,
                )
            response.raise_for_status()
            return response.json()

        from gradio_client import Client, handle_file

        client = Client(self.settings.vit_predict_url)
        result = client.predict(handle_file(str(image_path)), api_name="/predict")
        if not isinstance(result, dict):
            raise ValueError(f"Unexpected remote prediction response: {result!r}")
        return result

    def load(self) -> None:
        if self.model is not None and self.processor is not None:
            return
        if self.settings.ml_site_packages and self.settings.ml_site_packages.exists():
            ml_path = str(self.settings.ml_site_packages)
            if ml_path not in sys.path:
                sys.path.insert(0, ml_path)
        import torch
        import torch.nn.functional as F
        from transformers import ViTForImageClassification, ViTImageProcessor

        self._torch = torch
        self._functional = F
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model_ref = self.settings.vit_model_ref or str(self.settings.vit_model_dir)
        pretrained_kwargs = {}
        hf_token = self.settings.huggingface_token or self.settings.hf_token
        if hf_token:
            pretrained_kwargs["token"] = hf_token
        if self.settings.vit_model_ref and self.settings.vit_model_subfolder:
            pretrained_kwargs["subfolder"] = self.settings.vit_model_subfolder
        self.processor = ViTImageProcessor.from_pretrained(model_ref, **pretrained_kwargs)
        self.model = ViTForImageClassification.from_pretrained(model_ref, **pretrained_kwargs)
        self.model.to(self.device)
        self.model.eval()

    def predict(self, image_path: str | Path) -> dict:
        if self.settings.vit_predict_url:
            return self.predict_remote(image_path)

        self.load()
        assert self.model is not None
        assert self.processor is not None
        assert self._torch is not None
        assert self._functional is not None
        from PIL import Image

        image = Image.open(image_path).convert("RGB")
        inputs = self.processor(images=image, return_tensors="pt")
        inputs = {key: value.to(self.device) for key, value in inputs.items()}

        with self._torch.no_grad():
            logits = self.model(**inputs).logits
            probabilities = self._functional.softmax(logits, dim=-1).squeeze(0)

        predicted_id = int(probabilities.argmax(dim=-1).item())
        confidence = float(probabilities[predicted_id].item())
        predicted_class = self.model.config.id2label[predicted_id]
        top_predictions = []
        top_values, top_ids = self._torch.topk(probabilities, k=min(3, probabilities.shape[0]))
        for score, class_id in zip(top_values.tolist(), top_ids.tolist(), strict=False):
            top_predictions.append(
                {
                    "label": self.model.config.id2label[int(class_id)],
                    "confidence": round(float(score), 4),
                }
            )

        is_non_weed = predicted_class.lower() == "non-weed"
        if is_non_weed:
            status = "non_weed"
        elif confidence < self.settings.confidence_threshold:
            status = "low_confidence"
        else:
            status = "weed_detected"

        return {
            "predicted_class": predicted_class,
            "confidence": round(confidence, 4),
            "confidence_percent": round(confidence * 100, 2),
            "status": status,
            "is_non_weed": is_non_weed,
            "top_predictions": top_predictions,
            "device": str(self.device),
            "model_ref": self.settings.vit_model_ref or str(self.settings.vit_model_dir),
            "model_subfolder": self.settings.vit_model_subfolder,
            "threshold": self.settings.confidence_threshold,
        }


vit_detector = ViTWeedDetector()
