/**
 * Hero Section Component
 * 
 * Premium hero section with gradient background and animated elements
 * Features brand identity, value proposition, and visual polish
 * 
 * @module components/home/HeroSection
 * @created 2026-01-20
 * @updated 2026-01-20 - Enhanced to AAA quality with premium design
 */

import { title, subtitle } from "@/components/primitives";
import { Chip } from "@heroui/chip";

export const HeroSection = () => {
  return (
    <section className="relative flex flex-col items-center justify-center gap-4 py-8 md:py-12 border-b border-divider overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-success/5 animate-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      
      {/* Content */}
      <div className="relative inline-block max-w-5xl text-center justify-center px-4 z-10">
        {/* Badge */}
        <Chip 
          variant="flat" 
          color="primary" 
          size="sm"
          className="mb-4 font-semibold"
        >
          ✨ AI-Powered Content Curation
        </Chip>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3">
          <span className="bg-gradient-to-r from-primary via-secondary to-success bg-clip-text text-transparent">
            Aggronation
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl font-semibold text-foreground/80 mb-4">
          Your Intelligent AI Content Hub
        </p>

        {/* Description */}
        <p className="text-sm md:text-base text-default-600 max-w-2xl mx-auto mb-6 leading-relaxed">
          Discover, track, and explore the latest AI developments from across the web.
          <br className="hidden md:block" />
          All your sources, one powerful dashboard.
        </p>

        {/* Source Pills */}
        <div className="flex flex-wrap gap-3 justify-center items-center">
          <Chip variant="bordered" startContent="📰" className="font-medium">RSS Feeds</Chip>
          <Chip variant="bordered" startContent="🔴" className="font-medium">Reddit</Chip>
          <Chip variant="bordered" startContent="▶️" className="font-medium">YouTube</Chip>
          <Chip variant="bordered" startContent="✕" className="font-medium">X Posts</Chip>
        </div>

        {/* Feature highlight */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-default-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Powered by custom rating & decay algorithms</span>
        </div>
      </div>
    </section>
  );
};
