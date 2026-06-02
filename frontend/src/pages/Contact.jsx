import { Mail, Phone } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import FormField from "../components/FormField.jsx";
import PageHeader from "../components/PageHeader.jsx";
import api from "../services/api.js";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const update = (key, value) => setForm({ ...form, [key]: value });

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post("/contact", form);
      toast.success("Message sent");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast.error("Unable to submit contact form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Contact" subtitle="Reach the Shiwar Samvad team for field support, deployments, and platform feedback." />
      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="grid gap-4 sm:grid-cols-2 lg:block lg:space-y-4">
          <div className="panel-card">
            <Mail className="text-field-600" />
            <p className="mt-3 break-words font-semibold">support@shiwarsamvad.ai</p>
            <p className="text-sm text-slate-500">Email</p>
          </div>
          <div className="panel-card">
            <Phone className="text-field-600" />
            <p className="mt-3 font-semibold">+91 98765 43210</p>
            <p className="text-sm text-slate-500">Phone</p>
          </div>
          <footer className="rounded-lg bg-field-900 p-4 text-white sm:col-span-2 sm:p-5 lg:col-span-1">
            <p className="font-bold">Shiwar Samvad</p>
            <p className="mt-2 text-sm text-field-100">AI-powered farming decisions for healthier fields.</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
              <span>LinkedIn</span>
              <span>Instagram</span>
              <span>YouTube</span>
            </div>
          </footer>
        </div>
        <form onSubmit={submit} className="panel-card grid gap-4">
          <FormField label="Name"><input value={form.name} onChange={(event) => update("name", event.target.value)} required /></FormField>
          <FormField label="Email"><input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required /></FormField>
          <FormField label="Phone"><input value={form.phone} onChange={(event) => update("phone", event.target.value)} /></FormField>
          <FormField label="Message"><textarea rows="7" value={form.message} onChange={(event) => update("message", event.target.value)} required /></FormField>
          <button className="gradient-button" disabled={loading}>{loading ? "Sending..." : "Send Message"}</button>
        </form>
      </div>
    </div>
  );
}
