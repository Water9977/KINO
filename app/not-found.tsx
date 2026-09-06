import Link from "next/link";
import { Clapperboard, ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Page Not Found",
    // Defence in depth: a route group with a loading.tsx above it streams a 200
    // before the page can throw, so the status alone can't be relied on to keep
    // these out of the index.
    robots: { index: false, follow: false },
};

export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0a0a0a] px-6 text-center text-white">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#2563eb]/10 text-[#2563eb]">
                <Clapperboard size={44} />
            </div>

            <div className="space-y-3">
                <p className="text-sm font-black uppercase tracking-[0.3em] text-[#2563eb]">404</p>
                <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                    This title isn&apos;t in the catalogue
                </h1>
                <p className="max-w-md text-gray-400">
                    The page you&apos;re looking for doesn&apos;t exist, or the title has been
                    removed from our source.
                </p>
            </div>

            <Link
                href="/browse"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-7 py-3 text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] active:scale-95"
            >
                <ArrowLeft size={16} />
                Back to browsing
            </Link>
        </main>
    );
}
