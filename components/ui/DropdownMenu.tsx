"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + window.scrollY + 4,
        left: align === "right" ? rect.right + window.scrollX - 180 : rect.left + window.scrollX,
      });
    }
  }, [align]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      updatePosition();
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, updatePosition]);

  return (
    <>
      <div ref={triggerRef} className="relative inline-block">
        <div onClick={() => setOpen(!open)} className="cursor-pointer">
          {trigger}
        </div>
      </div>

      {open && createPortal(
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[180px] rounded-[8px] border border-[#E5E7EB] bg-white py-1 shadow-[0_8px_24px_rgba(26,26,46,0.12)]"
          style={{ top: menuPos.top, left: menuPos.left }}
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
        </div>,
        document.body
      )}
    </>
  );
}
