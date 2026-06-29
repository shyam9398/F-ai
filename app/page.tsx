"use client";

import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "../components/Breadcrumb";
import MethodHero from "../components/MethodHero";
import FilterBar from "../components/FilterBar";
import ResearchPaperCard from "../components/ResearchPaperCard";
import PaperDetails from "../components/PaperDetails";
import { Paper, papersData } from "../data/methods";

export default function Home() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Methods");
  const [currentSort, setCurrentSort] = useState("Popular");
  const [selectedPaperId, setSelectedPaperId] = useState<number | null>(null);

  // Load papers dynamically from API route on mount
  useEffect(() => {
    async function fetchPapers() {
      try {
        setLoading(true);
        const res = await fetch("/api/papers");
        if (!res.ok) throw new Error("Server responded with error");
        const data = await res.json();
        setPapers(data);
      } catch (err) {
        console.warn("Failed to fetch dynamic papers. Using local database as fallback: ", err);
        setPapers(papersData);
      } finally {
        setLoading(false);
      }
    }
    fetchPapers();
  }, []);

  // 1. Search filter logic
  const searchedPapers = useMemo(() => {
    if (!searchQuery) return papers;
    const q = searchQuery.toLowerCase();
    return papers.filter(
      (paper) =>
        (paper.title || "").toLowerCase().includes(q) ||
        (paper.authors || "").toLowerCase().includes(q) ||
        (paper.year || "").toString().includes(q) ||
        (paper.research_area || "").toLowerCase().includes(q) ||
        (paper.subject || "").toLowerCase().includes(q) ||
        (paper.keywords || []).some((keyword) => keyword.toLowerCase().includes(q))
    );
  }, [papers, searchQuery]);

  // 2. Discover Category filter logic (from filter bar category pills)
  const categoryFilteredPapers = useMemo(() => {
    if (activeCategory === "All Methods") return searchedPapers;
    return searchedPapers.filter(
      (paper) => (paper.category || "").toLowerCase() === activeCategory.toLowerCase()
    );
  }, [searchedPapers, activeCategory]);

  // 3. Sorting logic (Citations, Newest)
  const processedPapers = useMemo(() => {
    const papersCopy = [...categoryFilteredPapers];
    
    if (currentSort === "Popular" || currentSort === "Citations") {
      return papersCopy.sort((a, b) => b.citations - a.citations);
    } else if (currentSort === "Newest") {
      return papersCopy.sort((a, b) => b.year - a.year);
    }
    return papersCopy;
  }, [categoryFilteredPapers, currentSort]);

  // Find the selected paper object
  const selectedPaper = useMemo(() => {
    if (selectedPaperId === null) return null;
    return papers.find((p) => p.id === selectedPaperId) || null;
  }, [papers, selectedPaperId]);

  return (
    <div className="min-h-screen flex flex-col bg-lightGray">
      {/* Main Content Area (Full-Width, Centered Container) */}
      <main className="flex-grow py-6 container">
        {selectedPaper ? (
          /* Detailed Paper Document Viewer */
          <PaperDetails
            paper={selectedPaper}
            onClose={() => setSelectedPaperId(null)}
            onPaperChange={setSelectedPaperId}
            allPapers={papers}
          />
        ) : (
          /* Main Trending Paper Feed list */
          <div className="space-y-6 max-w-[1280px] mx-auto">
            <header>
              <Breadcrumb />
            </header>

            <section>
              <MethodHero />
            </section>

            <section>
              <FilterBar
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                currentSort={currentSort}
                onSortChange={setCurrentSort}
              />
            </section>

            {/* Research Papers Card Stack List */}
            <section className="flex flex-col gap-6">
              {loading ? (
                // Pulse Skeleton Loaders while fetching
                <div className="space-y-6">
                  {[1, 2, 3].map((n) => (
                    <div 
                      key={n} 
                      className="flex flex-col md:flex-row items-center gap-6 p-5 border border-border bg-white rounded-card animate-pulse"
                    >
                      <div className="w-[110px] h-[145px] bg-gray-100 border border-border rounded-lg shrink-0" />
                      <div className="flex-1 space-y-3 w-full">
                        <div className="h-6 bg-gray-200 rounded-md w-3/4" />
                        <div className="h-4 bg-gray-100 rounded-md w-1/2" />
                        <div className="h-4 bg-gray-100 rounded-md w-5/6" />
                        <div className="flex gap-2 pt-2">
                          <div className="h-5 bg-gray-100 rounded-full w-16 animate-pulse bg-orange-50/50" />
                          <div className="h-5 bg-gray-100 rounded-full w-20 animate-pulse bg-orange-50/50" />
                          <div className="h-5 bg-gray-100 rounded-full w-14 animate-pulse bg-orange-50/50" />
                        </div>
                      </div>
                      <div className="w-40 h-16 bg-gray-50 border-l border-border pl-6 hidden md:block" />
                    </div>
                  ))}
                </div>
              ) : processedPapers.length > 0 ? (
                processedPapers.map((paper) => (
                  <div key={paper.id} onClick={() => setSelectedPaperId(paper.id)}>
                    <ResearchPaperCard paper={paper} />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-card bg-gray-50 text-center">
                  <span className="text-base font-semibold text-secondaryText mb-1">
                    No research papers found
                  </span>
                  <span className="text-sm text-gray-400">
                    Try searching with different keywords or topics
                  </span>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
