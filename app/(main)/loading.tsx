export default function Loading() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Hero Skeleton */}
            <div className="relative h-[85vh] w-full bg-[#1a1a1a] animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

                {/* Content Placeholder */}
                <div className="absolute bottom-0 left-0 p-10 w-full max-w-4xl space-y-6">
                    <div className="h-4 w-32 bg-white/10 rounded-full" />
                    <div className="h-16 w-3/4 bg-white/10 rounded-lg" />
                    <div className="h-24 w-full bg-white/10 rounded-lg" />
                    <div className="flex gap-4">
                        <div className="h-14 w-40 bg-white/10 rounded-full" />
                        <div className="h-14 w-40 bg-white/10 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Rows Skeleton */}
            <div className="space-y-12 py-12 px-10">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-4">
                        <div className="h-8 w-48 bg-white/10 rounded-md animate-pulse" />
                        <div className="flex gap-4 overflow-hidden">
                            {[1, 2, 3, 4, 5, 6].map((j) => (
                                <div key={j} className="h-64 w-48 flex-shrink-0 bg-white/5 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
