"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface Options {
    /** Called on Escape. May change identity on every render: the latest one is always used. */
    onClose: () => void;
    /** Element to hand focus back to on close when whatever had focus before has gone away. */
    returnFocusRef?: RefObject<HTMLElement | null>;
}

// Several dialogs can overlap briefly: the drawer stays mounted through its exit animation while
// the About card it launched is already open. A plain "save and restore body.overflow" in each
// would restore the page to scrollable while the card is still showing, then lock it for good when
// the card closed. A shared counter keeps the lock until the last dialog is gone.
let scrollLocks = 0;
let overflowBeforeLock = "";

function lockScroll() {
    if (scrollLocks === 0) {
        overflowBeforeLock = document.body.style.overflow;
        document.body.style.overflow = "hidden";
    }
    scrollLocks += 1;
}

function unlockScroll() {
    scrollLocks = Math.max(0, scrollLocks - 1);
    if (scrollLocks === 0) document.body.style.overflow = overflowBeforeLock;
}

/**
 * Focus and keyboard behaviour shared by every modal surface (the About/notice dialogs and the
 * mobile navigation drawer): focus moves into the panel, Tab is trapped inside it, Escape closes
 * it, page scroll is locked, and focus returns to where it came from.
 *
 * The effect runs once per mount. `onClose` is read through a ref: callers pass a fresh inline
 * arrow on every render, and depending on it made any parent re-render (resizing across a
 * breakpoint, say) tear the dialog down and rebuild it, throwing focus back to the first control.
 */
export function useDialogFocus(panelRef: RefObject<HTMLElement | null>, { onClose, returnFocusRef }: Options) {
    const closeRef = useRef(onClose);
    const returnRef = useRef(returnFocusRef);

    useEffect(() => {
        closeRef.current = onClose;
        returnRef.current = returnFocusRef;
    });

    useEffect(() => {
        const panel = panelRef.current;
        const previouslyFocused = document.activeElement as HTMLElement | null;

        lockScroll();

        const firstFocusable = panel?.querySelector<HTMLElement>(FOCUSABLE);
        (firstFocusable ?? panel)?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                closeRef.current();
                return;
            }

            if (e.key !== "Tab" || !panel) return;

            const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
            if (items.length === 0) {
                e.preventDefault();
                return;
            }

            const first = items[0];
            const last = items[items.length - 1];
            const active = document.activeElement;

            if (e.shiftKey && (active === first || !panel.contains(active))) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            unlockScroll();

            // Only restore focus if it is still inside this dialog (or lost). When one dialog
            // hands over to another (drawer -> About card), the next one has already taken focus
            // and must keep it.
            const active = document.activeElement;
            const focusIsOurs = !active || active === document.body || (panel?.contains(active) ?? false);
            if (!focusIsOurs) return;

            const target =
                previouslyFocused?.isConnected && previouslyFocused !== document.body
                    ? previouslyFocused
                    : returnRef.current?.current;
            target?.focus();
        };
    }, [panelRef]);
}
