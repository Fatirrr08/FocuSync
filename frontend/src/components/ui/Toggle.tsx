"use client";

import React from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function Toggle({ checked, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
        transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-violet/50 focus:ring-offset-2 focus:ring-offset-deeper
        ${checked ? "bg-emerald" : "bg-glass-border"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300
          ${checked ? "translate-x-[22px]" : "translate-x-[3px]"}
        `}
      />
    </button>
  );
}
