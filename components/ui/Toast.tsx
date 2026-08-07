"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Toast Component                                                            */
/* -------------------------------------------------------------------------- */

export function Toast({ message, type = "success", duration = 4000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: { icon: CheckCircle2, bg: "bg-[#F0FDF4]", border: "border-[#16A34A]/20", text: "text-[#16A34A]" },
    error: { icon: AlertTriangle, bg: "bg-[#FEF2F2]", border: "border-[#DC2626]/20", text: "text-[#DC2626]" },
    info: { icon: Info, bg: "bg-[#EFF6FF]", border: "border-[#2563EB]/20", text: "text-[#2563EB]" },
  };

  const c = config[type];
  const Icon = c.icon;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-[8px] border ${c.bg} ${c.border} px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <Icon className={`h-5 w-5 ${c.text}`} strokeWidth={2} />
      <p className="text-[13px] font-medium text-[#1A1A2E]">{message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        className="ml-2 text-[#9CA3AF] hover:text-[#1A1A2E]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
