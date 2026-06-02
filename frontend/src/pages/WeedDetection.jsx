import { Download, Leaf, ShieldCheck } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader.jsx";
import UploadPanel from "../components/UploadPanel.jsx";
import api, { enhancedDownloadUrl, mediaUrl } from "../services/api.js";

export default function WeedDetection() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const { data } = await api.post("/vision/predict", form);
      setResult(data);
      toast.success(data.blur.is_blurry ? "Blurry image enhanced before prediction" : "Prediction completed");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const prediction = result?.prediction;

  return (
    <div>
      <PageHeader
        title="Weed Detection"
        subtitle="Upload a field image. Blurry images are enhanced first, then the saved ViT checkpoint predicts the weed class."
      />
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <UploadPanel file={file} setFile={setFile} onSubmit={analyze} loading={loading} />
        <div className="panel-card">
          {!result ? (
            <div className="grid min-h-64 place-items-center text-center text-slate-500 sm:min-h-80">
              <div>
                <Leaf className="mx-auto mb-3 text-field-600" size={42} />
                <p className="font-semibold text-slate-700">Prediction output will appear here</p>
                <p className="mt-1 text-sm">Class, confidence, blur score, and herbicide mapping.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <img src={mediaUrl(result.image_url)} alt="Uploaded weed" className="h-56 w-full rounded-lg object-cover sm:h-64" />
                <img src={mediaUrl(result.prediction_image_url)} alt="Prediction input" className="h-56 w-full rounded-lg object-cover sm:h-64" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Metric title="Prediction" value={prediction.predicted_class} />
                <Metric title="Confidence" value={`${prediction.confidence_percent}%`} />
                <Metric title="Blur Score" value={result.blur.blur_score} />
              </div>
              {result.enhancement && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="font-semibold text-amber-900">Image enhancement applied</p>
                  <p className="mt-1 text-sm text-amber-800">Engine: {result.enhancement.engine}. Enhanced blur score: {result.enhancement.enhanced_blur_score}</p>
                  <a href={enhancedDownloadUrl(result.enhancement.enhanced_url)} download className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white sm:w-auto">
                    <Download size={16} /> Download enhanced image
                  </a>
                </div>
              )}
              <div className="rounded-lg border border-field-100 bg-field-50/80 p-4">
                <p className="flex items-center gap-2 font-semibold text-field-700"><ShieldCheck size={18} /> Herbicide recommendation</p>
                <p className="mt-2 text-sm text-slate-700">
                  {result.recommendation.found ? result.recommendation.herbicide_text : result.recommendation.message}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <div className="rounded-lg border border-field-100 bg-white/70 p-4 shadow-sm backdrop-blur">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 break-words text-lg font-bold text-slate-950 sm:text-xl">{value}</p>
    </div>
  );
}
