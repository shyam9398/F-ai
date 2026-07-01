"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function MethodStats({ activeCategory }: { activeCategory?: string }) {
  const [totalCount, setTotalCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        const url = activeCategory && activeCategory !== "All Methods"
          ? `/api/papers?method=${encodeURIComponent(activeCategory)}&limit=1`
          : "/api/papers?limit=1";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const count = typeof data.totalCount === "number" ? data.totalCount : (Array.isArray(data) ? data.length : 0);
          setTotalCount(count);
        } else {
          setTotalCount(0);
        }
      } catch (err) {
        console.error("Failed to fetch dynamic paper count:", err);
        setTotalCount(0);
      }
    }
    fetchCount();
  }, [activeCategory]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="inline-flex items-center gap-2.5 p-2 px-3 bg-white border border-[#E5E5D8] rounded-[6px] shadow-sm select-none"
    >
      {/* Icon Container */}
      <div className="flex items-center justify-center p-1.5 bg-orange-50 rounded-[4px] border border-orange-100/50 text-primary">
        <FileText className="w-3.5 h-3.5 stroke-[2]" />
      </div>
      
      {/* Text Container */}
      <div className="flex flex-col text-left font-sans">
        <span className="text-[8px] font-black text-[#8B8B8B] uppercase tracking-[0.08em] leading-none">
          PAPERS USING
        </span>
        <span className="text-[14px] font-bold text-[#F55036] mt-1 leading-none tabular-nums">
          {totalCount !== null ? totalCount.toLocaleString() : "..."}
        </span>
      </div>
    </motion.div>
  );
}
