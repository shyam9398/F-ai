"use client";

import SortDropdown from "./SortDropdown";

interface FilterBarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  currentSort: string;
  onSortChange: (sort: string) => void;
}

export default function FilterBar({
  activeCategory,
  onCategoryChange,
  currentSort,
  onSortChange,
}: FilterBarProps) {
  const categories = [
    "All Methods",
    "Architecture",
    "Optimization",
    "Training",
    "Attention",
    "Regularization",
    "Embedding"
  ];

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 p-2 bg-white border border-border rounded-card shadow-card-sm w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full lg:w-auto">
        <span className="text-[11px] font-extrabold text-secondaryText tracking-widest uppercase whitespace-nowrap px-2">
          FILTER METHODS
        </span>
        
        {/* Pills container */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-3 py-1.5 text-[12px] font-semibold rounded-[12px] transition-all duration-250 cursor-pointer border ${
                  isActive
                    ? "bg-white text-primary border-primary"
                    : "bg-white text-textDark border-border hover:border-primary hover:bg-[#FFF7ED]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="self-end lg:self-auto px-2">
        <SortDropdown currentSort={currentSort} onSortChange={onSortChange} />
      </div>
    </div>
  );
}
