import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormField from "../components/FormField.jsx";
import PageHeader from "../components/PageHeader.jsx";
import api from "../services/api.js";

export default function DosageCalculator() {
  const [weeds, setWeeds] = useState([]);
  const [form, setForm] = useState({
    weed_type: "Parthenium",
    crop_type: "Cotton",
    land_area: 1,
    weather: "Sunny",
    severity: "Medium",
    application_timing: "Early morning"
  });
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get("/agri/weeds").then(({ data }) => setWeeds(data.weeds));
  }, []);

  const update = (key, value) => setForm({ ...form, [key]: value });

  const submit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post("/agri/dosage", { ...form, land_area: Number(form.land_area) });
      setResult(data);
      toast.success("Dosage calculated");
    } catch {
      toast.error("Unable to calculate dosage");
    }
  };

  return (
    <div>
      <PageHeader title="Dosage Calculator" subtitle="Estimate herbicide quantity using weed type, crop, acreage, weather, severity, and timing." />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={submit} className="panel-card grid gap-4">
          <FormField label="Weed Type">
            <select value={form.weed_type} onChange={(event) => update("weed_type", event.target.value)}>
              {weeds.map((weed) => <option key={weed}>{weed}</option>)}
            </select>
          </FormField>
          <FormField label="Crop Type"><input value={form.crop_type} onChange={(event) => update("crop_type", event.target.value)} /></FormField>
          <FormField label="Land Area (acres)"><input type="number" min="0.1" step="0.1" value={form.land_area} onChange={(event) => update("land_area", event.target.value)} /></FormField>
          <FormField label="Weather"><input value={form.weather} onChange={(event) => update("weather", event.target.value)} /></FormField>
          <FormField label="Severity">
            <select value={form.severity} onChange={(event) => update("severity", event.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </FormField>
          <FormField label="Application Timing"><input value={form.application_timing} onChange={(event) => update("application_timing", event.target.value)} /></FormField>
          <button className="gradient-button">Calculate Dosage</button>
        </form>

        <ResultPanel result={result} />
      </div>
    </div>
  );
}

function ResultPanel({ result }) {
  return (
    <div className="panel-card">
      {!result ? (
        <p className="text-slate-500">Dosage output will appear after calculation.</p>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Metric title="Safe Dosage" value={`${result.safe_dosage_liters} L`} />
            <Metric title="Water Volume" value={`${result.water_volume_liters} L`} />
          </div>
          <div className="rounded-lg border border-field-100 bg-field-50/80 p-4">
            <p className="font-semibold text-field-700">Spray Recommendation</p>
            <p className="mt-1 text-sm text-slate-700">{result.spray_recommendation}</p>
          </div>
          <div className="grid gap-2">
            {result.precautions.map((item) => <p key={item} className="break-words rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm leading-6 text-amber-900">{item}</p>)}
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <div className="rounded-lg border border-field-100 bg-white/70 p-4 shadow-sm backdrop-blur">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 break-words text-xl font-bold sm:text-2xl">{value}</p>
    </div>
  );
}
