export const NAV_LINKS = [
    { name: "Home", href: "/browse" },
    { name: "Discover", href: "/discover" },
    { name: "Movies", href: "/movies" },
    { name: "TV Shows", href: "/tv" },
] as const;

/** Single source for the beta notice, previously duplicated in two overlays. */
export const BETA_NOTICE = {
    title: "Beta Version",
    body: "Welcome to Kino! We are currently in our beta phase. Expect frequent updates and new features.",
} as const;
