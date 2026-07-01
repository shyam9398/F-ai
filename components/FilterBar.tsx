"use client";

import SortDropdown from "./SortDropdown";

interface FilterBarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  currentSort: string;
  onSortChange: (sort: string) => void;
  methods: { name: string; slug: string }[];
}

export default function FilterBar({
  activeCategory,
  onCategoryChange,
  currentSort,
  onSortChange,
  methods,
}: FilterBarProps) {
  const categories = [
    "All Methods",
    ...methods.map((m) => m.name)
  ];

  return (
    <div className="flex flex-row items-center justify-between bg-white border border-[#EAEAEA] rounded-[16px] h-[60px] px-[24px] w-full select-none flex-nowrap shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
      {/* Left container with label and scrollable filter pills */}
      <div className="flex flex-row items-center gap-[28px] overflow-x-auto md:overflow-x-visible scrollbar-none flex-nowrap flex-grow pr-4">
        {/* Label */}
        <span className="text-[14px] font-bold text-[#5F6672] tracking-[0.08em] uppercase shrink-0 w-[170px] flex items-center">
          FILTER METHODS
        </span>
        
        {/* Pills container */}
        <div className="flex flex-row items-center gap-[10px] overflow-x-auto md:overflow-x-visible scrollbar-none flex-nowrap py-1">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`h-[34px] px-[16px] text-[14px] font-medium rounded-[10px] transition-all duration-200 cursor-pointer border shrink-0 ${
                  isActive
                    ? "bg-[#FFF3EE] text-[#FF6A3D] border-[#FF6A3D]"
                    : "bg-white text-[#2F2F2F] border-[#E5E7EB] hover:border-[#FF6A3D]/40"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Right container with Sort dropdown */}
      <div className="shrink-0 ml-auto pl-2 flex items-center">
        <SortDropdown currentSort={currentSort} onSortChange={onSortChange} />
      </div>
    </div>
  );
}
