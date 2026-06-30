'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Each genre gets its own Dirtyline Studio font via the CSS variable that
 * next/font/local injected on <html>. Using var(--font-*) instead of a raw
 * font-family string means the browser uses exactly the preloaded file — no
 * flash, no fallback swap.
 *
 * Color logic:
 *  romantic  — deep warm pink    (#EC4899)  — soft, emotive
 *  action    — blood crimson     (#DC143C)  — Crimson: classic blood red
 *  thriller  — deep cyan         (#06B6D4)  — cold & suspenseful
 *  horror    — dark violet       (#7C3AED)  — sinister, not neon-purple
 *  sci-fi    — OrangeRed fire    (#FF4500)  — rocket exhaust / reentry glow.
 *               Clearly RED-fire vs crime's YELLOW-amber. Different hue family.
 *  crime     — vintage amber     (#D97706)  — old film grain, cigarette smoke
 *
 * No two genres share the same hue family. All pass readable contrast as
 * large display text on #0a0a0a.
 */
const genres = [
  {
    word: 'romantic',
    color: '#EC4899',
    fontVar: 'var(--font-sweetline)',
    fontSize: '1.65em',
    letterSpacing: '0.02em',
    suffix: ' ❤️',
  },
  {
    word: 'action',
    color: '#DC143C',                  // Crimson — blood red that reads on black
    fontVar: 'var(--font-blackheat)',
    fontSize: '1.1em',
    letterSpacing: '0.12em',
    suffix: ' 💥',
  },
  {
    word: 'thriller',
    color: '#06B6D4',
    fontVar: 'var(--font-blacktheory)',
    fontSize: '1.05em',
    letterSpacing: '0.06em',
    suffix: ' 🔪',
  },
  {
    word: 'horror',
    color: '#7C3AED',                  // dark violet — brooding, not neon
    fontVar: 'var(--font-skywalker)',
    fontSize: '1.15em',
    letterSpacing: '0.04em',
    suffix: ' 💀',
  },
  {
    word: 'sci-fi',
    // #FF4500 = OrangeRed: rocket exhaust, reentry glow — clearly RED-fire,
    // not YELLOW-orange like crime's amber. Perceptually distinct hue family.
    color: '#FF4500',
    // HumblleRoughCaps: all-caps, rough textured display font — 306KB, visually
    // unmistakeable. Nothing like Outfit or any system font.
    fontVar: 'var(--font-humbllerought)',
    fontSize: '1.1em',
    letterSpacing: '0.1em',
    suffix: ' 🌌',
  },
  {
    word: 'crime',
    color: '#D97706',                  // vintage amber — old film grain
    fontVar: 'var(--font-hoodsonscript)',
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
    // Outer line keeps "Watch" and "cinema" in the site's standard font
    <p
      className="text-2xl md:text-3xl font-bold text-white tracking-wide"
      style={{ fontFamily: 'var(--font-outfit)' }}
    >
      Watch{' '}
      <AnimatePresence mode="wait">
        <motion.span
          key={current.word}
          // Film-splice: snap cut with a minimal vertical drift + blur
          initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
          exit={{    opacity: 0, y: -14, filter: 'blur(4px)' }}
          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="inline-flex items-baseline gap-1 whitespace-nowrap"
          style={{
            color:         current.color,
            fontFamily:    current.fontVar,   // ← CSS variable, not a string
            fontSize:      current.fontSize,
            letterSpacing: current.letterSpacing,
            lineHeight:    1,
          }}
        >
          {current.word}
          {/* Reset emoji back to standard font so it renders properly */}
          <span
            className="ml-1"
            style={{ fontFamily: 'var(--font-outfit)', fontSize: '0.7em', letterSpacing: 'normal' }}
          >
            {current.suffix}
          </span>
        </motion.span>
      </AnimatePresence>
      {' '}cinema
    </p>
  );
}
