"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = nextId++;
      setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const config = {
    success: { icon: CheckCircle2, bg: "bg-[#F0FDF4]", border: "border-[#16A34A]/20", text: "text-[#16A34A]" },
    error: { icon: AlertTriangle, bg: "bg-[#FEF2F2]", border: "border-[#DC2626]/20", text: "text-[#DC2626]" },
    info: { icon: Info, bg: "bg-[#EFF6FF]", border: "border-[#2563EB]/20", text: "text-[#2563EB]" },
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-2" aria-live="polite">
        {toasts.map((t) => {
          const c = config[t.type];
          const Icon = c.icon;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-3 rounded-[8px] border ${c.bg} ${c.border} px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]`}
            >
              <Icon className={`h-5 w-5 ${c.text}`} strokeWidth={2} />
              <p className="text-[13px] font-medium text-[#1A1A2E]">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="ml-2 text-[#9CA3AF] hover:text-[#1A1A2E]"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
