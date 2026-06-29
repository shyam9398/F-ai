"use client";

import { Star, FileText } from "lucide-react";

interface PaperStatsProps {
  citations: number;
  usage: number;
}

export default function PaperStats({ citations, usage }: PaperStatsProps) {
  const formatNumber = (num: number) => {
    return typeof num === "number" ? num.toLocaleString() : "0";
  };

  return (
    <div className="flex flex-col gap-4 text-left border-l border-border pl-6 pr-4 min-w-[200px]">
      <div className="flex items-start gap-2.5">
        <Star className="w-[18px] h-[18px] text-gray-700 mt-0.5 stroke-[1.5]" />
        <div>
          <span className="block text-base font-extrabold text-textDark leading-none">
            {formatNumber(citations)}
          </span>
          <span className="text-xs text-secondaryText font-medium mt-1.5 block">
            Citations
          </span>
        </div>
      </div>
      
      <div className="flex items-start gap-2.5">
        <FileText className="w-[18px] h-[18px] text-gray-700 mt-0.5 stroke-[1.5]" />
        <div>
          <span className="block text-base font-extrabold text-textDark leading-none">
            {formatNumber(usage)}
          </span>
          <span className="text-xs text-secondaryText font-medium mt-1.5 block">
            Papers using this method
          </span>
        </div>
      </div>
    </div>
  );
}
