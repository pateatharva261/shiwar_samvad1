import React from "react";

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:mb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-3xl lg:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{subtitle}</p>}
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  );
}
