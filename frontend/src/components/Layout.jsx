import React from "react";
import {
  Bot,
  Calculator,
  CircleDollarSign,
  Contact,
  Home,
  ImageUp,
  Leaf,
  LogOut,
  Menu,
  ShieldCheck,
  User,
  X
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import BrandLogo from "./BrandLogo.jsx";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/weed-detection", label: "Weed Detection", icon: Leaf },
  { to: "/herbicide", label: "Herbicide Recommendation", icon: ShieldCheck },
  { to: "/dosage", label: "Dosage Calculator", icon: Calculator },
  { to: "/cost", label: "Cost Estimation", icon: CircleDollarSign },
  { to: "/chatbot", label: "AI Chatbot", icon: Bot },
  { to: "/enhancement", label: "Image Enhancement", icon: ImageUp },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/contact", label: "Contact", icon: Contact }
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="saas-bg min-h-screen overflow-x-hidden text-slate-900">
      <div className="mesh-overlay pointer-events-none fixed inset-0 opacity-40" />
      <button
        className="fixed left-3 top-3 z-50 grid h-11 w-11 place-items-center rounded-lg border border-white/70 bg-white/80 text-slate-900 shadow-soft backdrop-blur-xl transition hover:bg-white sm:left-4 sm:top-4 lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={22} />
      </button>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(18rem,86vw)] transform border-r border-white/70 bg-white/80 shadow-soft backdrop-blur-2xl transition-transform duration-300 lg:w-72 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
            <div className="flex min-w-0 items-center gap-3">
              <BrandLogo className="h-10 w-10 sm:h-11 sm:w-11" />
              <div className="min-w-0">
                <p className="truncate text-base font-bold sm:text-lg">Shiwar Samvad</p>
                <p className="text-xs text-slate-500">AI Agriculture Platform</p>
              </div>
            </div>
            <button className="grid h-10 w-10 shrink-0 place-items-center rounded-lg hover:bg-field-50 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation">
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1 pb-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition sm:py-3 ${
                      isActive ? "bg-gradient-to-r from-field-700 to-field-600 text-white shadow-soft" : "text-slate-700 hover:bg-white/70 hover:text-field-700"
                    }`
                  }
                >
                  <Icon className="shrink-0" size={19} />
                  <span className="min-w-0 truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto rounded-lg border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur-xl">
            <p className="text-sm font-semibold">{user?.name || "Farmer"}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
            <button onClick={logout} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px] lg:hidden" onClick={() => setOpen(false)} />}

      <main className="lg:pl-72">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto min-h-screen w-full max-w-7xl px-3 pb-6 pt-20 sm:px-5 sm:pb-8 lg:px-8 lg:py-8 xl:px-10"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
