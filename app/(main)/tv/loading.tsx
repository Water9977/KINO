import KineticDotsLoader from "@/components/ui/kinetic-dots-loader";
import { Navbar } from "@/components/Navbar";

export default function Loading() {
    return (
        <main className="min-h-screen bg-kino-dark flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
                <KineticDotsLoader />
            </div>
        </main>
    );
}
