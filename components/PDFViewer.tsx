"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ZoomIn, ZoomOut, Download, 
  ExternalLink, ChevronLeft, ChevronRight, Maximize2, Minimize2,
  Loader2, AlertTriangle
} from "lucide-react";

interface PDFViewerProps {
  pdfUrl: string;
}

export default function PDFViewer({ pdfUrl }: PDFViewerProps) {
  const [pdf, setPdf] = useState<any>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const renderTasksRef = useRef<(any | null)[]>([]);

  // Initialize PDF.js worker
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
  }, []);

  // Load PDF Document
  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).pdfjsLib) {
      setError("PDF library not loaded. Please refresh the page.");
      return;
    }

    setLoading(true);
    setError(null);
    setPdf(null);
    setPageNumber(1);
    setNumPages(0);
    canvasRefs.current = [];
    renderTasksRef.current = [];

    const pdfjsLib = (window as any).pdfjsLib;

    const requestUrl = pdfUrl.startsWith("http") 
      ? `/api/pdf?url=${encodeURIComponent(pdfUrl)}` 
      : pdfUrl;

    const loadingTask = pdfjsLib.getDocument(requestUrl);
    loadingTask.promise.then(
      (loadedPdf: any) => {
        setPdf(loadedPdf);
        setNumPages(loadedPdf.numPages);
        setLoading(false);
      },
      (err: any) => {
        console.error("Error loading PDF: ", err);
        setError("Failed to load PDF file. Please verify the file path.");
        setLoading(false);
      }
    );
  }, [pdfUrl]);

  // Render all pages to their respective canvases sequentially
  useEffect(() => {
    if (!pdf || numPages === 0) return;

    let active = true;
    const renderPages = async () => {
      setRendering(true);
      try {
        // Cancel all existing tasks
        renderTasksRef.current.forEach(task => task?.cancel());
        renderTasksRef.current = new Array(numPages).fill(null);

        for (let i = 1; i <= numPages; i++) {
          if (!active) break;
          const page = await pdf.getPage(i);
          const canvas = canvasRefs.current[i - 1];
          if (!canvas) continue;
          
          const context = canvas.getContext("2d");
          if (!context) continue;

          let viewportScale = scale;
          if (scale === 0) {
            // Fit Width calculation
            const containerWidth = scrollContainerRef.current?.clientWidth || 800;
            const defaultViewport = page.getViewport({ scale: 1.0 });
            viewportScale = (containerWidth - 60) / defaultViewport.width;
          }

          const viewport = page.getViewport({ scale: viewportScale });
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          const renderTask = page.render(renderContext);
          renderTasksRef.current[i - 1] = renderTask;

          await renderTask.promise;
        }
      } catch (err: any) {
        if (err.name !== "RenderingCancelledException") {
          console.error("Multi-page rendering error: ", err);
        }
      } finally {
        if (active) {
          setRendering(false);
        }
      }
    };

    renderPages();
    return () => {
      active = false;
      renderTasksRef.current.forEach(task => task?.cancel());
    };
  }, [pdf, numPages, scale]);

  // Zoom handlers
  const zoomIn = () => setScale(prev => (prev === 0 ? 1.2 : prev + 0.2));
  const zoomOut = () => setScale(prev => (prev === 0 ? 1.0 : Math.max(0.6, prev - 0.2)));
  const fitWidth = () => setScale(0);

  // Scroll handler to track active page number dynamically
  const handleScroll = () => {
    if (!scrollContainerRef.current || numPages === 0) return;
    const container = scrollContainerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    let currentPage = 1;
    let accumulatedHeight = 0;

    for (let i = 0; i < numPages; i++) {
      const canvas = canvasRefs.current[i];
      if (!canvas) continue;
      accumulatedHeight += canvas.clientHeight + 16; // height + gap
      if (scrollTop + containerHeight / 2 < accumulatedHeight) {
        currentPage = i + 1;
        break;
      }
    }
    setPageNumber(currentPage);
  };

  // Paging navigation buttons smooth scrolling helper
  const scrollToPage = (pageNum: number) => {
    const canvas = canvasRefs.current[pageNum - 1];
    if (canvas && scrollContainerRef.current) {
      canvas.scrollIntoView({ behavior: "smooth", block: "start" });
      setPageNumber(pageNum);
    }
  };

  const nextPage = () => {
    const targetPage = Math.min(numPages, pageNumber + 1);
    scrollToPage(targetPage);
  };

  const prevPage = () => {
    const targetPage = Math.max(1, pageNumber - 1);
    scrollToPage(targetPage);
  };

  // Fullscreen handlers
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Fullscreen error: ", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col bg-zinc-900 border border-border rounded-card overflow-hidden shadow-card-lg w-full ${
        isFullscreen ? "h-screen p-4" : "h-[75vh]"
      }`}
    >
      {/* Action Toolbar Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white border-b border-border ${
        isFullscreen ? "rounded-t-lg" : ""
      }`}>
        {/* Navigation Section */}
        <div className="flex items-center gap-2.5">
          <button 
            disabled={pageNumber <= 1 || loading}
            onClick={prevPage}
            className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          
          <span className="text-sm font-semibold text-textDark">
            Page {pageNumber} of {numPages || "?"}
          </span>

          <button 
            disabled={pageNumber >= numPages || loading}
            onClick={nextPage}
            className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
            aria-label="Next Page"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button 
            disabled={loading}
            onClick={zoomOut}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>

          <button 
            disabled={loading}
            onClick={fitWidth}
            className="px-2.5 py-1 text-xs font-semibold hover:bg-gray-100 rounded-md border border-border transition-colors cursor-pointer text-gray-700"
          >
            Fit Width
          </button>

          <button 
            disabled={loading}
            onClick={zoomIn}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Document Action Button Controls */}
        <div className="flex items-center gap-2">
          <a
            href={pdfUrl}
            download
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
            title="Download PDF"
          >
            <Download className="w-5 h-5 text-gray-700" />
          </a>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
            title="Open in new tab"
          >
            <ExternalLink className="w-5 h-5 text-gray-700" />
          </a>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5 text-gray-700" /> : <Maximize2 className="w-5 h-5 text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Rendering / Scroll Container Area */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto p-4 flex flex-col items-center gap-4 bg-zinc-800 relative scroll-smooth"
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/80 z-20 gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <span className="text-sm font-semibold text-white">Loading PDF Document...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-md bg-white border border-border rounded-xl shadow-xs my-auto">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
            <h4 className="text-lg font-bold text-textDark mb-1">Failed to display PDF</h4>
            <p className="text-sm text-secondaryText mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary hover:bg-primaryHover text-white font-semibold rounded-btn text-sm transition-colors cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        )}

        {!error && !loading && Array.from({ length: numPages }, (_, index) => (
          <div 
            key={index + 1} 
            className={`transition-all duration-300 shadow-xl border border-zinc-700 bg-white rounded-md overflow-hidden ${
              rendering ? "opacity-75" : "opacity-100"
            }`}
          >
            <canvas ref={el => { canvasRefs.current[index] = el; }} />
          </div>
        ))}
      </div>
    </div>
  );
}
