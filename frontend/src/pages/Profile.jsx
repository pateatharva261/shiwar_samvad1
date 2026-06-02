import React from "react";
import { Languages, Mail, Moon, Sun, User } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Profile() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div>
      <PageHeader title="Profile" subtitle="Your Shiwar Samvad farmer profile and authentication session." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProfileMetric icon={User} title="Name" value={user?.name || "Farmer"} />
        <ProfileMetric icon={Mail} title="Email" value={user?.email || "-"} />
        <ProfileMetric icon={Languages} title="Language" value={user?.language || "English"} />
      </div>

      <div className="panel-card mt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-bold text-slate-950">Appearance</p>
            <p className="mt-1 text-sm text-slate-500">Enable dark mode for a softer low-light interface.</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={isDark}
            className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold shadow-soft transition hover:-translate-y-0.5 sm:w-auto ${
              isDark ? "bg-field-500 text-white hover:bg-field-400" : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? "Disable Dark Mode" : "Enable Dark Mode"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileMetric({ icon: Icon, title, value }) {
  return (
    <div className="glass-card">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-field-700 to-emerald-500 text-white"><Icon size={20} /></div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 break-words text-lg font-bold sm:text-xl">{value}</p>
    </div>
  );
}
