# 🎬 Kino Web

A modern, high-performance movie streaming application built with Next.js 14. Kino Web offers a premium user experience with fluid animations, infinite scrolling, and a vast library of movies and TV shows powered by TMDB.

## ✨ Features

-   **Infinite Scrolling:** Browse endless lists of movies in categories like Trending, Popular, Top Rated, and Upcoming.
-   **Dynamic Category Pages:** Dedicated pages for each genre and category with batched loading for optimal performance.
-   **TV Show Support:** Full support for TV series with a custom season and episode selector.
-   **Advanced Search:** Real-time search functionality for movies and TV shows.
-   **Premium UI/UX:**
    -   Glassmorphism design language.
    -   GPU-accelerated animations (60fps+).
    -   Responsive grid layouts.
-   **Video Player:** Integrated video player with multiple server options (VidSrc, SmashyStream) for reliable playback.

## 🛠️ Tech Stack

-   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Icons:** [Lucide React](https://lucide.dev/)
-   **Animations:** CSS Transitions & Framer Motion
-   **Data Source:** [TMDB API](https://www.themoviedb.org/documentation/api)

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+ installed
-   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/kino-web.git
    cd kino-web
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory and add your TMDB API key:
    ```env
    NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
    NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
    NEXT_PUBLIC_TMDB_IMAGE_URL=https://image.tmdb.org/t/p/original
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the app:**
    Visit `http://localhost:3000` in your browser.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
