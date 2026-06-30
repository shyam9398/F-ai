"use client";

import { FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function MethodStats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="inline-flex items-center gap-3.5 p-2.5 bg-white border border-border rounded-card shadow-card-sm min-w-[150px]"
    >
      {/* Icon Container */}
      <div className="flex items-center justify-center p-2.5 bg-orange-50 rounded-lg border border-orange-100/50 text-primary">
        <FileText className="w-4 h-4 stroke-[1.8]" />
      </div>
      
      {/* Text Container */}
      <div className="flex flex-col text-left">
        <span className="text-[9px] font-extrabold text-secondaryText uppercase tracking-widest leading-none">
          PAPERS USING
        </span>
        <span className="text-lg font-black text-primary mt-1.5 leading-none">
          26,919
        </span>
      </div>
    </motion.div>
  );
}
