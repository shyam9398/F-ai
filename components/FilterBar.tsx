"use client";

import { useRef } from "react";
import SortDropdown from "./SortDropdown";

interface FilterBarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  currentSort: string;
  onSortChange: (sort: string) => void;
  methods: { name: string; slug: string; paper_count: number }[];
  totalPapersCount: number;
}

export default function FilterBar({
  activeCategory,
  onCategoryChange,
  currentSort,
  onSortChange,
  methods,
  totalPapersCount,
}: FilterBarProps) {
  // Combine total count for 'All Methods' and join individual method counts from database
  const categories = [
    { name: "All Methods", count: totalPapersCount },
    ...methods.map((m) => ({ name: m.name, count: m.paper_count })),
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  // Smooth wheel horizontal scroll helper
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      e.preventDefault();
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="flex flex-row items-center justify-between bg-white border border-[#EBEAE2] rounded-card h-[60px] px-6 w-full select-none flex-nowrap shadow-xs">
      
      {/* 1. Fixed Left Label */}
      <span className="text-xs font-black text-secondaryText tracking-widest uppercase shrink-0 mr-6 hidden md:flex items-center">
        FILTER METHODS
      </span>

      {/* 2. Horizontally Scrollable Middle Container */}
      <div 
        ref={scrollRef}
        onWheel={handleWheel}
        className="flex-grow overflow-x-auto flex flex-row items-center gap-2.5 scrollbar-thin py-1 select-none flex-nowrap"
        style={{ scrollbarWidth: "thin" }}
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.name;
          return (
            <button
              key={category.name}
              onClick={() => onCategoryChange(category.name)}
              className={`h-[34px] px-4 text-xs font-bold rounded-[10px] transition-all duration-200 cursor-pointer border shrink-0 flex items-center whitespace-nowrap uppercase tracking-wider ${
                isActive
                  ? "bg-[#FFF3EE] text-[#FF6A3D] border-[#FF6A3D] shadow-xs"
                  : "bg-white text-[#2F2F2F] border-border hover:border-[#FF6A3D]/40"
              }`}
            >
              <span>{category.name}</span>
              <span className={`text-[10px] ml-2 font-black tracking-normal normal-case px-2 py-0.5 rounded-full ${
                isActive ? 'bg-[#FF6A3D] text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {category.count.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Fixed Right Sort Dropdown */}
      <div className="shrink-0 ml-6 pl-2 flex items-center">
        <SortDropdown currentSort={currentSort} onSortChange={onSortChange} />
      </div>
    </div>
  );
}
