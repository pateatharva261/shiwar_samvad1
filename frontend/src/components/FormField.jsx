import React from "react";

export default function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold leading-5 text-slate-700">{label}</span>
      {children}
    </label>
  );
}
