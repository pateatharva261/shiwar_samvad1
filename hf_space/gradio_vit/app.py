import os

import gradio as gr
import torch
import torch.nn.functional as F
from PIL import Image
from transformers import ViTForImageClassification, ViTImageProcessor


MODEL_REF = os.getenv("VIT_MODEL_REF", "Atharva2023254/vit_coco_weed")
MODEL_SUBFOLDER = os.getenv("VIT_MODEL_SUBFOLDER", "checkpoint-908")
HF_TOKEN = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.0"))

model = None
processor = None
device = None


def load_model() -> None:
    global model, processor, device
    if model is not None and processor is not None:
        return

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    kwargs = {}
    if HF_TOKEN:
        kwargs["token"] = HF_TOKEN
    if MODEL_SUBFOLDER:
        kwargs["subfolder"] = MODEL_SUBFOLDER

    processor = ViTImageProcessor.from_pretrained(MODEL_REF, **kwargs)
    model = ViTForImageClassification.from_pretrained(MODEL_REF, **kwargs)
    model.to(device)
    model.eval()


def predict(image: Image.Image) -> dict:
    if image is None:
        raise gr.Error("Upload an image first.")

    load_model()
    image = image.convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    inputs = {key: value.to(device) for key, value in inputs.items()}

    with torch.no_grad():
        logits = model(**inputs).logits
        probabilities = F.softmax(logits, dim=-1).squeeze(0)

    predicted_id = int(probabilities.argmax(dim=-1).item())
    confidence = float(probabilities[predicted_id].item())
    predicted_class = model.config.id2label[predicted_id]

    top_predictions = []
    top_values, top_ids = torch.topk(probabilities, k=min(3, probabilities.shape[0]))
    for score, class_id in zip(top_values.tolist(), top_ids.tolist(), strict=False):
        top_predictions.append(
            {
                "label": model.config.id2label[int(class_id)],
                "confidence": round(float(score), 4),
            }
        )

    is_non_weed = predicted_class.lower() == "non-weed"
    if is_non_weed:
        status = "non_weed"
    elif confidence < CONFIDENCE_THRESHOLD:
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
        "device": str(device),
        "model_ref": MODEL_REF,
        "model_subfolder": MODEL_SUBFOLDER,
        "threshold": CONFIDENCE_THRESHOLD,
    }


demo = gr.Interface(
    fn=predict,
    inputs=gr.Image(type="pil", label="Weed image"),
    outputs=gr.JSON(label="Prediction"),
    title="ViT Weed Detection",
    api_name="predict",
)


if __name__ == "__main__":
    demo.launch()
