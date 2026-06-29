"use client";

import { ArrowRight, FileText } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Tag from "./Tag";
import PaperStats from "./PaperStats";
import { Paper } from "../data/methods";
import { usePDFThumbnail } from "../hooks/usePDFThumbnail";

interface ResearchPaperCardProps {
  paper: Paper;
}

export default function ResearchPaperCard({ paper }: ResearchPaperCardProps) {
  const { thumbnail, loading } = usePDFThumbnail(paper.pdf_url);

  // Helper to render description with "Transformer" colored in orange
  const renderHighlightedDescription = (desc: string = "") => {
    const term = "Transformer";
    if (desc && desc.includes(term)) {
      const parts = desc.split(term);
      return (
        <>
          {parts[0]}
          <span className="text-primary font-semibold">{term}</span>
          {parts[1]}
        </>
      );
    }
    return desc || "";
  };

  if (!paper) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="group flex flex-col md:flex-row items-stretch gap-6 p-5 bg-white border border-border rounded-card hover:shadow-card-lg hover:-translate-y-[2px] transition-all duration-300 cursor-pointer md:h-[180px] overflow-hidden justify-between"
    >
      {/* Left Column: Paper Thumbnail (Live Generated Page 1) */}
      <div className="flex-shrink-0 self-center md:self-auto w-[110px] h-[145px] rounded-lg border border-border overflow-hidden bg-gray-50 relative flex items-center justify-center">
        {loading ? (
          <div className="w-full h-full animate-pulse bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-400">
            Generating...
          </div>
        ) : thumbnail ? (
          <Image
            src={thumbnail}
            alt={`${paper.title} thumbnail`}
            width={110}
            height={145}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gradient-to-br from-rose-50 to-orange-50 text-primary">
            <FileText className="w-8 h-8 opacity-80" />
            <span className="text-[10px] font-bold uppercase tracking-wider mt-2 text-center leading-none text-rose-500">
              {paper.category}
            </span>
          </div>
        )}
      </div>

      {/* Center Column: Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div className="text-left">
          <h4 className="text-[26px] font-semibold text-textDark group-hover:text-primary transition-colors mb-1 leading-tight truncate">
            {paper.title}
          </h4>
          
          <p className="text-sm text-secondaryText mb-2 font-medium">
            {paper.authors} • <span className="font-semibold text-gray-400">{paper.conference || paper.journal} • {paper.year}</span>
          </p>
          
          <p className="text-sm text-secondaryText leading-relaxed line-clamp-2">
            {renderHighlightedDescription(paper.abstract)}
          </p>
        </div>

        {/* Tags Row */}
        <div className="flex flex-wrap gap-2 mt-2">
          {paper.tags && paper.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      </div>

      {/* Right Column: Stats & Action Arrow */}
      <div className="flex items-center justify-between gap-4 self-center md:self-auto w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
        <PaperStats citations={paper.citations || 0} usage={paper.usage || 0} />
        
        {/* Right Arrow Icon */}
        <div className="flex items-center justify-center w-10 h-10">
          <ArrowRight className="w-6 h-6 text-gray-700 group-hover:text-primary group-hover:translate-x-1.5 transition-transform duration-250" />
        </div>
      </div>
    </motion.div>
  );
}
