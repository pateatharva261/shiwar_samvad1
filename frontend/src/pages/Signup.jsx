import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import AuthBrandPanel from "../components/AuthBrandPanel.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
import FormField from "../components/FormField.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiErrorMessage } from "../services/api.js";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", language: "English" });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await signup(form);
      toast.success("Account created");
      navigate("/");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Signup failed. Check your details and try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-field-50 lg:grid-cols-[0.95fr_1.05fr]">
      <AuthBrandPanel
        align="right"
        title="Farmer-first AI"
        subtitle="Launch a secure workspace for image intelligence, recommendation flows, multilingual assistance, and smarter field economics."
      />
      <section className="saas-bg flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
        <div className="mesh-overlay pointer-events-none absolute inset-0 opacity-70" />
        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          onSubmit={submit}
          className="glass-panel relative w-full max-w-md rounded-lg p-5 sm:p-6 lg:p-8"
        >
          <div className="mb-6 flex items-center gap-3 sm:mb-7">
            <BrandLogo className="h-11 w-11 sm:h-12 sm:w-12" />
            <div className="min-w-0">
              <h2 className="text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">Create Account</h2>
              <p className="text-sm text-slate-500">Start using Shiwar Samvad</p>
            </div>
          </div>
          <div className="space-y-4">
            <FormField label="Name">
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </FormField>
            <FormField label="Email">
              <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </FormField>
            <FormField label="Password">
              <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={6} />
            </FormField>
            <FormField label="Preferred Language">
              <select value={form.language} onChange={(event) => setForm({ ...form, language: event.target.value })}>
                <option>English</option>
                <option>Hindi</option>
                <option>Marathi</option>
              </select>
            </FormField>
          </div>
          <button className="gradient-button mt-6 w-full" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
          <p className="mt-5 text-center text-sm text-slate-600">
            Already registered? <Link to="/login" className="font-semibold text-field-700">Sign in</Link>
          </p>
        </motion.form>
      </section>
    </div>
  );
}
