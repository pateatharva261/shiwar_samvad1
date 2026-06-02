import React from "react";
import logo from "../assets/logo.jpeg";

export default function BrandLogo({ className = "h-10 w-10", imageClassName = "" }) {
  return (
    <div className={`shrink-0 overflow-hidden rounded-lg bg-white shadow-soft ring-1 ring-white/70 ${className}`}>
      <img src={logo} alt="Shiwar Samvad logo" className={`h-full w-full object-cover ${imageClassName}`} />
    </div>
  );
}
