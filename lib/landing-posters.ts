/**
 * Poster paths for the landing-page cursor trail.
 *
 * These are hardcoded TMDB paths rather than a live query: the landing page is
 * statically rendered and the effect is purely decorative, so a network round
 * trip would be wasted. The trade-off is that if TMDB ever rotates a path, that
 * one poster silently 404s — the trail degrades rather than breaking.
 */

import { tmdbImage } from "./tmdb";

const SET_A_PATHS = [
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
];

const SET_B_PATHS = [
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
];

const toUrls = (paths: readonly string[]) =>
    paths.map((path) => tmdbImage(path, "w300")).filter((url): url is string => url !== null);

/** Two curated sets so repeat visitors don't always see the same wall. */
export const POSTER_SETS = [toUrls(SET_A_PATHS), toUrls(SET_B_PATHS)] as const;
