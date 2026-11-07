interface KinoLogoProps {
    fontSize?: string;
}

/**
 * The wordmark. Plain markup with no client JavaScript: it is on every page, so it must not run an
 * animation loop of its own. The pulsing glow behind the "O" is the `.kino-logo-o::before` rule in
 * globals.css (compositor-only, and removed for visitors who prefer reduced motion).
 */
export const KinoLogo = ({ fontSize = "text-4xl" }: KinoLogoProps) => {
    return (
        <div className="relative isolate flex items-baseline gap-[0.04em] cursor-default group">
            <span
                className={`${fontSize} font-black tracking-tighter text-white transition-colors duration-300 group-hover:text-gray-200`}
                style={{ textShadow: "0 0 10px rgba(255,255,255,0.1)" }}
            >
                KIN
            </span>
            <span
                className={`kino-logo-o relative ${fontSize} font-black tracking-tighter text-kino-blue drop-shadow-[0_0_15px_rgba(37,99,235,0.6)]`}
            >
                O
            </span>
        </div>
    );
};
