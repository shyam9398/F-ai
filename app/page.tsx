"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import MethodHero from "../components/MethodHero";
import FilterBar from "../components/FilterBar";
import PaperList from "../components/PaperCard";
import { getPapers, type Paper } from "../lib/paperApi";
import PaperDetails from "../components/PaperDetails";

export default function Home() {
  const [displayedPapers, setDisplayedPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Methods");
  const [currentSort, setCurrentSort] = useState("Popular");
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"feed" | "saved" | "bookmarks">("feed");

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchingRef = useRef(false);

  // Read saved/bookmarked IDs from localStorage
  const getSavedPaperIds = (): string[] => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("frontier_saved_papers") || "[]");
  };

  const getBookmarkedPaperIds = (): string[] => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("frontier_bookmarked_papers") || "[]");
  };

  // Main loader function
  const loadPapers = async (pageNum: number, append: boolean = false) => {
    if (fetchingRef.current) return;
    try {
      fetchingRef.current = true;
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      // Determine which IDs to fetch if viewing Saved or Bookmarks
      let idsToFetch: string[] | undefined = undefined;
      if (activeTab === "saved") {
        idsToFetch = getSavedPaperIds();
      } else if (activeTab === "bookmarks") {
        idsToFetch = getBookmarkedPaperIds();
      }

      // Query our clean database-backed API
      const limit = 10;
      const data = await getPapers(
        activeCategory === "All Methods" ? undefined : activeCategory,
        pageNum,
        limit,
        currentSort,
        searchQuery,
        idsToFetch
      );

      if (append) {
        setDisplayedPapers((prev) => [...prev, ...data]);
      } else {
        setDisplayedPapers(data);
      }

      setHasMore(data.length >= limit);
      setPage(pageNum);
    } catch (err: any) {
      console.error("Failed to load papers:", err);
      setError(err.message || "Database connection unavailable.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  };

  // Reload papers when filters, tab, or search changes
  useEffect(() => {
    loadPapers(1, false);
  }, [activeCategory, currentSort, searchQuery, activeTab]);

  // Infinite Scroll Trigger
  const loadNextPage = () => {
    if (loading || loadingMore || !hasMore || fetchingRef.current) return;
    loadPapers(page + 1, true);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const clientHeight = window.innerHeight;

      if (scrollTop + clientHeight >= scrollHeight * 0.8) {
        loadNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, loading, loadingMore, hasMore, activeCategory, currentSort, searchQuery, activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-lightGray">
      <main className="flex-grow py-6 container">
        {selectedPaperId ? (
          /* Detailed Paper Document Viewer */
          <PaperDetails
            paperId={selectedPaperId}
            onClose={() => setSelectedPaperId(null)}
            onPaperChange={setSelectedPaperId}
            allPapers={displayedPapers}
          />
        ) : (
          /* Main Trending Paper Feed list */
          <div className="flex flex-col gap-4 max-w-[1280px] mx-auto">
            <header className="mb-0.5">
              <Breadcrumb />
            </header>

            <section className="mb-1">
              <MethodHero activeCategory={activeCategory} />
            </section>

            {/* Navigation Tabs (Feed / Saved / Bookmarks) */}
            <div className="flex gap-2.5 mb-1.5 select-none">
              {[
                { id: "feed", label: "Trending Feed" },
                { id: "saved", label: "Saved Papers" },
                { id: "bookmarks", label: "Bookmarks" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setActiveCategory("All Methods"); // Reset categories
                    }}
                    className={`px-5 py-2.5 text-sm font-bold rounded-[10px] border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#FFF3EE] text-[#FF6A3D] border-[#FF6A3D] shadow-xs"
                        : "bg-white text-[#2F2F2F] border-[#E5E7EB] hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Dynamic search bar */}
            <div className="flex flex-col md:flex-row items-center gap-3 w-full mb-1">
              <div className="relative flex-1 w-full">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search papers by title, author, keyword, conference, category, model, dataset, method..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[46px] pl-10 pr-4 bg-white border border-[#E5E7EB] rounded-[12px] text-[14px] text-textDark focus:outline-hidden focus:border-[#FF6A3D] transition-all font-sans font-medium"
                />
              </div>
            </div>

            <section className="mb-1.5">
              <FilterBar
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                currentSort={currentSort}
                onSortChange={setCurrentSort}
              />
            </section>

            {/* Research Papers Card Stack List */}
            <section className="flex flex-col gap-4">
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((n) => (
                    <div 
                      key={n} 
                      className="flex flex-col md:flex-row items-center gap-6 p-5 border border-border bg-white rounded-card animate-pulse"
                    >
                      <div className="w-[130px] h-[175px] bg-gray-100 border border-border rounded-lg shrink-0" />
                      <div className="flex-1 space-y-3 w-full">
                        <div className="h-6 bg-gray-200 rounded-md w-3/4" />
                        <div className="h-4 bg-gray-100 rounded-md w-1/2" />
                        <div className="h-4 bg-gray-100 rounded-md w-5/6" />
                        <div className="flex gap-2 pt-2">
                          <div className="h-5 bg-gray-100 rounded-full w-16" />
                          <div className="h-5 bg-gray-100 rounded-full w-20" />
                          <div className="h-5 bg-gray-100 rounded-full w-14" />
                        </div>
                      </div>
                      <div className="w-40 h-16 bg-gray-50 border-l border-border pl-6 hidden md:block" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-12 border border-red-200 border-dashed rounded-card bg-red-50/50 text-center">
                  <span className="text-base font-bold text-red-700 mb-1.5">
                    Database Connection Failure
                  </span>
                  <span className="text-sm text-red-500 max-w-[500px] mb-4 font-semibold leading-relaxed">
                    {error}
                  </span>
                  <button
                    onClick={() => loadPapers(1, false)}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-[10px] cursor-pointer transition-colors shadow-xs"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : displayedPapers.length > 0 ? (
                <>
                  <PaperList papers={displayedPapers} onPaperClick={setSelectedPaperId} />
                  {loadingMore && (
                    <div className="py-6 flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E40AF]"></div>
                    </div>
                  )}
                  {!hasMore && (
                    <div className="py-6 text-center text-xs font-bold text-gray-400 select-none">
                      No more papers available
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-card bg-gray-50 text-center">
                  <span className="text-base font-semibold text-secondaryText mb-1">
                    No research papers found
                  </span>
                  <span className="text-sm text-gray-400">
                    {activeTab === "saved"
                      ? "You haven't saved any research papers yet."
                      : activeTab === "bookmarks"
                      ? "You haven't bookmarked any research papers yet."
                      : "Try searching with different keywords or topics."}
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
