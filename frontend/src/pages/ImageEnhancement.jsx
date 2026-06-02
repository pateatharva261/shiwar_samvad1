import { Download, ImageUp } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader.jsx";
import UploadPanel from "../components/UploadPanel.jsx";
import api, { enhancedDownloadUrl, mediaUrl } from "../services/api.js";

export default function ImageEnhancement() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const enhance = async () => {
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const { data } = await api.post("/vision/enhance", form);
      setResult(data);
      toast.success("Enhancement completed");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Enhancement failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Blurry Image Enhancement"
        subtitle="Dedicated panel for original preview, blur score, enhancement status, enhanced preview, and download."
      />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <UploadPanel file={file} setFile={setFile} onSubmit={enhance} loading={loading} buttonLabel="Enhance Image" />
        <div className="panel-card">
          {loading && (
            <div className="mb-5 rounded-lg border border-field-100 bg-field-50/80 p-4">
              <div className="h-2 overflow-hidden rounded-lg bg-field-100">
                <div className="h-full w-2/3 animate-pulse rounded-lg bg-field-600" />
              </div>
              <p className="mt-3 text-sm font-semibold text-field-700">Enhancement in progress...</p>
            </div>
          )}
          {!result ? (
            <div className="grid min-h-64 place-items-center text-center sm:min-h-80">
              <ImageUp className="mx-auto mb-3 text-field-600" size={44} />
              <p className="font-semibold text-slate-700">Enhanced image preview will appear here</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Preview title="Original blurry image" src={result.original_url} />
                <Preview title="Enhanced image" src={result.enhanced_url} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Metric title="Original Blur Score" value={result.blur_score} />
                <Metric title="Enhanced Blur Score" value={result.enhanced_blur_score} />
                <Metric title="Status" value={result.enhancement_status} />
                {result.processing_seconds && <Metric title="Processing Time" value={`${result.processing_seconds}s`} />}
              </div>
              <div className="rounded-lg border border-field-100 bg-field-50/80 p-4">
                <p className="font-semibold text-field-700">Enhancement engine: {result.engine}</p>
                {result.fallback_reason && <p className="mt-1 text-sm text-slate-600">Fallback used because Real-ESRGAN was unavailable: {result.fallback_reason}</p>}
                <a href={enhancedDownloadUrl(result.enhanced_url)} download className="gradient-button mt-4 inline-flex w-full items-center justify-center gap-2 sm:w-auto">
                  <Download size={18} />
                  Download enhanced image
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Preview({ title, src }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-700">{title}</p>
      <img src={mediaUrl(src)} alt={title} className="h-56 w-full rounded-lg object-cover sm:h-72" />
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <div className="rounded-lg border border-field-100 bg-white/70 p-4 shadow-sm backdrop-blur">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 break-words text-lg font-bold sm:text-xl">{value}</p>
    </div>
  );
}
