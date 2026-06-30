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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-border rounded-[12px] text-xs text-textDark hover:bg-lightGray transition-all shadow-card-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20"
      >
        <span className="text-secondaryText font-normal">Sort by:</span>
        <span className="font-semibold text-textDark">{currentSort}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-border rounded-[14px] shadow-card-lg py-1 z-10">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onSortChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                currentSort === option
                  ? "bg-orange-50 text-primary font-medium"
                  : "text-textDark hover:bg-lightGray"
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
