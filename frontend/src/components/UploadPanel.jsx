import React from "react";
import { UploadCloud } from "lucide-react";

export default function UploadPanel({ file, setFile, onSubmit, loading, buttonLabel = "Analyze Image" }) {
  return (
    <div className="panel-card border-dashed">
      <div className="grid place-items-center rounded-lg border border-field-100 bg-field-50/80 px-3 py-7 text-center sm:px-4 sm:py-8">
        <UploadCloud className="mb-3 text-field-600" size={34} />
        <p className="font-semibold text-slate-800">Upload weed image</p>
        <p className="mt-1 text-sm text-slate-500">JPG, PNG, WEBP, or BMP image</p>
        <input
          type="file"
          accept="image/*"
          className="mt-5 w-full max-w-sm rounded-lg border border-field-100 bg-white p-3 text-sm"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
        {file && <p className="mt-3 max-w-full break-all text-sm font-medium text-field-700">{file.name}</p>}
      </div>
      <button
        onClick={onSubmit}
        disabled={!file || loading}
        className="gradient-button mt-4 w-full"
      >
        {loading ? "Processing..." : buttonLabel}
      </button>
    </div>
  );
}
