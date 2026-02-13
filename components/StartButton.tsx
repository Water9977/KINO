"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { ShimmerButton } from "./ui/shimmer-button";

export const StartButton = () => {
    return (
        <Link href="/browse">
            <ShimmerButton className="shadow-2xl gap-2" shimmerColor="#2563eb">
                <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                    Start Streaming
                </span>
                <Play size={20} fill="currentColor" className="text-white" />
            </ShimmerButton>
        </Link>
    );
};
