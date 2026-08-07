"use client";

import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { Modal } from "./Modal";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

const variantConfig = {
  danger: {
    icon: AlertTriangle,
    iconBg: "bg-[#FEF2F2]",
    iconColor: "text-[#DC2626]",
    confirmBg: "bg-[#DC2626]",
    confirmHover: "hover:bg-[#B91C1C]",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-[#FFF7ED]",
    iconColor: "text-[#EA580C]",
    confirmBg: "bg-[#EA580C]",
    confirmHover: "hover:bg-[#C2410C]",
  },
  info: {
    icon: Info,
    iconBg: "bg-[#EFF6FF]",
    iconColor: "text-[#2563EB]",
    confirmBg: "bg-[#683290]",
    confirmHover: "hover:bg-[#542573]",
  },
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${config.iconBg}`}>
          <Icon className={`h-6 w-6 ${config.iconColor}`} strokeWidth={2} />
        </div>
        <h3 className="mt-4 text-[16px] font-semibold text-[#1A1A2E]">{title}</h3>
        <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[#6B7280]">{message}</p>
      </div>

      <Modal.Footer align="center">
        <button
          onClick={onClose}
          disabled={loading}
          className="rounded-[8px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB] disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`rounded-[8px] px-4 py-2 text-[13px] font-medium text-white transition disabled:opacity-50 ${config.confirmBg} ${config.confirmHover}`}
        >
          {loading ? "Processing..." : confirmLabel}
        </button>
      </Modal.Footer>
    </Modal>
  );
}
