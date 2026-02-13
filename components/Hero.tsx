import { StartButton } from "./StartButton";
import AnoAI from "./ui/animated-shader-background";
import { KinoLogo } from "./ui/KinoLogo";

export const Hero = () => {
    return (
        <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-kino-dark selection:bg-kino-blue/30 text-white">
            {/* Background Shader */}
            <div className="absolute inset-0 z-0">
                <AnoAI />
            </div>

            {/* Logo & Branding */}
            <div className="relative z-10 text-center">
                <div className="mb-6 flex justify-center">
                    <KinoLogo fontSize="text-9xl" />
                </div>



                <div className="mt-8 flex w-full justify-center">
                    <StartButton />
                </div>
            </div>

            {/* Footer / Copyright or disclaimer */}
            <div className="absolute bottom-8 text-xs text-white/20 select-none">
                Start your journey today.
            </div>
        </section>
    );
};
