"use client";

import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ExpandableSearchBarProps = {
    expandDirection?: 'left' | 'right';
    placeholder?: string;
    onSearch?: (query: string) => void;
    className?: string;
    width?: number | string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    children?: React.ReactNode;
};

const COLLAPSED_SIZE = 40;

export default function ExpandableSearchBar(props: ExpandableSearchBarProps) {
    const {
        expandDirection = 'right',
        placeholder = 'Search...',
        onSearch,
        className = '',
        width = 280,
        value,
        onChange,
        open,
        onOpenChange,
        onBlur,
        children
    } = props;

    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const formRef = useRef<HTMLFormElement | null>(null);

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (
                !containerRef.current?.contains(e.target as Node) &&
                open &&
                value === ''
            ) {
                onOpenChange(false);
            }
        }
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [open, value, onOpenChange]);

    useEffect(() => {
        if (open) {
            const id = setTimeout(() => inputRef.current?.focus(), 80);
            return () => clearTimeout(id);
        }
    }, [open]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                onOpenChange(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onOpenChange]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Dismiss keyboard on mobile before navigating
        inputRef.current?.blur();
        onSearch?.(value);
    };

    const expandedWidth = typeof width === 'number' ? `${width}px` : width;

    return (
        <div
            ref={containerRef}
            className={cn('relative inline-block z-40', className)}
            style={{ width: COLLAPSED_SIZE, height: COLLAPSED_SIZE }}
        >
            {/* Icon button */}
            <button
                type='button'
                aria-label={open ? 'Close search' : 'Open search'}
                onClick={() => onOpenChange(!open)}
                className={cn(
                    'absolute inset-0 z-20 grid place-items-center rounded-full border',
                    // Use CSS transition instead of Framer Motion — GPU-friendly
                    'transition-colors duration-150',
                    open
                        ? 'bg-transparent border-transparent text-white/50 hover:text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border-transparent'
                )}
            >
                {/* Swap icon with CSS opacity instead of Framer AnimatePresence */}
                <Search className={cn('size-5 absolute transition-all duration-150', open ? 'opacity-0 scale-75' : 'opacity-100 scale-100')} />
                <X className={cn('size-4 absolute transition-all duration-150', open ? 'opacity-100 scale-100' : 'opacity-0 scale-75')} />
            </button>

            {/* Search form — CSS transition on width, NO Framer Motion, NO backdrop-blur */}
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className={cn(
                    'absolute top-0 h-10 rounded-full border overflow-hidden flex items-center',
                    // Solid bg instead of backdrop-blur — dramatically cheaper on mobile GPU
                    'bg-[#111111] border-transparent transition-colors duration-150',
                    value.length > 0 ? 'border-[#2563eb]/50' : '',
                    'focus-within:border-[#2563eb]/50',
                    expandDirection === 'left' ? 'right-0' : 'left-0'
                )}
                style={{
                    // CSS width transition — smooth and layout-cheap via transform hint
                    width: open ? expandedWidth : `${COLLAPSED_SIZE}px`,
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? 'auto' : 'none',
                    // CSS transition instead of JS spring animation
                    transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms ease',
                    // Promote to GPU layer to avoid repaints
                    willChange: 'width',
                    transform: 'translateZ(0)',
                }}
            >
                {/* Search Icon visible inside */}
                <span className='absolute left-3 z-10 text-white/50 pointer-events-none'>
                    <Search className='size-4' />
                </span>

                <div className='relative flex-1 min-w-0 flex items-center h-full pl-10'>
                    <input
                        ref={inputRef}
                        type='text'
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder={open ? placeholder : ''}
                        className="w-full h-full bg-transparent text-sm text-white outline-none placeholder:text-white/40 whitespace-nowrap overflow-x-auto pr-4"
                    />
                </div>
            </form>

            {/* Dropdown children */}
            <div
                className={cn(
                    "absolute top-full mt-3",
                    expandDirection === 'left' ? "right-0" : "left-0"
                )}
                style={{ width: expandedWidth }}
            >
                {children}
            </div>
        </div>
    );
}
