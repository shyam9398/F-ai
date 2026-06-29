"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Tag from "./Tag";
import PaperStats from "./PaperStats";
import { Paper } from "../data/methods";

interface ResearchPaperCardProps {
  paper: Paper;
}

export default function ResearchPaperCard({ paper }: ResearchPaperCardProps) {
  // Helper to render description with "Transformer" colored in orange
  const renderHighlightedDescription = (desc: string) => {
    const term = "Transformer";
    if (desc.includes(term)) {
      const parts = desc.split(term);
      return (
        <>
          {parts[0]}
          <span className="text-primary font-semibold">{term}</span>
          {parts[1]}
        </>
      );
    }
    return desc;
  };

  const handleCardClick = () => {
    window.open(paper.externalLink, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={handleCardClick}
      className="group flex flex-col md:flex-row items-stretch gap-6 p-5 bg-white border border-border rounded-card hover:shadow-card-lg hover:-translate-y-[2px] transition-all duration-300 cursor-pointer md:h-[180px] overflow-hidden justify-between"
    >
      {/* Left Column: Paper Thumbnail (Next.js Image) */}
      <div className="flex-shrink-0 self-center md:self-auto w-[110px] h-[145px] rounded-lg border border-border overflow-hidden bg-white relative">
        <Image
          src={paper.thumbnail}
          alt={`${paper.title} thumbnail`}
          width={110}
          height={145}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      {/* Center Column: Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div>
          <h4 className="text-[26px] font-semibold text-textDark group-hover:text-primary transition-colors mb-1 leading-tight truncate">
            {paper.title}
          </h4>
          
          <p className="text-sm text-secondaryText mb-2 font-medium">
            {paper.authors} • <span className="font-semibold text-gray-400">{paper.conference} • {paper.year}</span>
          </p>
          
          <p className="text-sm text-secondaryText leading-relaxed line-clamp-2">
            {renderHighlightedDescription(paper.description)}
          </p>
        </div>

        {/* Tags Row */}
        <div className="flex flex-wrap gap-2 mt-2">
          {paper.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      </div>

      {/* Right Column: Stats & Action Arrow */}
      <div className="flex items-center justify-between gap-4 self-center md:self-auto w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
        <PaperStats citations={paper.citations} usage={paper.usage} />
        
        {/* Right Arrow Icon */}
        <div className="flex items-center justify-center w-10 h-10">
          <ArrowRight className="w-6 h-6 text-gray-700 group-hover:text-primary group-hover:translate-x-1.5 transition-transform duration-250" />
        </div>
      </div>
    </motion.div>
  );
}
