"use client";

import { FileText } from "lucide-react";
import { motion } from "framer-motion";
import MethodStats from "./MethodStats";
import MethodIllustration from "./MethodIllustration";

export default function MethodHero() {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-12 lg:gap-20 py-8">
      {/* Left side (60% width) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex-1 lg:max-w-[58%] flex flex-col items-start text-left"
      >
        {/* Method Badge */}
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="p-1 bg-orange-50 rounded-md border border-orange-100/50">
            <FileText className="w-3.5 h-3.5 text-primary stroke-[2]" />
          </div>
          <span className="text-[11px] font-extrabold text-secondaryText tracking-widest uppercase">
            METHOD
          </span>
        </div>
        
        {/* Heading */}
        <h1 className="text-[44px] md:text-[56px] xl:text-[64px] font-extrabold tracking-tight text-textDark leading-[1.1] mb-6">
          Large Language Model (LLM)
        </h1>
        
        {/* Description */}
        <p className="text-[20px] text-secondaryText leading-[1.8] mb-8 font-normal">
          A large language model (LLM) is an advanced artificial intelligence (AI) system that learns to understand, generate, and process human language by being trained on vast amounts of text data.
        </p>
        
        <MethodStats />
      </motion.div>
      
      {/* Right side (40% width) */}
      <div className="w-full lg:max-w-[42%] flex-1">
        <MethodIllustration />
      </div>
    </div>
  );
}
