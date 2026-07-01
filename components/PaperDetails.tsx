"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, Globe, Code, Layers, Bookmark, Star, 
  ChevronLeft, ChevronRight, BookOpen, Clock, FileCode,
  Table, Copy, Check, Terminal, ExternalLink
} from "lucide-react";
import Image from "next/image";
import PDFViewer from "./PDFViewer";
import CodeRepoCard from "./CodeRepoCard";
import PlatformMapping from "./PlatformMapping";
import { Paper, mapToAnkitPaper } from "../lib/paperApi";
import { usePDFThumbnail } from "../hooks/usePDFThumbnail";

interface PaperDetailsProps {
  paperId: string;
  onClose: () => void;
  onPaperChange: (id: string) => void;
  allPapers: Paper[];
}

export default function PaperDetails({ paperId, onClose, onPaperChange, allPapers }: PaperDetailsProps) {
  const [paper, setPaper] = useState<Paper | null>(null);
  const [relatedPapers, setRelatedPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAbstractExpanded, setIsAbstractExpanded] = useState(false);
  const [copiedBib, setCopiedBib] = useState(false);
  const [copiedAPA, setCopiedAPA] = useState(false);

  // Saved / Bookmark local storage state
  const [isSaved, setIsSaved] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fallback PDF thumbnail generator hook
  const { thumbnail: generatedThumbnail } = usePDFThumbnail(
    paper?.thumbnail_url || paper?.thumbnail ? "" : paper?.pdf_url || ""
  );

  const displayThumbnail = paper?.thumbnail_url || paper?.thumbnail || generatedThumbnail;

  useEffect(() => {
    let active = true;
    async function loadPaperData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/papers/${paperId}`);
        if (!res.ok) {
          throw new Error(`Failed to retrieve paper details: ${res.statusText}`);
        }
        const data = await res.json();
        
        if (active) {
          setPaper(mapToAnkitPaper(data.paper));
          setRelatedPapers((data.relatedPapers || []).map(mapToAnkitPaper));

          // Load local storage states
          const saved = JSON.parse(localStorage.getItem("frontier_saved_papers") || "[]");
          const bookmarked = JSON.parse(localStorage.getItem("frontier_bookmarked_papers") || "[]");
          setIsSaved(saved.includes(paperId));
          setIsBookmarked(bookmarked.includes(paperId));
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "Failed to load paper details from the database.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadPaperData();
    return () => {
      active = false;
    };
  }, [paperId]);

  // Handle previous and next buttons using the main list context
  const currentIndex = allPapers.findIndex((p) => p.id === paperId);
  const prevPaper = currentIndex > 0 ? allPapers[currentIndex - 1] : null;
  const nextPaper = currentIndex < allPapers.length - 1 ? allPapers[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-24 bg-white border border-border rounded-card shadow-card-sm min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
        <span className="text-sm font-bold text-secondaryText">Querying database for paper details...</span>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-24 bg-white border border-border rounded-card shadow-card-sm text-center min-h-[400px]">
        <span className="text-base font-bold text-red-600 mb-1.5">Database Retrieve Failed</span>
        <span className="text-sm text-red-400 max-w-[400px] mb-6 leading-relaxed font-semibold">{error || "Paper details not found."}</span>
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-primary hover:bg-primaryHover text-white text-xs font-bold uppercase tracking-wider rounded-[10px] cursor-pointer transition-colors shadow-xs"
        >
          Back to feed
        </button>
      </div>
    );
  }

  // localStorage Toggles
  const handleToggleSave = () => {
    const saved = JSON.parse(localStorage.getItem("frontier_saved_papers") || "[]");
    let updated: string[];
    if (saved.includes(paperId)) {
      updated = saved.filter((id: string) => id !== paperId);
      setIsSaved(false);
    } else {
      updated = [...saved, paperId];
      setIsSaved(true);
    }
    localStorage.setItem("frontier_saved_papers", JSON.stringify(updated));
  };

  const handleToggleBookmark = () => {
    const bookmarked = JSON.parse(localStorage.getItem("frontier_bookmarked_papers") || "[]");
    let updated: string[];
    if (bookmarked.includes(paperId)) {
      updated = bookmarked.filter((id: string) => id !== paperId);
      setIsBookmarked(false);
    } else {
      updated = [...bookmarked, paperId];
      setIsBookmarked(true);
    }
    localStorage.setItem("frontier_bookmarked_papers", JSON.stringify(updated));
  };

  const isLongAbstract = paper.abstract.length > 600;
  const truncatedAbstract = paper.abstract.slice(0, 600) + "...";
  const displayAbstract = isAbstractExpanded || !isLongAbstract ? paper.abstract : truncatedAbstract;

  const getAPACitation = () => {
    const firstAuthor = paper.authors.split(",")[0];
    const rest = paper.authors.split(",").length > 1 ? " et al." : "";
    return `${firstAuthor}${rest} (${paper.year}). ${paper.title}. Published in ${paper.conference || paper.journal || "arXiv preprint"}.`;
  };

  const getBibtexCitation = () => {
    const cleanKey = paper.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12);
    const authorList = paper.authors.replace(/,/g, " and");
    const doiVolume = paper.doi ? `abs/${paper.doi.split("/").pop() || "arxiv"}` : "abs/arxiv";
    return `@article{${cleanKey}${paper.year},
  author    = {${authorList}},
  title     = {${paper.title}},
  journal   = {${paper.journal || "arXiv preprint"}},
  volume    = {${doiVolume}},
  year      = {${paper.year}},
  url       = {${paper.project_url || ""}}
}`;
  };

  const handleCopyBib = () => {
    navigator.clipboard.writeText(getBibtexCitation());
    setCopiedBib(true);
    setTimeout(() => setCopiedBib(false), 2000);
  };

  const handleCopyAPA = () => {
    navigator.clipboard.writeText(getAPACitation());
    setCopiedAPA(true);
    setTimeout(() => setCopiedAPA(false), 2000);
  };

  return (
    <div className="w-full flex flex-col bg-white border border-border rounded-card p-6 md:p-8 shadow-card-sm select-none">
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6 bg-white">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-sm font-semibold text-secondaryText hover:text-primary transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Trending Feed</span>
        </button>

        {/* Previous / Next Paper navigation */}
        <div className="flex items-center gap-3">
          <button
            disabled={!prevPaper}
            onClick={() => prevPaper && onPaperChange(prevPaper.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-btn text-xs font-semibold text-textDark hover:bg-lightGray disabled:opacity-40 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous Paper</span>
          </button>
          
          <button
            disabled={!nextPaper}
            onClick={() => nextPaper && onPaperChange(nextPaper.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-btn text-xs font-semibold text-textDark hover:bg-lightGray disabled:opacity-40 transition-all cursor-pointer"
          >
            <span>Next Paper</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Main Page Layout (Two Columns: ~60% Left, ~40% Right) */}
      <div className="flex flex-col xl:flex-row items-start gap-8 w-full mb-16">
        
        {/* Left Column Content */}
        <div className="flex-grow xl:max-w-[68%] space-y-5 text-left w-full">
          
          {/* Metadata category and date badge row */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-bold bg-lightOrange text-textOrangeAccent border border-softOrangeBorder rounded-md uppercase tracking-wider">
              {paper.category}
            </span>
            <span className="text-xs font-extrabold text-secondaryText uppercase tracking-widest flex items-center gap-1.5">
              <span>• Independent Research</span>
              <span>• Submitted {paper.publication_date}</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="text-[22px] md:text-[28px] font-extrabold text-textDark leading-snug tracking-tight max-w-[800px]">
            {paper.title}
          </h1>

          {/* Authors */}
          <p className="text-sm font-semibold text-secondaryText">
            By <span className="text-textDark font-bold">{paper.authors}</span>
          </p>

          {/* Info stats row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-bold text-secondaryText border-b border-border pb-6 w-full">
            <span>• {paper.citations.toLocaleString()} citations</span>
            <span>• Source: <span className="text-primary font-extrabold">{paper.conference || paper.journal || "Publication"}</span></span>
            {paper.reading_time && (
              <span className="flex items-center gap-1">
                <span>• ⏱ {paper.reading_time}</span>
              </span>
            )}
          </div>

          {/* Action buttons bar */}
          <div className="flex flex-wrap gap-2.5">
            {paper.project_url && (
              <a 
                href={paper.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border hover:bg-lightGray text-textDark font-bold text-xs uppercase tracking-wider rounded-[10px] transition-colors cursor-pointer"
              >
                <Globe className="w-4 h-4 text-gray-500" />
                <span>Project Page</span>
              </a>
            )}

            {/* Fully functional Save button */}
            <button 
              onClick={handleToggleSave}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-[10px] font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isSaved 
                  ? "bg-[#FFF3EE] text-[#FF6A3D] border-[#FF6A3D] shadow-xs" 
                  : "bg-white border-border hover:bg-lightGray text-textDark"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "text-[#FF6A3D] fill-[#FF6A3D]" : "text-gray-500"}`} />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>

            {/* Fully functional Bookmark button */}
            <button 
              onClick={handleToggleBookmark}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-[10px] font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isBookmarked 
                  ? "bg-yellow-50 text-yellow-600 border-yellow-400 shadow-xs" 
                  : "bg-white border-border hover:bg-lightGray text-textDark"
              }`}
            >
              <Star className={`w-4 h-4 ${isBookmarked ? "text-yellow-500 fill-yellow-500" : "text-gray-500"}`} />
              <span>{isBookmarked ? "Bookmarked" : "Add Bookmark"}</span>
            </button>
          </div>

          {/* Abstract section */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-secondaryText uppercase tracking-widest">
              ABSTRACT
            </h3>
            <p className="text-[15px] text-textDark leading-relaxed font-normal">
              {displayAbstract}
            </p>
            {isLongAbstract && (
              <button 
                onClick={() => setIsAbstractExpanded(!isAbstractExpanded)}
                className="text-xs font-bold text-primary hover:underline cursor-pointer focus:outline-hidden"
              >
                {isAbstractExpanded ? "Read Less" : "Read Full Abstract"}
              </button>
            )}
          </div>

          {/* Tasks Mapped Section */}
          {paper.tasks && paper.tasks.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-border">
              <h3 className="text-xs font-black text-secondaryText uppercase tracking-widest">
                TASKS MAPPED
              </h3>
              <div className="flex flex-wrap gap-2">
                {paper.tasks.map((task: string) => (
                  <span 
                    key={task} 
                    className="px-3 py-1 bg-[#F9FAFB] border border-border text-textDark font-semibold text-xs rounded-lg uppercase tracking-wider"
                  >
                    {task}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Methods Mapped Section */}
          {paper.methods && paper.methods.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-border">
              <h3 className="text-xs font-black text-secondaryText uppercase tracking-widest">
                METHODS USED
              </h3>
              <div className="flex flex-wrap gap-2">
                {paper.methods.map((method: string) => (
                  <span 
                    key={method} 
                    className="px-3 py-1 bg-lightOrange/30 border border-softOrangeBorder text-textOrangeAccent font-semibold text-xs rounded-lg uppercase tracking-wider"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Benchmarks & Results Section */}
          {paper.benchmarks && paper.benchmarks.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-border">
              <h3 className="text-xs font-black text-secondaryText uppercase tracking-widest flex items-center gap-2">
                <Table className="w-4 h-4 text-gray-500" />
                <span>BENCHMARKS & EMPIRICAL RESULTS</span>
              </h3>
              
              <div className="border border-border rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F9FAFB] border-b border-border text-secondaryText font-bold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Benchmark Task</th>
                      <th className="px-6 py-3">Reported Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-textDark font-semibold">
                    {paper.benchmarks.map((bench: string, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-6 py-3.5">{bench}</td>
                        <td className="px-6 py-3.5 text-primary font-bold">{paper.results[idx] || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* APA / BibTeX Citations Section */}
          <div className="space-y-4 pt-6 border-t border-border">
            <h3 className="text-xs font-black text-secondaryText uppercase tracking-widest">
              CITE THIS PAPER
            </h3>
            
            <div className="space-y-4">
              {/* BibTeX citation block */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-400">BibTeX Format</span>
                  <button
                    onClick={handleCopyBib}
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primaryHover transition-colors cursor-pointer"
                  >
                    {copiedBib ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy BibTeX</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 bg-lightGray border border-border rounded-xl text-xs font-semibold text-gray-600 leading-relaxed font-mono select-text overflow-x-auto text-left">
                  {getBibtexCitation()}
                </pre>
              </div>

              {/* APA citation block */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-400">APA Format</span>
                  <button
                    onClick={handleCopyAPA}
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primaryHover transition-colors cursor-pointer"
                  >
                    {copiedAPA ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Citation</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 bg-lightGray border border-border rounded-xl text-sm font-semibold text-gray-600 leading-relaxed font-mono select-text text-left">
                  {getAPACitation()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Layout Panel */}
        <div className="w-full xl:max-w-[32%] space-y-6">
          {/* PDF Viewer replacing image preview block */}
          <div className="space-y-2">
            <span className="block text-left text-[10px] font-black text-secondaryText uppercase tracking-widest px-1">
              EMBEDDED DOCUMENT VIEWER
            </span>
            <PDFViewer pdfUrl={paper.pdf_url || ""} />
          </div>

          {/* Paper Stats Sidebar card (without duplicate thumbnail) */}
          <div className="bg-white border border-border rounded-card p-5 shadow-card-sm text-left flex flex-col gap-4">
            <div className="w-full text-xs font-semibold text-secondaryText space-y-1.5">
              <div>Pages: <span className="text-textDark font-bold">{paper.pages} Pages</span></div>
              <div>Size: <span className="text-textDark font-bold">{paper.file_size}</span></div>
              <div>Pub Date: <span className="text-textDark font-bold">{paper.year}</span></div>
              {paper.doi && (
                <div>DOI: <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline break-all">{paper.doi}</a></div>
              )}
            </div>
          </div>

          {/* Code Repository Card */}
          <CodeRepoCard githubUrl={paper.github_url || ""} paperTitle={paper.title} />

          {/* Platform Mapping Card */}
          <PlatformMapping
            modelsUsed={paper.models_used}
            datasetsUsed={paper.datasets_used}
            framework={paper.framework}
            language={paper.language}
            tasks={paper.tasks}
            researchArea={paper.research_area}
          />
        </div>
      </div>

      {/* 3. Related Papers Grid */}
      {relatedPapers.length > 0 && (
        <section className="border-t border-border pt-12 text-left mb-8">
          <h2 className="text-2xl font-black text-textDark mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span>Related Research Papers</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPapers.map((rp) => (
              <div 
                key={rp.id}
                onClick={() => onPaperChange(rp.id)}
                className="group p-5 border border-border hover:border-primary hover:shadow-card-lg hover:-translate-y-[2px] rounded-card transition-all duration-300 cursor-pointer flex gap-4 bg-white md:h-[135px] overflow-hidden"
              >
                <div className="w-[60px] h-[78px] relative border border-border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                  {rp.thumbnail_url || rp.thumbnail ? (
                    <Image
                      src={rp.thumbnail_url || rp.thumbnail}
                      alt={rp.title}
                      width={60}
                      height={78}
                      className="w-full h-full object-contain p-1"
                      unoptimized
                    />
                  ) : (
                    <div className="text-[8px] text-gray-400 font-mono text-center px-1">Generating...</div>
                  )}
                </div>
                <div className="flex flex-col justify-between min-w-0 py-0.5 w-full">
                  <div>
                    <h4 className="text-sm font-bold text-textDark group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {rp.title}
                    </h4>
                    <span className="text-xs text-secondaryText block truncate mt-1">
                      {rp.authors} • {rp.year}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[9px] font-bold text-secondaryText uppercase tracking-wider bg-lightGray px-2 py-0.5 rounded-full border border-border">
                      {rp.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
