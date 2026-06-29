"use client";

import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function MethodIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col bg-white border border-border rounded-card overflow-hidden shadow-card-sm h-full justify-between select-none"
    >
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#FFFAF7] min-h-[260px] relative">
        {/* Core Schematic Diagram SVG */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 420 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="max-w-[360px]"
        >
          {/* Connection Lines (Gray & light orange) */}
          <path d="M70 110 H130" stroke="#FF5A1F" strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M100 160 C120 160 130 140 150 130" stroke="#FF5A1F" strokeOpacity="0.2" strokeWidth="1.5" />
          <path d="M300 130 C320 140 330 150 350 150" stroke="#FF5A1F" strokeOpacity="0.2" strokeWidth="1.5" />
          <path d="M300 90 L340 70" stroke="#FF5A1F" strokeOpacity="0.2" strokeWidth="1.5" />
          <path d="M120 50 L160 70" stroke="#FF5A1F" strokeOpacity="0.2" strokeWidth="1.5" />
          <path d="M210 160 V180" stroke="#FF5A1F" strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Brain Outline / Schematic Drawing */}
          {/* Left Hemisphere */}
          <path
            d="M210 40 C170 40 150 60 150 90 C150 105 160 115 155 125 C150 135 160 155 180 155 C190 155 195 150 205 155 C210 158 210 160 210 160"
            stroke="#FFD5C6"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Right Hemisphere */}
          <path
            d="M210 40 C250 40 270 60 270 90 C270 105 260 115 265 125 C270 135 260 155 240 155 C230 155 225 150 215 155 C210 158 210 160 210 160"
            stroke="#FFD5C6"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Brain internal neural folds details */}
          <path d="M175 75 C165 85 175 95 185 95 C195 95 190 85 200 80" stroke="#FFD5C6" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M245 75 C255 85 245 95 235 95 C225 95 230 85 220 80" stroke="#FFD5C6" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M170 110 C165 120 175 130 185 125" stroke="#FFD5C6" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M250 110 C255 120 245 130 235 125" stroke="#FFD5C6" strokeWidth="1.5" strokeLinecap="round" />

          {/* Floating Boxes */}
          {/* 1. Speech Bubble (Top Left) */}
          <g transform="translate(45, 20)">
            <rect width="45" height="28" rx="8" fill="white" stroke="#FFE9E1" strokeWidth="1.5" />
            <path d="M40 28 L43 33 L35 28 Z" fill="white" stroke="#FFE9E1" strokeWidth="1.5" />
            <line x1="8" y1="9" x2="37" y2="9" stroke="#FFD2C2" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="14" x2="28" y2="14" stroke="#FFD2C2" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="19" x2="20" y2="19" stroke="#FFD2C2" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* 2. Text Box with Lines (Right Middle) */}
          <g transform="translate(325, 90)">
            <rect width="50" height="32" rx="8" fill="white" stroke="#FFE9E1" strokeWidth="1.5" />
            <line x1="10" y1="10" x2="40" y2="10" stroke="#FFD2C2" strokeWidth="2" strokeLinecap="round" />
            <line x1="10" y1="16" x2="35" y2="16" stroke="#FFD2C2" strokeWidth="2" strokeLinecap="round" />
            <line x1="10" y1="22" x2="25" y2="22" stroke="#FFD2C2" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* 3. Letter T (Left Middle) */}
          <g transform="translate(45, 90)">
            <rect width="25" height="25" rx="6" fill="white" stroke="#FFE9E1" strokeWidth="1.5" />
            <text x="12.5" y="17.5" fill="#FF5A1F" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">T</text>
          </g>

          {/* 4. Letter C (Left Bottom) */}
          <g transform="translate(75, 145)">
            <rect width="25" height="25" rx="6" fill="white" stroke="#FFE9E1" strokeWidth="1.5" />
            <text x="12.5" y="17.5" fill="#FF5A1F" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">C</text>
          </g>

          {/* 5. Letter A (Right Top) */}
          <g transform="translate(345, 30)">
            <rect width="25" height="25" rx="6" fill="white" stroke="#FFE9E1" strokeWidth="1.5" />
            <text x="12.5" y="17.5" fill="#FF5A1F" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">A</text>
          </g>

          {/* 6. Triple Dots Speech Bubble (Bottom Center) */}
          <g transform="translate(195, 175)">
            <rect width="30" height="20" rx="6" fill="white" stroke="#FFE9E1" strokeWidth="1.5" />
            <circle cx="9" cy="10" r="1.5" fill="#FF5A1F" />
            <circle cx="15" cy="10" r="1.5" fill="#FF5A1F" />
            <circle cx="21" cy="10" r="1.5" fill="#FF5A1F" />
          </g>

          {/* 7. Center AI Solid Badge */}
          <g transform="translate(190, 85)">
            <rect width="40" height="35" rx="8" fill="#FF5A1F" />
            <text x="20" y="22" fill="white" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">AI</text>
          </g>
        </svg>
      </div>

      {/* Website link section with external links on both sides */}
      <div className="border-t border-border p-4 bg-white">
        <a
          href="https://dataspirant.com/llm/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-primary hover:text-orangeHover transition-colors font-semibold group py-1.5"
        >
          <ExternalLink className="w-4 h-4 text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          <span>https://dataspirant.com/llm/</span>
          <ExternalLink className="w-4 h-4 text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </motion.div>
  );
}
