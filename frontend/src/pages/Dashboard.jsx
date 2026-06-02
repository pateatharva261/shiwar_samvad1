import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Camera, CircleDollarSign, ImageUp, Leaf, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo.jsx";

const features = [
  { icon: Camera, title: "Weed Detection", text: "Analyze field images with the ViT prediction workflow.", to: "/weed-detection", accent: "from-emerald-500 to-field-700" },
  { icon: ShieldCheck, title: "Herbicide Recommendation", text: "Convert detected species into practical treatment guidance.", to: "/herbicide", accent: "from-lime-500 to-field-600" },
  { icon: Bot, title: "AI Chatbot", text: "Ask field questions in English, Hindi, or Marathi.", to: "/chatbot", accent: "from-teal-500 to-emerald-600" },
  { icon: ImageUp, title: "Image Enhancement", text: "Improve blurry uploads before prediction and review.", to: "/enhancement", accent: "from-cyan-500 to-field-600" },
  { icon: Leaf, title: "Dosage Calculator", text: "Estimate safe dosage by weed, crop, weather, and severity.", to: "/dosage", accent: "from-green-500 to-emerald-700" },
  { icon: CircleDollarSign, title: "Cost Estimation", text: "Forecast input quantity, labor, equipment, and total cost.", to: "/cost", accent: "from-field-500 to-teal-600" }
];

const workflow = ["Upload or ask", "Enhance and analyze", "Recommend action", "Estimate cost"];

export default function Dashboard() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-lg border border-white/70 bg-gradient-to-br from-field-900 via-field-700 to-emerald-500 p-4 text-white shadow-glow sm:p-6 lg:p-8">
        <div className="mesh-overlay absolute inset-0 opacity-60" />
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="mb-5 flex items-center gap-4">
              <BrandLogo className="h-16 w-16 sm:h-20 sm:w-20" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-field-50">AI Agriculture Platform</p>
                <p className="mt-1 text-sm text-white/70">Field intelligence for smarter decisions</p>
              </div>
            </div>
            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">Shiwar Samvad</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
              A modern agriculture intelligence dashboard for vision analysis, crop safety guidance, assistant workflows, and farm economics.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/weed-detection" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 font-semibold text-field-700 shadow-soft transition hover:-translate-y-0.5">
                Start Detection <ArrowRight size={18} />
              </Link>
              <Link to="/chatbot" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/50 bg-white/10 px-5 py-3 font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20">
                Ask AI Assistant
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }} className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-xl sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-field-50">Live workflow map</p>
                <p className="text-xs text-white/60">From field signal to action plan</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/20">
                <Zap size={20} />
              </div>
            </div>
            <div className="space-y-3">
              {workflow.map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 p-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-sm font-bold text-field-700">{index + 1}</span>
                  <span className="font-medium text-white/90">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 + index * 0.04 }}
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <Link to={feature.to} className="glass-card block h-full">
                <div className={`mb-5 grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br ${feature.accent} text-white shadow-soft`}>
                  <Icon size={23} />
                </div>
                <h2 className="text-lg font-bold text-slate-950">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
                <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-field-700">
                  Open module <ArrowRight size={16} />
                </p>
              </Link>
            </motion.div>
          );
        })}
      </section>
    </div>
  );
}
