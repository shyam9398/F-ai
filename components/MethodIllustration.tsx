"use client";

import { motion } from "framer-motion";

export default function MethodIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="w-full h-full flex items-center justify-center select-none max-w-[280px] max-h-[280px]"
    >
      <img
        src="/brain_diagram.png"
        alt="LLM brain schematic illustration diagram"
        className="w-full h-auto object-contain rounded-card border border-border shadow-card-sm"
      />
    </motion.div>
  );
}
