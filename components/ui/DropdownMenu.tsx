"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface DropdownItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function DropdownMenu({ trigger, items, align = "right" }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          className={`absolute top-full z-10 mt-1 min-w-[180px] rounded-[8px] border border-[#E5E7EB] bg-white py-1 shadow-[0_8px_24px_rgba(26,26,46,0.12)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  setOpen(false);
                }
              }}
              disabled={item.disabled}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-[13px] transition ${
                item.danger
                  ? "text-[#DC2626] hover:bg-[#FEF2F2]"
                  : item.disabled
                  ? "cursor-not-allowed text-[#D1D5DB]"
                  : "text-[#1A1A2E] hover:bg-[#F8F9FB]"
              }`}
            >
              {item.icon && <item.icon className="h-3.5 w-3.5" strokeWidth={2} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
