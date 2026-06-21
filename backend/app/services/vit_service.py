from pathlib import Path
import sys
import time

from backend.app.core.config import get_settings


class ViTWeedDetector:

    def __init__(self):

        self.settings = get_settings()

        self.model = None
        self.processor = None
        self.device = None

        self._torch = None
        self._functional = None

        self.client = None

    def predict_remote(self, image_path: str | Path) -> dict:

        from gradio_client import Client, handle_file

        if self.client is None:
            print("Connecting to HuggingFace Space...")
            self.client = Client(self.settings.vit_predict_url)

        last_error = None

        for attempt in range(3):

            try:

                result = self.client.predict(
                    handle_file(str(image_path)),
                    api_name="/predict",
                )

                if not isinstance(result, dict):
                    raise ValueError(
                        f"Unexpected response: {result}"
                    )

                return result

            except Exception as e:

                print(f"Retry {attempt+1}/3 : {e}")

                last_error = e

                time.sleep(5)

        raise RuntimeError(f"Prediction failed: {last_error}")

    def load(self):

        if self.model is not None and self.processor is not None:
            return

        if (
            self.settings.ml_site_packages
            and self.settings.ml_site_packages.exists()
        ):

            ml_path = str(self.settings.ml_site_packages)

            if ml_path not in sys.path:
                sys.path.insert(0, ml_path)

        import torch
        import torch.nn.functional as F

        from transformers import (
            ViTForImageClassification,
            ViTImageProcessor,
        )

        self._torch = torch
        self._functional = F

        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        model_ref = (
            self.settings.vit_model_ref
            or str(self.settings.vit_model_dir)
        )

        kwargs = {}

        hf_token = (
            self.settings.huggingface_token
            or self.settings.hf_token
        )

        if hf_token:
            kwargs["token"] = hf_token

        if (
            self.settings.vit_model_ref
            and self.settings.vit_model_subfolder
        ):
            kwargs["subfolder"] = (
                self.settings.vit_model_subfolder
            )

        self.processor = ViTImageProcessor.from_pretrained(
            model_ref,
            **kwargs,
        )

        self.model = ViTForImageClassification.from_pretrained(
            model_ref,
            **kwargs,
        )

        self.model.to(self.device)

        self.model.eval()

    def predict(self, image_path):

        if self.settings.vit_predict_url:
            return self.predict_remote(image_path)

        self.load()

        from PIL import Image

        image = Image.open(image_path).convert("RGB")

        inputs = self.processor(
            images=image,
            return_tensors="pt",
        )

        inputs = {
            k: v.to(self.device)
            for k, v in inputs.items()
        }

        with self._torch.no_grad():

            logits = self.model(**inputs).logits

            probs = self._functional.softmax(
                logits,
                dim=-1,
            ).squeeze(0)

        predicted_id = int(
            probs.argmax(dim=-1).item()
        )

        confidence = float(
            probs[predicted_id].item()
        )

        predicted_class = self.model.config.id2label[
            predicted_id
        ]

        top_predictions = []

        values, ids = self._torch.topk(
            probs,
            k=min(3, probs.shape[0]),
        )

        for score, idx in zip(
            values.tolist(),
            ids.tolist(),
        ):

            top_predictions.append(

                {
                    "label": self.model.config.id2label[
                        int(idx)
                    ],
                    "confidence": round(
                        float(score),
                        4,
                    ),
                }

            )

        is_non_weed = (
            predicted_class.lower() == "non-weed"
        )

        if is_non_weed:
            status = "non_weed"

        elif confidence < self.settings.confidence_threshold:
            status = "low_confidence"

        else:
            status = "weed_detected"

        return {

            "predicted_class": predicted_class,

            "confidence": round(
                confidence,
                4,
            ),

            "confidence_percent": round(
                confidence * 100,
                2,
            ),

            "status": status,

            "is_non_weed": is_non_weed,

            "top_predictions": top_predictions,

            "device": str(self.device),

            "model_ref": (
                self.settings.vit_model_ref
                or str(self.settings.vit_model_dir)
            ),

            "model_subfolder": self.settings.vit_model_subfolder,

            "threshold": self.settings.confidence_threshold,
        }


vit_detector = ViTWeedDetector()
