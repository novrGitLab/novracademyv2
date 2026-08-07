"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Modal                                                                      */
/* -------------------------------------------------------------------------- */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  showClose?: boolean;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  showClose = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        ref={contentRef}
        className={`w-full ${sizeClasses[size]} rounded-[12px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between border-b border-[#E5E7EB] px-6 py-4">
            <div>
              {title && (
                <h2 className="text-[16px] font-semibold text-[#1A1A2E]">{title}</h2>
              )}
              {description && (
                <p className="mt-1 text-[13px] text-[#6B7280]">{description}</p>
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[#9CA3AF] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Modal.Header                                                              */
/* -------------------------------------------------------------------------- */

Modal.Header = function ModalHeader({ children }: { children: ReactNode }) {
  return <div className="mb-4">{children}</div>;
};

/* -------------------------------------------------------------------------- */
/*  Modal.Body                                                                */
/* -------------------------------------------------------------------------- */

Modal.Body = function ModalBody({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
};

/* -------------------------------------------------------------------------- */
/*  Modal.Footer                                                              */
/* -------------------------------------------------------------------------- */

Modal.Footer = function ModalFooter({ children, align = "end" }: { children: ReactNode; align?: "start" | "center" | "end" }) {
  const alignClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
  };
  return (
    <div className={`flex items-center gap-3 border-t border-[#E5E7EB] px-6 py-4 ${alignClasses[align]}`}>
      {children}
    </div>
  );
};
