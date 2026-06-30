'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Each genre gets its own Dirtyline Studio personality.
// Font sizes are tuned per-font since display typefaces have wildly different
// cap heights and optical weights.
const genres = [
  {
    word: 'romantic',
    color: '#EC4899',          // deep warm pink — legible on near-black
    fontFamily: 'Sweetline, Georgia, serif',
    fontSize: '1.65em',        // Sweetline is a script — needs more room
    letterSpacing: '0.02em',
    suffix: ' ❤️',
  },
  {
    word: 'action',
    color: '#EF4444',          // punchy crimson
    fontFamily: 'BlackHeat, Impact, sans-serif',
    fontSize: '1.1em',
    letterSpacing: '0.12em',   // BlackHeat is condensed — spacing helps
    suffix: ' 💥',
  },
  {
    word: 'thriller',
    color: '#06B6D4',          // deep cyan — not neon, just saturated cool
    fontFamily: 'BlackTheory, "Trebuchet MS", sans-serif',
    fontSize: '1.05em',
    letterSpacing: '0.06em',
    suffix: ' 🔪',
  },
  {
    word: 'horror',
    color: '#EA580C',          // burnt orange — unsettling, no glow needed
    fontFamily: 'Skywalker, "Courier New", monospace',
    fontSize: '1.15em',
    letterSpacing: '0.04em',
    suffix: ' 💀',
  },
  {
    word: 'sci-fi',
    color: '#6366F1',          // slate indigo — cool & cerebral
    fontFamily: 'NeueMetana, "Arial Narrow", sans-serif',
    fontSize: '1em',
    letterSpacing: '0.14em',   // geometric — benefits from spacing
    suffix: ' 🌌',
  },
  {
    word: 'crime',
    color: '#D97706',          // vintage amber/gold — old film, cigarette smoke
    fontFamily: 'HoodsonScript, Georgia, serif',
    fontSize: '1.5em',
    letterSpacing: '0.01em',
    suffix: ' 🃏',
  },
] as const;

export default function CinemaFlipWords() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % genres.length), 2800);
    return () => clearInterval(id);
  }, []);

  const current = genres[index];

  return (
    // Preserve "Watch ___ cinema" baseline — only the middle word is custom
    <p
      className="text-2xl md:text-3xl font-bold text-white tracking-wide"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      Watch{' '}
      <AnimatePresence mode="wait">
        <motion.span
          key={current.word}
          // Film-splice: near-instant cut with a tiny vertical snap
          initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
          exit={{    opacity: 0, y: -14, filter: 'blur(4px)' }}
          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="inline-flex items-baseline gap-1 whitespace-nowrap"
          style={{
            color:        current.color,
            fontFamily:   current.fontFamily,
            fontSize:     current.fontSize,
            letterSpacing: current.letterSpacing,
            lineHeight:   1,
          }}
        >
          {current.word}
          <span className="ml-1" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7em', letterSpacing: 'normal' }}>
            {current.suffix}
          </span>
        </motion.span>
      </AnimatePresence>
      {' '}cinema
    </p>
  );
}
