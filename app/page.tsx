"use client";

import { useState, useMemo } from "react";
import Breadcrumb from "../components/Breadcrumb";
import MethodHero from "../components/MethodHero";
import FilterBar from "../components/FilterBar";
import ResearchPaperCard from "../components/ResearchPaperCard";
import { papersData } from "../data/methods";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All Methods");
  const [currentSort, setCurrentSort] = useState("Popular");

  // Filtering papers based on category
  const filteredPapers = useMemo(() => {
    if (activeCategory === "All Methods") {
      return papersData;
    }
    return papersData.filter(
      (paper) => paper.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [activeCategory]);

  // Sorting papers based on sorting choice
  const sortedPapers = useMemo(() => {
    const papersCopy = [...filteredPapers];
    if (currentSort === "Popular" || currentSort === "Citations") {
      return papersCopy.sort((a, b) => b.citations - a.citations);
    } else if (currentSort === "Newest") {
      return papersCopy.sort((a, b) => b.year - a.year);
    }
    return papersCopy;
  }, [filteredPapers, currentSort]);

  return (
    <div className="container py-8 flex flex-col bg-white min-h-screen">
      {/* 1. Breadcrumb Section */}
      <header className="mb-4">
        <Breadcrumb />
      </header>

      {/* 2. Hero Section */}
      <section className="mb-16">
        <MethodHero />
      </section>

      {/* Section Divider */}
      <hr className="border-t border-border mb-16" />

      {/* 3. Filter Section */}
      <section className="mb-16">
        <FilterBar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          currentSort={currentSort}
          onSortChange={setCurrentSort}
        />
      </section>

      {/* 4. Research Paper Cards Section */}
      <section className="flex flex-col gap-6 mb-16">
        {sortedPapers.length > 0 ? (
          sortedPapers.map((paper) => (
            <ResearchPaperCard key={paper.id} paper={paper} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-card bg-gray-50 text-center">
            <span className="text-base font-semibold text-secondaryText mb-1">
              No papers found
            </span>
            <span className="text-sm text-gray-400">
              Try selecting a different filter category
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
