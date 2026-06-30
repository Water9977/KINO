'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import CinemaFlipWords from '@/components/CinemaFlipWords';

const EvilEye = dynamic(() => import('@/components/EvilEye'), { ssr: false });
const ImageTrail = dynamic(() => import('@/components/ImageTrail'), { ssr: false });

const BASE = 'https://image.tmdb.org/t/p/w300';

const SET_A = [
  '/ve72VxNqjGM69Uky4WTo2bK6rfq.jpg', // 2001: A Space Odyssey
  '/uAR0AWqhQL1hQa69UDEbb2rE5Wx.jpg', // The Shining
  '/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg', // Pulp Fiction
  '/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg', // Fight Club
  '/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg', // Blade Runner
  '/gQB8Y5RCMkv2zwzFHbUJX3kAhvA.jpg', // Apocalypse Now
  '/4sHeTAp65WrSSuc05nRBKddhBxO.jpg', // A Clockwork Orange
  '/ekstpH614fwDX8DUln1a2Opz0N8.jpg', // Taxi Driver
  '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', // The Godfather
  '/9OkCLM73MIU2CrKZbqiT8Ln1wY2.jpg', // GoodFellas
  '/x7A59t6ySylr1L7aubOQEA480vM.jpg', // Mulholland Drive
  '/9BTwsLaMVHOGFlmsSlx5QYCaXb.jpg',  // Requiem for a Dream
  '/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg', // Eternal Sunshine
  '/fa0RDkAlCec0STeMNAhPaF89q6U.jpg',  // There Will Be Blood
  '/uB7RDZby43Wvu8SKGHHTwGyTDBX.jpg', // No Country for Old Men
  '/eCOtqtfvn7mxGl6nfmq4b1exJRc.jpg',  // Her
  '/qLnfEmPrDjJfPyyddLJPkXmshkp.jpg', // Moonlight
  '/viWheBd44bouiLCHgNMvahLThqx.jpg', // Black Swan
  '/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg', // Interstellar
  '/zOVCqKUzjFKqa1eDMcOzvXwthY4.jpg', // The Grand Budapest Hotel
].map(p => BASE + p);

const SET_B = [
  '/hA2ple9q4qnwxp3hKVNhroipsir.jpg', // Mad Max: Fury Road
  '/7fn624j5lj3xTme2SgiLCeuedmO.jpg', // Whiplash
  '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', // Parasite
  '/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', // Joker
  '/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg', // Get Out
  '/dmJW8IAKHKxFNiUnoDR7JfsK7Rp.jpg', // Ex Machina
  '/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg', // Arrival
  '/602vevIURmpDfzbnv5Ubi6wIkQm.jpg', // Drive
  '/4GFPuL14eXi66V96xBWY73Y9PfR.jpg', // Hereditary
  '/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg', // Midsommar
  '/yAKNmpcUweGH6WMCEWenwU9PsbE.jpg', // The Lighthouse
  '/4YRplSk6BhH6PRuE9gfyw9byUJ6.jpg', // Annihilation
  '/fjny9chXPx69ln1LMJxbwi5yHMt.jpg', // mother!
  '/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg', // La La Land
  '/iZf0KyrE25z1sage4SYFLCCrMi9.jpg',  // 1917
  '/ji3ecJphATlVgWNY0B0RVXZizdf.jpg',  // The Revenant
  '/55wmcXJIDYITr7JDijJTdvwSaAv.jpg', // Under the Skin
  '/kXiF80o74fE9gf3Utf9moAI7ar0.jpg',  // Burning
  '/kWjjFSng1JttmDRwDROoGcIArEh.jpg', // Only God Forgives
  '/krKnsfvSJM1PL40tLicRhVQ6kuG.jpg', // Enter the Void
].map(p => BASE + p);

export default function HomePage() {
  const [posters] = useState<string[]>(() => (Math.random() > 0.5 ? SET_A : SET_B));

  return (
    <main className="relative h-screen w-screen overflow-hidden" style={{ background: '#0a0a0a' }}>
      {/* Layer 1 — ImageTrail cursor effect (fixed, pointer-events: none) */}
      <ImageTrail items={posters} />

      {/* Center column — no z-index on wrapper so children stack in root context */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center px-6">

        {/* z-2: EvilEye — just above background, ImageTrail (z-10) renders over it */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-[2]"
          style={{ width: 'min(300px, 44vw)', height: 'min(200px, 29vw)', flexShrink: 0 }}
        >
          <EvilEye
            eyeColor="#FF6F37"
            backgroundColor="#0a0a0a"
            intensity={1.3}
            scale={0.75}
            glowIntensity={0.4}
            pupilFollow={0}
            flameSpeed={0.9}
          />
        </motion.div>

        {/* z-20: KINO logo — above ImageTrail */}
        <motion.h1
          initial={{ opacity: 0, y: -36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-20 font-black tracking-tight leading-none select-none"
          style={{ fontSize: 'clamp(4.5rem, 20vw, 14rem)' }}
        >
          <span className="text-white">KIN</span>
          <span style={{ color: '#2563eb', filter: 'drop-shadow(0 0 48px rgba(37,99,235,0.6))' }}>O</span>
        </motion.h1>

        {/* z-20: CinemaFlipWords */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.55 }}
          className="relative z-20"
        >
          <CinemaFlipWords />
        </motion.div>

        {/* z-20: CTA — clean pill button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-20"
        >
          <Link
            href="/browse"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[#2563eb] px-8 py-[14px] font-semibold text-white tracking-wide transition-all duration-300 hover:shadow-[0_0_48px_rgba(37,99,235,0.5)] active:scale-95 select-none"
            style={{ fontSize: '0.95rem', fontFamily: 'var(--font-outfit)' }}
          >
            <span
              className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)' }}
              aria-hidden
            />
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="relative w-[18px] h-[18px] shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
            >
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
            <span className="relative">Start Streaming</span>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
