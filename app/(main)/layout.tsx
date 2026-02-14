import { Navbar } from "@/components/Navbar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen bg-[#0a0a0a]">
            <Navbar />
            <main className="relative z-0">
                {children}
            </main>
        </div>
    );
}
