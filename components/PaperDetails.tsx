"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, Globe, Bookmark, Star, 
  ChevronLeft, ChevronRight, BookOpen,
  Table, Copy, Check, ExternalLink, Share2
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

  // PDF Modal Viewer State
  const [showPDF, setShowPDF] = useState(false);

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

  const modelsArray = paper.models_used ? paper.models_used.split(",").map((m) => m.trim()).filter(Boolean) : [];
  const datasetsArray = paper.datasets_used ? paper.datasets_used.split(",").map((d) => d.trim()).filter(Boolean) : [];

  return (
    <div className="w-full flex flex-col bg-white border border-border rounded-card p-6 md:p-8 shadow-card-sm select-none">
      
      {/* 1. Header Navigation Bar (Natural document flow scrolling) */}
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
            <span>Previous</span>
          </button>
          
          <button
            disabled={!nextPaper}
            onClick={() => nextPaper && onPaperChange(nextPaper.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-btn text-xs font-semibold text-textDark hover:bg-lightGray disabled:opacity-40 transition-all cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-8 w-full mb-16 h-auto min-h-0">
        
        {/* Left Column Content (approx 68% width on desktop) */}
        <div className="w-full lg:w-[68%] space-y-5 text-left h-auto min-h-0">
          
          {/* Metadata category and date badge row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondaryText font-medium">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-lightOrange text-textOrangeAccent border border-softOrangeBorder rounded-md uppercase tracking-wider">
              {paper.category}
            </span>
            <span>•</span>
            <span>Independent Research</span>
            <span>•</span>
            <span>Published {paper.publication_date}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-textDark leading-snug tracking-tight max-w-[800px]">
            {paper.title}
          </h1>

          {/* Authors */}
          <p className="text-sm font-semibold text-secondaryText leading-relaxed">
            By <span className="text-textDark font-bold">{paper.authors}</span>
          </p>

          {/* Abstract section */}
          <div className="space-y-2 pt-2">
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
                TASKS
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

          {/* Models Mapped Section */}
          {modelsArray.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-border">
              <h3 className="text-xs font-black text-secondaryText uppercase tracking-widest">
                MODELS USED
              </h3>
              <div className="flex flex-wrap gap-2">
                {modelsArray.map((model: string) => (
                  <span 
                    key={model} 
                    className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-xs rounded-lg uppercase tracking-wider"
                  >
                    {model}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Datasets Mapped Section */}
          {datasetsArray.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-border">
              <h3 className="text-xs font-black text-secondaryText uppercase tracking-widest">
                DATASETS USED
              </h3>
              <div className="flex flex-wrap gap-2">
                {datasetsArray.map((dataset: string) => (
                  <span 
                    key={dataset} 
                    className="px-3 py-1 bg-purple-50 border border-purple-100 text-purple-700 font-semibold text-xs rounded-lg uppercase tracking-wider"
                  >
                    {dataset}
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

          {/* Related Papers Section embedded directly in Left Column */}
          {relatedPapers.length > 0 && (
            <section className="border-t border-border pt-10 text-left">
              <h2 className="text-lg font-black text-textDark mb-5 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span>Related Research Papers</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedPapers.map((rp) => (
                  <div 
                    key={rp.id}
                    onClick={() => onPaperChange(rp.id)}
                    className="group p-4 border border-border hover:border-primary hover:shadow-card-lg hover:-translate-y-[2px] rounded-card transition-all duration-300 cursor-pointer flex gap-4 bg-white h-[120px] overflow-hidden"
                  >
                    <div className="w-[48px] h-[64px] relative border border-border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                      {rp.thumbnail_url || rp.thumbnail ? (
                        <Image
                          src={rp.thumbnail_url || rp.thumbnail}
                          alt={rp.title}
                          width={48}
                          height={64}
                          className="w-full h-full object-contain p-1"
                          unoptimized
                        />
                      ) : (
                        <div className="text-[7px] text-gray-400 font-mono text-center px-0.5">Generating...</div>
                      )}
                    </div>
                    <div className="flex flex-col justify-between min-w-0 py-0.5 w-full">
                      <div>
                        <h4 className="text-xs font-bold text-textDark group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {rp.title}
                        </h4>
                        <span className="text-[10px] text-secondaryText block truncate mt-1">
                          {rp.authors} • {rp.year}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[8px] font-bold text-secondaryText uppercase tracking-wider bg-lightGray px-2 py-0.5 rounded-full border border-border">
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

        {/* Right Sidebar Layout Panel (sticky behavior on desktop) */}
        <div className="w-full lg:w-[32%] lg:sticky lg:top-6 lg:self-start space-y-6">
          
          {/* Paper Thumbnail Card */}
          <div className="bg-white border border-border rounded-card p-4 shadow-card-sm flex flex-col items-center">
            <div className="w-full relative border border-border rounded-lg bg-gray-50 flex items-center justify-center p-2 overflow-hidden shadow-xs" style={{ minHeight: '200px' }}>
              {displayThumbnail ? (
                <img
                  src={displayThumbnail}
                  alt={`${paper.title} sidebar preview`}
                  className="w-full h-auto object-contain max-h-[300px]"
                />
              ) : (
                <div className="w-full h-48 animate-pulse bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                  Loading Thumbnail...
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons Column */}
          <div className="flex flex-col gap-2.5">
            <button 
              onClick={() => setShowPDF(true)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#FF6A3D] border border-[#FF6A3D] hover:bg-[#e0582d] text-white font-bold text-xs uppercase tracking-wider rounded-[10px] transition-colors cursor-pointer shadow-xs"
            >
              <BookOpen className="w-4 h-4" />
              <span>Read PDF</span>
            </button>

            {paper.pdf_url && (
              <a 
                href={paper.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-border hover:bg-lightGray text-textDark font-bold text-xs uppercase tracking-wider rounded-[10px] transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-gray-500" />
                <span>Source Paper</span>
              </a>
            )}

            {paper.project_url && (
              <a 
                href={paper.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-border hover:bg-lightGray text-textDark font-bold text-xs uppercase tracking-wider rounded-[10px] transition-colors cursor-pointer"
              >
                <Globe className="w-4 h-4 text-gray-500" />
                <span>Project Page</span>
              </a>
            )}

            <button 
              onClick={handleToggleSave}
              className={`flex items-center justify-center gap-2 w-full px-4 py-3 border rounded-[10px] font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isSaved 
                  ? "bg-[#FFF3EE] text-[#FF6A3D] border-[#FF6A3D] shadow-xs" 
                  : "bg-white border-border hover:bg-lightGray text-textDark"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "text-[#FF6A3D] fill-[#FF6A3D]" : "text-gray-500"}`} />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>

            <button 
              onClick={handleToggleBookmark}
              className={`flex items-center justify-center gap-2 w-full px-4 py-3 border rounded-[10px] font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isBookmarked 
                  ? "bg-yellow-50 text-yellow-600 border-yellow-400 shadow-xs" 
                  : "bg-white border-border hover:bg-lightGray text-textDark"
              }`}
            >
              <Star className={`w-4 h-4 ${isBookmarked ? "text-yellow-500 fill-yellow-500" : "text-gray-500"}`} />
              <span>{isBookmarked ? "Bookmarked" : "Add Bookmark"}</span>
            </button>
            
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-border hover:bg-lightGray text-textDark font-bold text-xs uppercase tracking-wider rounded-[10px] transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-gray-500" />
              <span>Share Link</span>
            </button>
          </div>

          {/* GitHub Statistics & Code Repos */}
          <CodeRepoCard githubUrl={paper.github_url || ""} paperTitle={paper.title} />

          {/* Platform Mapping (Task/Model metadata summary) */}
          <PlatformMapping
            modelsUsed={paper.models_used}
            datasetsUsed={paper.datasets_used}
            framework={paper.framework}
            language={paper.language}
            tasks={paper.tasks}
            researchArea={paper.research_area}
          />

          {/* Paper Details */}
          <div className="bg-white border border-border rounded-card p-5 shadow-card-sm text-left">
            <h4 className="text-xs font-black text-secondaryText uppercase tracking-widest mb-3">
              PAPER DETAILS
            </h4>
            <div className="text-xs font-semibold text-secondaryText space-y-2">
              <div>Pages: <span className="text-textDark font-bold">{paper.pages} Pages</span></div>
              <div>Size: <span className="text-textDark font-bold">{paper.file_size}</span></div>
              <div>Pub Date: <span className="text-textDark font-bold">{paper.year}</span></div>
              <div>Citations: <span className="text-textDark font-bold">{paper.citations.toLocaleString()}</span></div>
              {paper.doi && (
                <div>DOI: <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline break-all">{paper.doi}</a></div>
              )}
            </div>
          </div>

          {/* Citation Format Card */}
          <div className="bg-white border border-border rounded-card p-5 shadow-card-sm text-left space-y-4">
            <h4 className="text-xs font-black text-secondaryText uppercase tracking-widest mb-1">
              CITATIONS
            </h4>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-gray-400">BibTeX Format</span>
                <button
                  onClick={handleCopyBib}
                  className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primaryHover transition-colors cursor-pointer"
                >
                  {copiedBib ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedBib ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="p-3 bg-lightGray border border-border rounded-lg text-[10px] font-semibold text-gray-600 leading-relaxed font-mono select-text overflow-x-auto text-left max-h-[120px]">
                {getBibtexCitation()}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-gray-400">APA Format</span>
                <button
                  onClick={handleCopyAPA}
                  className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primaryHover transition-colors cursor-pointer"
                >
                  {copiedAPA ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedAPA ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-3 bg-lightGray border border-border rounded-lg text-[10px] font-semibold text-gray-600 leading-relaxed font-mono select-text text-left max-h-[120px] overflow-y-auto">
                {getAPACitation()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PDF Document Viewer Modal Overlay */}
      {showPDF && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card overflow-hidden shadow-card-lg w-full max-w-[1100px] h-[90vh] flex flex-col relative">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
              <h3 className="font-bold text-textDark text-sm truncate max-w-[80%]">{paper.title}</h3>
              <button 
                onClick={() => setShowPDF(false)}
                className="px-3.5 py-1.5 bg-lightGray hover:bg-gray-200 text-textDark text-xs font-bold rounded-btn transition-colors cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4 bg-lightGray">
              <PDFViewer pdfUrl={paper.pdf_url || ""} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
