"use client";

import { motion } from "framer-motion";

export default function MethodIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="w-full flex flex-col bg-transparent border border-[#E5E5D8] rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden select-none animate-fade-in relative h-[165px]"
    >
      {/* Brain Diagram Area - Proportional containing layout with no URL text below */}
      <div className="flex-grow flex items-center justify-center p-2 h-full">
        <img
          src="/brain_diagram.png"
          alt="LLM brain schematic illustration diagram"
          className="w-full h-full max-h-[145px] object-contain"
        />
      </div>
    </motion.div>
  );
}
