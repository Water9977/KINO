"use client";

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
            const id = setTimeout(() => inputRef.current?.focus(), 120);
            return () => clearTimeout(id);
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch?.(value);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                onOpenChange(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onOpenChange]);

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
                    'absolute inset-0 z-20 grid place-items-center rounded-full border transition-all duration-300',
                    open
                        ? 'bg-transparent border-transparent text-white/50 hover:text-white'
                        : 'bg-white/10 hover:bg-white/20 hover:scale-105 text-white border-transparent'
                )}
            >
                {open ? <X className='size-4' /> : <Search className='size-5' />}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.form
                        key='form'
                        onSubmit={handleSubmit}
                        className={cn(
                            'absolute top-0 h-10 rounded-full border overflow-hidden flex items-center',
                            /* Light to dark on open, blue border */
                            'bg-[#0a0a0a]/90 backdrop-blur-md border-transparent focus-within:border-[#2563eb]/50 focus-within:shadow-[0_0_15px_rgba(37,99,235,0.15)] transition-colors duration-300',
                            value.length > 0 ? 'border-[#2563eb]/50 shadow-[0_0_15px_rgba(37,99,235,0.15)]' : '',
                            expandDirection === 'left' ? 'right-0' : 'left-0'
                        )}
                        initial={{ width: COLLAPSED_SIZE, opacity: 0.98 }}
                        animate={{ width: width, opacity: 1 }}
                        exit={{
                            width: COLLAPSED_SIZE,
                            opacity: 0,
                            transition: { type: 'spring', stiffness: 260, damping: 26 },
                        }}
                        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                    >
                        {/* Search Icon visible inside */}
                        <span className='absolute left-3 z-10 text-white/50'>
                            <Search className='size-4' />
                        </span>

                        <div className='relative flex-1 min-w-0 flex items-center h-full pl-10'>
                            <input
                                ref={inputRef}
                                type='text'
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                placeholder={placeholder}
                                className="w-full h-full bg-transparent text-sm text-white outline-none placeholder-transparent whitespace-nowrap overflow-x-auto pr-4"
                            />

                            <AnimatePresence>
                                {!value && (
                                    <motion.span
                                        key='ph'
                                        className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-10 w-full truncate text-white/50 text-sm select-none text-left"
                                        initial={{ opacity: 1, x: 0 }}
                                        animate={{ opacity: 0.9, x: 0 }}
                                        exit={{ opacity: 0, x: 8 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {placeholder}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div
                className={cn(
                    "absolute top-full mt-3",
                    expandDirection === 'left' ? "right-0" : "left-0"
                )}
                style={{ width: typeof width === 'number' ? `${width}px` : width }}
            >
                {children}
            </div>
        </div>
    );
}
