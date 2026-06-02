import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormField from "../components/FormField.jsx";
import PageHeader from "../components/PageHeader.jsx";
import api from "../services/api.js";

export default function HerbicideRecommendation() {
  const [weeds, setWeeds] = useState([]);
  const [weedType, setWeedType] = useState("Parthenium");
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get("/agri/weeds").then(({ data }) => {
      setWeeds(data.weeds);
      setWeedType(data.weeds[0] || "Parthenium");
    });
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post("/agri/herbicide", { weed_type: weedType });
      setResult(data);
      toast.success("Recommendation generated");
    } catch {
      toast.error("Unable to get recommendation");
    }
  };

  return (
    <div>
      <PageHeader title="Herbicide Recommendation" subtitle="Recommendations are generated from the herbicide mapping found in the existing notebook." />
      <div className="grid gap-6 lg:grid-cols-[0.65fr_1.35fr]">
        <form onSubmit={submit} className="panel-card">
          <FormField label="Detected Weed">
            <select value={weedType} onChange={(event) => setWeedType(event.target.value)}>
              {weeds.map((weed) => <option key={weed}>{weed}</option>)}
            </select>
          </FormField>
          <button className="gradient-button mt-5 w-full">Get Recommendation</button>
        </form>

        <div className="panel-card">
          {!result ? (
            <p className="text-slate-500">Select a weed and generate herbicide guidance.</p>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-sm uppercase text-field-600">Species</p>
                <h2 className="break-words text-2xl font-bold sm:text-3xl">{result.species}</h2>
                <p className="mt-1 text-slate-500">{result.scientific}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {result.herbicides?.map((item) => (
                  <div key={item} className="rounded-lg border border-field-100 bg-field-50 p-4 font-semibold text-field-700">{item}</div>
                ))}
              </div>
              <Guidance title="Usage Instructions" items={result.usage_instructions} />
              <Guidance title="Safety Precautions" items={result.safety_precautions} />
              <div className="rounded-lg border border-sky-100 bg-sky-50 p-4">
                <p className="font-semibold text-sky-900">Application Method</p>
                <p className="mt-1 text-sm text-sky-800">{result.application_method}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Guidance({ title, items = [] }) {
  return (
    <div>
      <p className="mb-2 font-semibold">{title}</p>
      <div className="grid gap-2">
        {items.map((item) => <p key={item} className="break-words rounded-lg border border-field-100 p-3 text-sm leading-6 text-slate-700">{item}</p>)}
      </div>
    </div>
  );
}
