"use client";

import type { RefObject } from "react";
import { Sparkles } from "lucide-react";

import { GlowCard } from "@/components/ui/spotlight-card";
import { Modal, ModalCloseButton } from "@/components/ui/Modal";
import { BETA_NOTICE } from "./nav-links";

export function BetaNoticeCard({
    onClose,
    returnFocusRef,
}: {
    onClose: () => void;
    returnFocusRef?: RefObject<HTMLElement | null>;
}) {
    return (
        <Modal
            onClose={onClose}
            label={BETA_NOTICE.title}
            className="w-full max-w-sm"
            returnFocusRef={returnFocusRef}
        >
            <GlowCard
                customSize
                glowColor="blue"
                className="!w-full !bg-black/40 border-white/5 shadow-2xl overflow-hidden"
            >
                <div className="flex flex-col relative p-6">
                    <div className="flex items-center gap-2 text-blue-400 mb-4">
                        <Sparkles size={20} aria-hidden="true" />
                        <h2 className="text-lg font-bold tracking-tight">{BETA_NOTICE.title}</h2>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{BETA_NOTICE.body}</p>
                    <ModalCloseButton onClose={onClose} />
                </div>
            </GlowCard>
        </Modal>
    );
}
