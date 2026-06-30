"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function MethodIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="w-full flex flex-col bg-transparent border border-[#E5E5D8] rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden select-none animate-fade-in relative h-[165px]"
    >
      {/* Brain Diagram Area - Proportional containing layout */}
      <div className="flex-grow flex items-center justify-center p-2.5 pb-8 h-full">
        <img
          src="/brain_diagram.png"
          alt="LLM brain schematic illustration diagram"
          className="h-full max-h-[115px] w-auto object-contain"
        />
      </div>

      {/* Clickable Link at the bottom center of the image card itself */}
      <a
        href="https://dataspirant.com/llm/"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-1 w-auto text-[11px] font-sans font-medium text-[#F55036] hover:underline"
      >
        <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
        <span>https://dataspirant.com/llm/</span>
        <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
      </a>
    </motion.div>
  );
}
