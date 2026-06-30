'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const GunIcon = ({ color }: { color: string }) => (
  <svg
    viewBox="0 0 80 50"
    fill={color}
    className="inline-block ml-2 -mb-1"
    style={{ width: '1.1em', height: '0.7em' }}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Barrel */}
    <rect x="30" y="13" width="48" height="11" rx="4" />
    {/* Body */}
    <rect x="4" y="13" width="30" height="19" rx="5" />
    {/* Grip */}
    <rect x="7" y="32" width="15" height="14" rx="4" />
    {/* Trigger guard */}
    <path
      d="M20 31 Q20 41 27 41 Q36 41 36 31"
      stroke={color}
      strokeWidth="3.5"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const genres = [
  { word: 'romantic',  color: '#f472b6', suffix: ' ❤️' },
  { word: 'action',    color: '#ef4444', suffix: null, icon: true },
  { word: 'thriller',  color: '#2dd4bf', suffix: ' 🔪' },
  { word: 'horror',    color: '#f97316', suffix: ' 💀' },
  { word: 'sci-fi',    color: '#818cf8', suffix: ' 🌌' },
  { word: 'crime',     color: '#fbbf24', suffix: ' 🃏' },
];

export default function CinemaFlipWords() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % genres.length), 2800);
    return () => clearInterval(id);
  }, []);

  const current = genres[index];

  return (
    <p className="text-2xl md:text-3xl font-bold text-white tracking-wide">
      Watch{' '}
      <AnimatePresence mode="wait">
        <motion.span
          key={current.word}
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          style={{ color: current.color }}
          className="inline-flex items-baseline"
        >
          {current.word}
          {current.suffix && <span className="ml-1">{current.suffix}</span>}
          {current.icon && <GunIcon color={current.color} />}
        </motion.span>
      </AnimatePresence>
      {' '}cinema
    </p>
  );
}
