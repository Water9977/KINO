"use client";

import { useRef, type RefObject } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import { useDialogFocus } from "@/components/ui/useDialogFocus";

interface ModalProps {
    onClose: () => void;
    label: string;
    children: React.ReactNode;
    className?: string;
    /** Where focus goes on close if the element that opened the dialog no longer exists. */
    returnFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Accessible overlay shell: labelled dialog role, Escape to close, scroll lock,
 * a focus trap, and focus restored to whatever opened it.
 */
export function Modal({ onClose, label, children, className = "", returnFocusRef }: ModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    useDialogFocus(panelRef, { onClose, returnFocusRef });

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
            className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white transition-colors"
        >
            <X size={18} aria-hidden="true" />
        </button>
    );
}
