import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import AuthBrandPanel from "../components/AuthBrandPanel.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
import FormField from "../components/FormField.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiErrorMessage } from "../services/api.js";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success("Welcome back to Shiwar Samvad");
      navigate("/");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Login failed. Check your email and password, or create an account first."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-field-50 lg:grid-cols-[1.05fr_0.95fr]">
      <AuthBrandPanel
        title="Shiwar Samvad"
        subtitle="A clean AI control center for weed detection, herbicide planning, dosage intelligence, cost forecasting, and farmer support."
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
              <h2 className="text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">Welcome back</h2>
              <p className="text-sm text-slate-500">Continue to your farm assistant</p>
            </div>
          </div>
          <div className="space-y-4">
            <FormField label="Email">
              <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </FormField>
            <FormField label="Password">
              <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            </FormField>
          </div>
          <button className="gradient-button mt-6 w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <p className="mt-5 text-center text-sm text-slate-600">
            New here? <Link to="/signup" className="font-semibold text-field-700">Create account</Link>
          </p>
        </motion.form>
      </section>
    </div>
  );
}
