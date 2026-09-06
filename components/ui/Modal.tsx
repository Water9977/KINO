"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const FOCUSABLE =
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface ModalProps {
    onClose: () => void;
    label: string;
    children: React.ReactNode;
    className?: string;
}

/**
 * Accessible overlay shell: labelled dialog role, Escape to close, scroll lock,
 * a focus trap, and focus restored to whatever opened it.
 */
export function Modal({ onClose, label, children, className = "" }: ModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);

    useEffect(() => {
        previouslyFocused.current = document.activeElement as HTMLElement | null;

        const { overflow } = document.body.style;
        document.body.style.overflow = "hidden";

        // Move focus into the dialog so the next Tab stays inside it.
        const firstFocusable = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
        (firstFocusable ?? panelRef.current)?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onClose();
                return;
            }

            if (e.key !== "Tab" || !panelRef.current) return;

            const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
            if (items.length === 0) return;

            const first = items[0];
            const last = items[items.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = overflow;
            previouslyFocused.current?.focus();
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                aria-hidden="true"
            />
            <motion.div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={label}
                tabIndex={-1}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={`relative z-10 outline-none ${className}`}
            >
                {children}
            </motion.div>
        </div>
    );
}

export function ModalCloseButton({ onClose }: { onClose: () => void }) {
    return (
        <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 p-2 text-gray-500 hover:text-white transition-colors"
        >
            <X size={18} aria-hidden="true" />
        </button>
    );
}
