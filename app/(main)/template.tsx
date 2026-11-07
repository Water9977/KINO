/**
 * Re-mounts on every navigation, which replays the CSS `page-enter` fade. It used to be a Framer
 * Motion wrapper with `initial={{ opacity: 0 }}`, which server-rendered the whole page hidden until
 * hydration (see the note on entrance animations in globals.css). A server component now, so it
 * ships no JavaScript at all.
 */
export default function Template({ children }: { children: React.ReactNode }) {
    return <div className="page-enter">{children}</div>;
}
