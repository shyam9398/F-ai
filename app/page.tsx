"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Search, Flame, Star, Bookmark, Brain, 
  Code, Monitor, Globe, Cpu, MessageSquare, Loader2
} from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import FilterBar from "../components/FilterBar";
import PaperList from "../components/PaperCard";
import { getPapers, type Paper } from "../lib/paperApi";
import PaperDetails from "../components/PaperDetails";
import Header from "../components/Header";

export default function Home() {
  const [displayedPapers, setDisplayedPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Methods");
  const [currentSort, setCurrentSort] = useState("Popular");
  const [methods, setMethods] = useState<{ name: string; slug: string; paper_count: number }[]>([]);
  const [totalPapersCount, setTotalPapersCount] = useState<number>(0);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  
  // Sidebar tabs: discover (feed, saved, bookmarks)
  const [activeTab, setActiveTab] = useState<"feed" | "saved" | "bookmarks">("feed");
  
  // Navigation task category (Language Modeling is Large Language Model task)
  const [activeTask, setActiveTask] = useState<string | undefined>("Language Modeling");
  
  // Period tabs: Today / This Week / This Month / All time
  const [activePeriod, setActivePeriod] = useState<"today" | "week" | "month" | "all">("all");

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

      // Query database-backed API with active filters
      const limit = 10;
      const data = await getPapers(
        activeCategory === "All Methods" ? undefined : activeCategory,
        pageNum,
        limit,
        currentSort,
        searchQuery,
        idsToFetch,
        activeTab === "feed" ? activeTask : undefined
      );

      if (append) {
        setDisplayedPapers((prev) => [...prev, ...data.papers]);
      } else {
        setDisplayedPapers(data.papers);
      }

      if (data.methods && data.methods.length > 0) {
        setMethods(data.methods);
      }
      if (typeof data.totalPapersCount === "number") {
        setTotalPapersCount(data.totalPapersCount);
      }

      setHasMore(data.papers.length >= limit);
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

  // Reload papers when filters, tab, task, or search changes
  useEffect(() => {
    loadPapers(1, false);
  }, [activeCategory, currentSort, searchQuery, activeTab, activeTask]);

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

      if (scrollTop + clientHeight >= scrollHeight * 0.85) {
        loadNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, loading, loadingMore, hasMore, activeCategory, currentSort, searchQuery, activeTab, activeTask]);

  // Helper to filter papers locally by the selected time period
  const getFilteredByPeriod = (papers: Paper[]) => {
    if (activePeriod === "all") return papers;
    
    // Static base date representing the user session's current year to filter relative dates
    const now = new Date("2026-07-02");
    return papers.filter((p) => {
      // publication_date or fallback to standard formatted string date
      const dateStr = p.publication_date || p.date;
      if (!dateStr) return true;
      const pubDate = new Date(dateStr);
      const diffTime = Math.abs(now.getTime() - pubDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (activePeriod === "today") return diffDays <= 7;
      if (activePeriod === "week") return diffDays <= 30;
      if (activePeriod === "month") return diffDays <= 90;
      return true;
    });
  };

  const visiblePapers = getFilteredByPeriod(displayedPapers);

  return (
    <div className="min-h-screen flex flex-col bg-lightGray font-sans select-none">
      {/* 1. Header Sticky Navbar */}
      <Header />

      {/* 2. Top Banner (Centered Search Bar & Topic Chips) */}
      <div className="bg-[#FAF9F5] border-b border-border py-8 text-center select-none">
        <div className="max-w-[800px] mx-auto px-4 space-y-4">
          <p className="text-xs font-bold text-secondaryText tracking-wide uppercase">
            Search, discover, and track papers, methods, benchmarks, and open-source releases.
          </p>
          
          {/* Big Search Bar */}
          <div className="relative max-w-[620px] mx-auto">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4.5 h-4.5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search papers by title, author, keyword, conference, category, model, dataset, method..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[48px] pl-11 pr-12 bg-white border border-[#E5E5E0] rounded-full text-[14px] text-textDark focus:outline-hidden focus:border-[#FF6A3D] focus:shadow-md transition-all font-sans font-semibold"
            />
            <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold text-gray-400 bg-gray-50 border border-gray-250 rounded-md">
                ⌘ K
              </kbd>
            </span>
          </div>

          {/* Topic Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1.5">
            {[
              { id: "Language Modeling", label: "Language Modeling", icon: "🧠" },
              { id: "Agents", label: "Agents", icon: "🤖" },
              { id: "Reasoning", label: "Reasoning", icon: "🧭" },
              { id: "Coding Agents", label: "Coding", icon: "💻" },
              { id: "World Models", label: "World Models", icon: "🌍" },
              { id: "Robotics", label: "Robotics", icon: "🦾" },
              { id: "All Topics", label: "All Topics", icon: "📋" },
            ].map((chip) => {
              const isActive = activeTask === chip.id || (chip.id === "All Topics" && !activeTask);
              return (
                <button
                  key={chip.id}
                  onClick={() => {
                    setActiveTask(chip.id === "All Topics" ? undefined : chip.id);
                    setActiveTab("feed");
                  }}
                  className={`h-[30px] px-3.5 flex items-center gap-1.5 rounded-full border text-[11px] font-bold cursor-pointer transition-all duration-150 ${
                    isActive
                      ? "bg-[#FFF3EE] text-[#FF6A3D] border-[#FF6A3D] shadow-xs"
                      : "bg-white text-textDark border-border hover:bg-gray-50"
                  }`}
                >
                  <span className="text-[10px]">{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Three-Column Workspace Layout */}
      <main className="flex-grow py-6 container max-w-[1440px] mx-auto px-4 md:px-6">
        {selectedPaperId ? (
          /* Detailed Paper Document Viewer */
          <PaperDetails
            paperId={selectedPaperId}
            onClose={() => setSelectedPaperId(null)}
            onPaperChange={selectedPaperId => {
              setSelectedPaperId(selectedPaperId);
              // Scroll page viewer top offset
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            allPapers={displayedPapers}
          />
        ) : (
          /* Main Feed Listing Section */
          <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
            
            {/* COLUMN 1: LEFT SIDEBAR (Discover, Tasks, Methods navigation) */}
            <aside className="w-full lg:w-[220px] shrink-0 space-y-6 text-left hidden lg:block select-none">
              
              {/* DISCOVER Section */}
              <div className="space-y-1.5">
                <h4 className="text-[9.5px] font-black text-secondaryText tracking-widest uppercase px-3">
                  DISCOVER
                </h4>
                <div className="space-y-0.5">
                  {[
                    { id: "feed", label: "Trending Papers", icon: <Flame className="w-3.5 h-3.5 shrink-0" /> },
                    { id: "saved", label: "Saved Papers", icon: <Star className="w-3.5 h-3.5 shrink-0" /> },
                    { id: "bookmarks", label: "Bookmarks", icon: <Bookmark className="w-3.5 h-3.5 shrink-0" /> },
                  ].map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as any);
                          if (item.id !== "feed") {
                            setActiveTask(undefined);
                          } else {
                            setActiveTask("Language Modeling"); // Defaults to LLM Task in Feed
                          }
                        }}
                        className={`w-full h-[36px] px-3 flex items-center gap-2 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                          isActive 
                            ? "bg-white text-[#FF6A3D] border border-border shadow-xs" 
                            : "text-[#555555] hover:bg-white/50"
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TASKS Section */}
              <div className="space-y-1.5">
                <h4 className="text-[9.5px] font-black text-secondaryText tracking-widest uppercase px-3">
                  TASKS
                </h4>
                <div className="space-y-0.5">
                  {[
                    { id: "Language Modeling", label: "Language Modeling", icon: <Brain className="w-3.5 h-3.5 shrink-0" /> },
                    { id: "Agents", label: "Agents", icon: <Cpu className="w-3.5 h-3.5 shrink-0" /> },
                    { id: "Reasoning", label: "Reasoning", icon: <MessageSquare className="w-3.5 h-3.5 shrink-0" /> },
                    { id: "Coding Agents", label: "Coding Agents", icon: <Code className="w-3.5 h-3.5 shrink-0" /> },
                    { id: "Computer Use", label: "Computer Use", icon: <Monitor className="w-3.5 h-3.5 shrink-0" /> },
                    { id: "World Models", label: "World Models", icon: <Globe className="w-3.5 h-3.5 shrink-0" /> },
                    { id: "Robotics", label: "Robotics", icon: <Cpu className="w-3.5 h-3.5 shrink-0" /> },
                  ].map((item) => {
                    const isActive = activeTask === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTask(item.id);
                          setActiveTab("feed");
                        }}
                        className={`w-full h-[36px] px-3 flex items-center gap-2 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                          isActive 
                            ? "bg-[#FFF3EE] text-[#FF6A3D] border border-[#FF6A3D]/20 shadow-xs" 
                            : "text-[#555555] hover:bg-white/50"
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* METHODS Section */}
              <div className="space-y-1.5">
                <h4 className="text-[9.5px] font-black text-secondaryText tracking-widest uppercase px-3">
                  METHODS
                </h4>
                <div className="space-y-0.5 max-h-[280px] overflow-y-auto scrollbar-none pr-1">
                  {methods.map((m) => {
                    const isActive = activeCategory === m.name;
                    return (
                      <button
                        key={m.slug}
                        onClick={() => {
                          setActiveCategory(isActive ? "All Methods" : m.name);
                        }}
                        className={`w-full h-[32px] px-3 flex items-center justify-between rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                          isActive 
                            ? "bg-white text-[#FF6A3D] border border-border shadow-xs" 
                            : "text-[#555555] hover:bg-white/50"
                        }`}
                      >
                        <span className="truncate">{m.name}</span>
                        <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-[#FF6A3D] text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {m.paper_count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* COLUMN 2: CENTER PAPER FEED (Visual period tabs, FilterBar, PaperList) */}
            <div className="flex-1 min-w-0 space-y-4">
              
              {/* Breadcrumbs */}
              <header className="mb-0.5 text-left">
                <Breadcrumb activeTask={activeTask} />
              </header>

              {/* Time Interval Selector Tab Bar */}
              <div className="flex gap-4.5 mb-1.5 select-none border-b border-border pb-1 text-left">
                {[
                  { id: "today", label: "Today" },
                  { id: "week", label: "This Week" },
                  { id: "month", label: "This Month" },
                  { id: "all", label: "All time" },
                ].map((tab) => {
                  const isActive = activePeriod === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActivePeriod(tab.id as any)}
                      className={`text-xs font-black uppercase tracking-wider pb-2 transition-all cursor-pointer border-b-2 px-1 ${
                        isActive
                          ? "border-[#FF6A3D] text-[#FF6A3D]"
                          : "border-transparent text-secondaryText hover:text-textDark"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Horizontal Scrollable Filter Bar and Sorting */}
              <section className="mb-1.5">
                <FilterBar
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  currentSort={currentSort}
                  onSortChange={setCurrentSort}
                  methods={methods}
                  totalPapersCount={totalPapersCount}
                />
              </section>

              {/* Paper Listing Cards */}
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
                ) : visiblePapers.length > 0 ? (
                  <>
                    <PaperList papers={visiblePapers} onPaperClick={setSelectedPaperId} />
                    {loadingMore && (
                      <div className="py-6 flex justify-center items-center">
                        <Loader2 className="animate-spin h-6 w-6 text-[#FF6A3D]" />
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
                    <span className="text-sm text-gray-450 font-medium">
                      {activeTab === "saved"
                        ? "You haven't saved any research papers yet."
                        : activeTab === "bookmarks"
                        ? "You haven't bookmarked any research papers yet."
                        : "Try searching with different keywords or topic tags."}
                    </span>
                  </div>
                )}
              </section>
            </div>

            {/* COLUMN 3: RIGHT SIDEBAR ("What's happening" Project statistics feed) */}
            <aside className="w-full xl:w-[300px] shrink-0 space-y-6 text-left hidden xl:block select-none">
              <div className="bg-white border border-[#E5E5E0] rounded-card p-5 shadow-card-sm space-y-4">
                
                {/* Header Title */}
                <h3 className="text-xs font-black text-textDark tracking-widest uppercase flex items-center gap-1.5">
                  <span className="text-[#FF6A3D]">✨</span>
                  <span>What's happening</span>
                </h3>

                {/* Sub Tab Controls */}
                <div className="flex gap-3 text-[9px] font-black tracking-wider uppercase border-b border-border pb-2">
                  {["All", "X/Twitter", "Reddit", "GitHub"].map((tab, idx) => (
                    <span 
                      key={tab} 
                      className={`cursor-pointer transition-colors ${idx === 0 ? "text-[#FF6A3D]" : "text-gray-400 hover:text-textDark"}`}
                    >
                      {tab}
                    </span>
                  ))}
                </div>

                {/* Activity Feed Items List */}
                <div className="space-y-4 pt-1 max-h-[480px] overflow-y-auto scrollbar-none">
                  {[
                    { project: "OpenHands", title: "OpenHands has recent development activity", time: "5 minutes ago", stars: "78,990", forks: "10,051" },
                    { project: "AutoGPT", title: "AutoGPT has recent development activity", time: "13 minutes ago", stars: "185,230", forks: "46,118" },
                    { project: "marimo", title: "marimo has recent development activity", time: "39 minutes ago", stars: "21,658", forks: "1,153" },
                    { project: "aider", title: "aider has recent development activity", time: "2 hours ago", stars: "15,230", forks: "1,005" },
                    { project: "MesaTEE", title: "MesaTEE has recent development activity", time: "3 hours ago", stars: "8,230", forks: "951" },
                    { project: "LangChain", title: "LangChain has recent development activity", time: "5 hours ago", stars: "95,230", forks: "15,005" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3 text-xs items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-border">
                        <span className="text-[10px] font-extrabold text-gray-500">
                          {item.project[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold">
                          <span className="text-textDark font-black uppercase tracking-wider">{item.project}</span>
                          <span>{item.time}</span>
                        </div>
                        <p className="font-bold text-textDark leading-snug truncate hover:underline cursor-pointer">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-3 text-[9px] text-gray-400 font-extrabold font-mono">
                          <span>❤️ {item.stars}</span>
                          <span>💬 {item.forks}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

          </div>
        )}
      </main>
    </div>
  );
}
