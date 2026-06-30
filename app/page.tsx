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
      {/* Layer 0 — EvilEye full-screen background, static center, 15% bigger (scale 0.87) */}
      <div className="absolute inset-0 z-0">
        <EvilEye
          eyeColor="#FF6F37"
          backgroundColor="#0a0a0a"
          intensity={1.1}
          scale={0.87}
          glowIntensity={0.28}
          pupilFollow={0}
          flameSpeed={0.9}
        />
      </div>

      {/* Layer 1 — ImageTrail cursor effect (fixed, pointer-events: none) */}
      <ImageTrail items={posters} />

      {/* Layer 2 — Center column: KINO → FlipWords → Button */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center gap-6 text-center px-6">

        {/* KINO logo */}
        <motion.h1
          initial={{ opacity: 0, y: -36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
          className="font-black tracking-tight leading-none select-none"
          style={{ fontSize: 'clamp(4.5rem, 20vw, 14rem)' }}
        >
          <span className="text-white">KIN</span>
          <span
            style={{
              color: '#2563eb',
              filter: 'drop-shadow(0 0 48px rgba(37,99,235,0.6))',
            }}
          >
            O
          </span>
        </motion.h1>

        {/* CinemaFlipWords */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.55 }}
        >
          <CinemaFlipWords />
        </motion.div>

        {/* Retro Ticket Stub CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          <Link href="/browse" className="group block select-none">
            {/* Outer ticket wrapper */}
            <div
              className="relative flex items-stretch transition-all duration-200 group-hover:-translate-y-0.5 group-active:translate-y-0"
              style={{
                /* round notch cutouts using radial-gradient mask bleeding into page bg */
                background: '#2563eb',
                borderRadius: '4px',
                boxShadow: '0 2px 0 #1d4ed8, 0 4px 24px rgba(37,99,235,0.25)',
              }}
            >
              {/* Left notch */}
              <span
                className="absolute -left-[10px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full"
                style={{ background: '#0a0a0a', zIndex: 2 }}
                aria-hidden
              />
              {/* Right notch */}
              <span
                className="absolute -right-[10px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full"
                style={{ background: '#0a0a0a', zIndex: 2 }}
                aria-hidden
              />

              {/* Main ticket body */}
              <div className="flex items-center gap-3 px-7 py-4">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-white shrink-0 group-hover:scale-110 transition-transform duration-200"
                >
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
                <span
                  className="font-bold text-white tracking-widest uppercase"
                  style={{ fontSize: '0.95rem', fontFamily: 'var(--font-sans)', letterSpacing: '0.14em' }}
                >
                  Start Streaming
                </span>
              </div>

              {/* Dashed divider */}
              <div
                className="self-stretch w-px shrink-0"
                style={{
                  background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 4px, transparent 4px, transparent 8px)',
                }}
                aria-hidden
              />

              {/* Counter-stub: ADMIT ONE */}
              <div className="flex flex-col items-center justify-center px-4 py-4 gap-0.5">
                <span
                  className="text-white/60 font-mono uppercase"
                  style={{ fontSize: '0.45rem', letterSpacing: '0.2em' }}
                >
                  ADMIT
                </span>
                <span
                  className="text-white font-black font-mono"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
                >
                  ONE
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
