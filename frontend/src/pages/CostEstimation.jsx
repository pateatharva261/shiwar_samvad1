import React, { useState } from "react";
import toast from "react-hot-toast";
import FormField from "../components/FormField.jsx";
import PageHeader from "../components/PageHeader.jsx";
import api from "../services/api.js";

const herbicides = ["Glyphosate", "2,4-D", "Triclopyr", "Fluroxypyr", "Picloram", "Aminocyclopyrachlor", "Triclopyr + Picloram", "Triclopyr (Garlon 600)"];

export default function CostEstimation() {
  const [form, setForm] = useState({
    crop_type: "Soybean",
    weather: "Sunny",
    land_area: 2,
    application_time: "Morning",
    herbicide_type: "Glyphosate"
  });
  const [result, setResult] = useState(null);
  const update = (key, value) => setForm({ ...form, [key]: value });

  const submit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post("/agri/cost", { ...form, land_area: Number(form.land_area) });
      setResult(data);
      toast.success("Cost estimate ready");
    } catch {
      toast.error("Unable to estimate cost");
    }
  };

  return (
    <div>
      <PageHeader title="Herbicide Cost Estimation" subtitle="Estimate herbicide quantity, cost breakdown, and expense summary for field planning." />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={submit} className="panel-card grid gap-4">
          <FormField label="Crop Type"><input value={form.crop_type} onChange={(event) => update("crop_type", event.target.value)} /></FormField>
          <FormField label="Weather"><input value={form.weather} onChange={(event) => update("weather", event.target.value)} /></FormField>
          <FormField label="Land Area (acres)"><input type="number" min="0.1" step="0.1" value={form.land_area} onChange={(event) => update("land_area", event.target.value)} /></FormField>
          <FormField label="Application Time"><input value={form.application_time} onChange={(event) => update("application_time", event.target.value)} /></FormField>
          <FormField label="Herbicide Type">
            <select value={form.herbicide_type} onChange={(event) => update("herbicide_type", event.target.value)}>
              {herbicides.map((item) => <option key={item}>{item}</option>)}
            </select>
          </FormField>
          <button className="gradient-button">Estimate Cost</button>
        </form>

        <div className="panel-card">
          {!result ? (
            <p className="text-slate-500">Cost breakdown will appear after estimation.</p>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Metric title="Quantity Required" value={`${result.quantity_required_liters} L`} />
                <Metric title="Total Cost" value={`INR ${result.total_estimated_cost}`} />
              </div>
              <div className="space-y-3">
                {result.cost_breakdown.map((item) => (
                  <div key={item.label} className="flex flex-col gap-1 rounded-lg border border-field-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="font-bold text-slate-950">INR {item.amount}</span>
                  </div>
                ))}
              </div>
              <div className="break-words rounded-lg bg-gradient-to-r from-field-700 to-emerald-500 p-4 font-semibold leading-6 text-white shadow-soft">{result.expense_summary}</div>
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
      <p className="mt-1 break-words text-xl font-bold sm:text-2xl">{value}</p>
    </div>
  );
}
