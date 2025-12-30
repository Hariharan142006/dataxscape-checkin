import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";

// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
//   display: "swap",
// });

export const metadata: Metadata = {
  title: "HackPortal 2024",
  description: "Hackathon Event Management Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
        {/* Tailwind CDN script from user template removed as we use local tailwind setup, but configs ported to globals.css */}
      </head>
      <body className={`font-sans antialiased bg-background-light dark:bg-background-dark text-slate-900 dark:text-white`}>
        <div className="fixed inset-0 w-full h-full bg-noise opacity-40 mix-blend-overlay pointer-events-none z-[9999]"></div>
        <div className="relative z-0">
          {/* No dynamic import needed for MotionWrapper if "use client" is inside it, but RootLayout is server. 
                 We need to import MotionWrapper as a component. */}
          {children}
        </div>
      </body>
    </html>
  );
}
