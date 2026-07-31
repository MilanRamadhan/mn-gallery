"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

export function ConfirmDialog({ open, title, message, confirmLabel, destructive = false, onConfirm, onClose }: { open: boolean; title: string; message: string; confirmLabel: string; destructive?: boolean; onConfirm: () => void; onClose: () => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose, open]);
  if (!open) return null;
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="confirm-dialog">
        <button type="button" className="dialog-close" aria-label="Close dialog" onClick={onClose}><X /></button>
        <p className="eyebrow">Please confirm</p>
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        <div><button className="button outline" type="button" onClick={onClose}>Cancel</button><button ref={confirmRef} className={"button " + (destructive ? "danger" : "primary")} type="button" onClick={onConfirm}>{confirmLabel}</button></div>
      </div>
    </div>
  );
}
