"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface SortDropdownProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
}

export default function SortDropdown({ currentSort, onSortChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const options = ["Popular", "Newest", "Citations"];

  return (
    <div className="relative select-none font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-[165px] h-[34px] px-[18px] bg-white border border-[#E5E7EB] rounded-[10px] text-[14px] text-[#2F2F2F] hover:border-[#FF6A3D]/40 transition-all duration-200 focus:outline-hidden cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[#5F6672] font-normal">Sort by:</span>
          <span className="font-bold text-[#2F2F2F]">{currentSort}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-[165px] bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] py-1 z-10">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onSortChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-[18px] py-2.5 text-[14px] transition-colors cursor-pointer ${
                currentSort === option
                  ? "bg-[#FFF3EE] text-[#FF6A3D] font-bold"
                  : "text-[#2F2F2F] hover:bg-[#FAFAFA]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
