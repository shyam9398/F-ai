"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Breadcrumb from "../components/Breadcrumb";
import MethodHero from "../components/MethodHero";
import FilterBar from "../components/FilterBar";
import PaperList, { PaperCard } from "../components/PaperCard";
import { getPapers, type Paper } from "../lib/paperApi";
import PaperDetails from "../components/PaperDetails";

export default function Home() {
  const [displayedPapers, setDisplayedPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Methods");
  const [currentSort, setCurrentSort] = useState("Popular");
  const [selectedPaperId, setSelectedPaperId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchingRef = useRef(false);
  const pageCacheRef = useRef<Record<string, Paper[]>>({});
  const allFetchedPapersRef = useRef<Paper[]>([]);

  // Unique identifier Sets to guarantee no duplicate renders
  const seenIdsRef = useRef<Set<number>>(new Set());
  const seenDoisRef = useRef<Set<string>>(new Set());
  const seenTitlesRef = useRef<Set<string>>(new Set());

  const resetDeduplicationSets = () => {
    seenIdsRef.current.clear();
    seenDoisRef.current.clear();
    seenTitlesRef.current.clear();
    allFetchedPapersRef.current = [];
  };

  const checkAndRegisterUnique = (paper: Paper): boolean => {
    // 1. Remove duplicate papers completely:
    // - Deduplicate using unique ID (preferred).
    // - If ID is unavailable, deduplicate using DOI.
    // - If DOI is unavailable, deduplicate using title + authors.
    if (paper.id) {
      if (seenIdsRef.current.has(paper.id)) return false;
      seenIdsRef.current.add(paper.id);
      return true;
    }
    if (paper.doi) {
      if (seenDoisRef.current.has(paper.doi)) return false;
      seenDoisRef.current.add(paper.doi);
      return true;
    }
    if (paper.title && paper.authors) {
      const key = `${paper.title.toLowerCase().trim()}|${paper.authors.toLowerCase().trim()}`;
      if (seenTitlesRef.current.has(key)) return false;
      seenTitlesRef.current.add(key);
      return true;
    }
    return true; // Fallback
  };

  // Helper to fetch papers with page caching
  const fetchPageWithCache = async (cat: string, pageNum: number, limitVal: number): Promise<Paper[]> => {
    const cacheKey = `${cat}_sort_${currentSort}_search_${searchQuery}_page_${pageNum}`;
    if (pageCacheRef.current[cacheKey]) {
      return pageCacheRef.current[cacheKey];
    }
    const data = await getPapers(
      cat === "All Methods" ? undefined : cat,
      pageNum,
      limitVal,
      currentSort,
      searchQuery
    );
    pageCacheRef.current[cacheKey] = data;
    return data;
  };

  // Helper to fetch unique papers from the backend, skipping pages that are fully duplicate
  const fetchUniquePapersForPage = async (cat: string, startPage: number): Promise<{ papers: Paper[]; lastPageFetched: number }> => {
    let currentPageNum = startPage;
    let uniquePapers: Paper[] = [];

    while (true) {
      const data = await fetchPageWithCache(cat, currentPageNum, 50);
      if (data.length === 0) {
        break; // No more papers available from the API
      }

      const filtered = data.filter((p) => checkAndRegisterUnique(p));
      if (filtered.length > 0) {
        uniquePapers = filtered;
        break; // Found unique papers
      }

      // If all papers on the page were duplicates, skip it and fetch the next page
      currentPageNum++;
    }

    return {
      papers: uniquePapers,
      lastPageFetched: currentPageNum,
    };
  };

  // Reset pagination state and load initial papers on category, sort, or search change
  useEffect(() => {
    let active = true;
    async function loadInitialPapers() {
      if (fetchingRef.current) return;
      try {
        fetchingRef.current = true;
        setLoading(true);
        resetDeduplicationSets();
        setPage(1);
        setHasMore(true);

        const { papers: uniqueBatch, lastPageFetched } = await fetchUniquePapersForPage(activeCategory, 1);

        if (!active) return;

        if (uniqueBatch.length === 0) {
          setHasMore(false);
          setDisplayedPapers([]);
        } else {
          allFetchedPapersRef.current = uniqueBatch;
          setDisplayedPapers(uniqueBatch.slice(0, 20)); // Load only 20 initially
          setPage(lastPageFetched);
        }
      } catch (err) {
        console.error("Failed to fetch papers:", err);
      } finally {
        if (active) {
          setLoading(false);
          fetchingRef.current = false;
        }
      }
    }
    loadInitialPapers();
    return () => {
      active = false;
    };
  }, [activeCategory, currentSort, searchQuery]);

  const loadNextPage = async () => {
    if (loading || loadingMore || !hasMore || fetchingRef.current) return;

    // If there are unique fetched papers buffered locally, show next batch
    if (displayedPapers.length < allFetchedPapersRef.current.length) {
      setLoadingMore(true);
      const currentLength = displayedPapers.length;
      const nextBatch = allFetchedPapersRef.current.slice(0, currentLength + 20);
      setDisplayedPapers(nextBatch);
      setLoadingMore(false);
      return;
    }

    // Otherwise, fetch the next page of 50 from the backend API
    try {
      fetchingRef.current = true;
      setLoadingMore(true);
      const nextPage = page + 1;

      const { papers: uniqueBatch, lastPageFetched } = await fetchUniquePapersForPage(activeCategory, nextPage);

      if (uniqueBatch.length === 0) {
        setHasMore(false);
      } else {
        allFetchedPapersRef.current = [...allFetchedPapersRef.current, ...uniqueBatch];
        const currentLength = displayedPapers.length;
        setDisplayedPapers(allFetchedPapersRef.current.slice(0, currentLength + 20));
        setPage(lastPageFetched);
      }
    } catch (err) {
      console.error("Failed to load more papers:", err);
    } finally {
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const clientHeight = window.innerHeight;

      // Trigger load when reaching 80% of page height
      if (scrollTop + clientHeight >= scrollHeight * 0.8) {
        loadNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [displayedPapers, page, loading, loadingMore, hasMore, activeCategory]);

  // 1. Search filter logic
  const searchedPapers = useMemo(() => {
    if (!searchQuery) return displayedPapers;
    const q = searchQuery.toLowerCase();
    return displayedPapers.filter(
      (paper) =>
        (paper.title || "").toLowerCase().includes(q) ||
        (paper.authors || "").toLowerCase().includes(q) ||
        (paper.year || "").toString().includes(q) ||
        (paper.research_area || "").toLowerCase().includes(q) ||
        (paper.subject || "").toLowerCase().includes(q) ||
        (paper.keywords || []).some((keyword) => keyword.toLowerCase().includes(q))
    );
  }, [displayedPapers, searchQuery]);

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
    return displayedPapers.find((p) => p.id === selectedPaperId) || null;
  }, [displayedPapers, selectedPaperId]);

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
            allPapers={displayedPapers}
          />
        ) : (
          /* Main Trending Paper Feed list */
          <div className="flex flex-col gap-4 max-w-[1280px] mx-auto">
            <header className="mb-0.5">
              <Breadcrumb />
            </header>

            <section className="mb-1">
              <MethodHero />
            </section>

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
                <>
                  <PaperList papers={processedPapers} onPaperClick={setSelectedPaperId} />
                  {loadingMore && (
                    <div className="py-6 flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E40AF]"></div>
                    </div>
                  )}
                  {!hasMore && (
                    <div className="py-6 text-center text-xs font-semibold text-gray-400 select-none">
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
