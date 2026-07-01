"use client";

import { FileText } from "lucide-react";
import { motion } from "framer-motion";
import MethodStats from "./MethodStats";
import MethodIllustration from "./MethodIllustration";

export default function MethodHero({ activeCategory }: { activeCategory?: string }) {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 py-3 select-none">
      {/* Left side (60% width) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex-grow lg:max-w-[58%] flex flex-col items-start text-left justify-center"
      >
        {/* Method Badge */}
        <div className="flex items-center space-x-1.5 mb-3.5">
          <div className="p-1 bg-orange-50 rounded-[4px] border border-orange-100/50">
            <FileText className="w-3.5 h-3.5 text-[#F55036] stroke-[2.2]" />
          </div>
          <span className="text-[9px] font-black text-[#8B8B8B] tracking-[0.08em] uppercase">
            METHOD
          </span>
        </div>
        
        {/* Heading */}
        <h1 className="text-[26px] md:text-[30px] lg:text-[34px] font-bold tracking-tight text-[#111111] leading-[1.2] mb-3">
          Large Language Model (LLM)
        </h1>
        
        {/* Description */}
        <p className="text-[13px] text-[#555555] leading-relaxed max-w-[620px] mb-4.5">
          A large language model (LLM) is an advanced artificial intelligence (AI) system that learns to understand, generate, and process human language by being trained on vast amounts of text data.
        </p>
        
        <MethodStats activeCategory={activeCategory} />
      </motion.div>
      
      {/* Right side (40% width) */}
      <div className="w-full lg:max-w-[36%] flex-1">
        <MethodIllustration />
      </div>
    </div>
  );
}
