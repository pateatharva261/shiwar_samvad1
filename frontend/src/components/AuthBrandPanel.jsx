import { Bot, Leaf, ShieldCheck, TrendingUp } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import BrandLogo from "./BrandLogo.jsx";

const features = [
  { icon: Leaf, title: "Weed Detection", text: "Vision AI for field images" },
  { icon: ShieldCheck, title: "Herbicide Recommendation", text: "Safer crop guidance" },
  { icon: Bot, title: "AI Assistant", text: "Multilingual farm support" },
  { icon: TrendingUp, title: "Cost Estimation", text: "Input and expense planning" }
];

export default function AuthBrandPanel({ align = "left", title = "Shiwar Samvad", subtitle }) {
  const isRight = align === "right";

  return (
    <section className={`relative overflow-hidden px-4 py-8 sm:px-6 sm:py-10 lg:min-h-screen lg:px-10 xl:px-14 ${isRight ? "lg:order-2" : ""}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-field-900 via-field-700 to-emerald-500" />
      <div className="mesh-overlay absolute inset-0 opacity-70" />
      <div className="absolute -left-24 top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />

      <div className={`relative flex h-full min-h-[360px] flex-col justify-between gap-8 text-white lg:min-h-screen ${isRight ? "lg:items-end lg:text-right" : ""}`}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-xl">
          <div className={`mb-5 flex ${isRight ? "lg:justify-end" : ""}`}>
            <BrandLogo className="h-16 w-16 sm:h-20 sm:w-20" />
          </div>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl xl:text-6xl">{title}</h1>
          <p className="mt-4 text-base leading-7 text-white/80 sm:text-lg">{subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="grid w-full max-w-2xl gap-3 sm:grid-cols-2"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.18 + index * 0.05 }}
                className="rounded-lg border border-white/20 bg-white/10 p-4 text-left shadow-soft backdrop-blur-xl"
              >
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-white/20 text-white">
                  <Icon size={20} />
                </div>
                <p className="font-semibold">{feature.title}</p>
                <p className="mt-1 text-sm leading-5 text-white/70">{feature.text}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
