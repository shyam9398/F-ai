"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  ZoomIn, ZoomOut, Download, 
  ExternalLink, ChevronLeft, ChevronRight, Maximize2, Minimize2,
  Loader2, AlertTriangle
} from "lucide-react";

interface PDFViewerProps {
  pdfUrl: string;
}

interface PDFPageProps {
  pdf: any;
  pageNumber: number;
  scale: number;
  onRenderSuccess: () => void;
}

// React.memo with custom comparison function to prevent any unnecessary re-renders when parent pageNumber changes
const PDFPage = React.memo(
  function PDFPage({ pdf, pageNumber, scale, onRenderSuccess }: PDFPageProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const renderTaskRef = useRef<any>(null);
    
    // Maintain a stable reference to onRenderSuccess callback to avoid useEffect re-triggers
    const onRenderSuccessRef = useRef(onRenderSuccess);
    useEffect(() => {
      onRenderSuccessRef.current = onRenderSuccess;
    }, [onRenderSuccess]);

    useEffect(() => {
      if (!pdf || !canvasRef.current) return;

      let active = true;
      const renderPage = async () => {
        try {
          const page = await pdf.getPage(pageNumber);
          const canvas = canvasRef.current;
          if (!canvas) return;

          const context = canvas.getContext("2d");
          if (!context) return;

          // Crisp rendering scale with high resolution multiplier (1.5x resolution)
          const viewportScale = scale === 0 ? 1.5 : scale;
          const viewport = page.getViewport({ scale: viewportScale * 1.5 });
          
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
          }

          const renderTask = page.render(renderContext);
          renderTaskRef.current = renderTask;

          await renderTask.promise;
          if (active) {
            onRenderSuccessRef.current();
          }
        } catch (err: any) {
          if (err.name !== "RenderingCancelledException") {
            console.error(`Page ${pageNumber} rendering error:`, err);
          }
        }
      };

      renderPage();
      return () => {
        active = false;
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }
      };
    }, [pdf, pageNumber, scale]);

    return <canvas ref={canvasRef} className="w-full h-full block" />;
  },
  (prevProps, nextProps) => {
    // Custom comparison function: do not re-render if PDF, pageNumber, and scale remain the same
    return (
      prevProps.pdf === nextProps.pdf &&
      prevProps.pageNumber === nextProps.pageNumber &&
      prevProps.scale === nextProps.scale
    );
  }
);

export default function PDFViewer({ pdfUrl }: PDFViewerProps) {
  const [pdf, setPdf] = useState<any>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Track first page aspect ratio for pre-sized A4 layout placeholders
  const [aspectRatio, setAspectRatio] = useState<number>(1.414);

  // Lazy loading state: tracks which pages have been visible/near viewport
  const [visiblePages, setVisiblePages] = useState<Record<number, boolean>>({});

  // Render status state for showing skeletons
  const [renderedPages, setRenderedPages] = useState<Record<number, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize PDF.js worker Src
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
  }, []);

  // Load PDF Document once when url changes
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
    setAspectRatio(1.414);
    setVisiblePages({});
    setRenderedPages({});

    const pdfjsLib = (window as any).pdfjsLib;

    const requestUrl = pdfUrl.startsWith("http") 
      ? `/api/pdf?url=${encodeURIComponent(pdfUrl)}` 
      : pdfUrl;

    const loadingTask = pdfjsLib.getDocument(requestUrl);
    loadingTask.promise.then(
      async (loadedPdf: any) => {
        setPdf(loadedPdf);
        setNumPages(loadedPdf.numPages);
        
        try {
          // Precompute A4 aspect ratio from the first page viewport dimensions
          const firstPage = await loadedPdf.getPage(1);
          const viewport = firstPage.getViewport({ scale: 1.0 });
          setAspectRatio(viewport.height / viewport.width);
        } catch (e) {
          setAspectRatio(1.414); // Fallback to standard A4 ratio
        }

        setLoading(false);
      },
      (err: any) => {
        console.error("Error loading PDF: ", err);
        setError("Failed to load PDF file. Please verify the file path.");
        setLoading(false);
      }
    );
  }, [pdfUrl]);

  // Set up dynamic IntersectionObserver for lazy loading pages
  useEffect(() => {
    if (!pdf || numPages === 0 || !scrollContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.getAttribute("data-page") || "1", 10);
            setVisiblePages((prev) => {
              if (prev[pageNum]) return prev;
              return { ...prev, [pageNum]: true };
            });
          }
        });
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "350px", // Pre-render pages 350px before entering viewport for a seamless scroll
      }
    );

    const pageElements = scrollContainerRef.current.querySelectorAll("[data-page]");
    pageElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [pdf, numPages]);

  // Zoom handlers
  const zoomIn = () => setScale(prev => (prev === 0 ? 1.2 : prev + 0.2));
  const zoomOut = () => setScale(prev => (prev === 0 ? 1.0 : Math.max(0.6, prev - 0.2)));
  const fitWidth = () => setScale(0);

  // Scroll handler to track active page number dynamically based on element position
  const handleScroll = () => {
    if (!scrollContainerRef.current || numPages === 0) return;
    const container = scrollContainerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    const children = container.querySelectorAll("[data-page]");
    let currentPage = 1;
    let accumulatedHeight = 0;

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      accumulatedHeight += child.clientHeight + 24; // height + gap-6
      if (scrollTop + containerHeight / 2 < accumulatedHeight) {
        currentPage = i + 1;
        break;
      }
    }
    setPageNumber(currentPage);
  };

  // Paging navigation buttons smooth scrolling helper
  const scrollToPage = (pageNum: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const target = container.querySelector(`[data-page="${pageNum}"]`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
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

  // Stable rendering callback to mark pages as loaded
  const markPageRendered = useCallback((pageNum: number) => {
    setRenderedPages(prev => {
      if (prev[pageNum]) return prev;
      return { ...prev, [pageNum]: true };
    });
  }, []);

  // Determine page dimensions wrapper style based on zoom scale factor
  const getPageStyle = (pageNum: number) => {
    if (scale === 0) {
      // Fit Width style
      return {
        width: "100%",
        maxWidth: "850px",
        aspectRatio: `1 / ${aspectRatio}`,
      };
    } else {
      // Manual scale style
      const widthPx = Math.round(720 * scale);
      return {
        width: `${widthPx}px`,
        aspectRatio: `1 / ${aspectRatio}`,
      };
    }
  };

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
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border border-border transition-colors cursor-pointer text-gray-700 ${
              scale === 0 ? "bg-orange-50 border-orange-200 text-primary font-bold" : "hover:bg-gray-100"
            }`}
          >
            Fit Width
          </button>

          <button 
            disabled={loading}
            onClick={() => setScale(1.2)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border border-border transition-colors cursor-pointer text-gray-700 ${
              scale === 1.2 ? "bg-orange-50 border-orange-200 text-primary font-bold" : "hover:bg-gray-100"
            }`}
          >
            Actual Size
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
        className="flex-1 overflow-auto p-6 flex flex-col items-center gap-6 bg-zinc-800 relative scroll-smooth w-full"
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

        {!error && !loading && Array.from({ length: numPages }, (_, index) => {
          const pageNum = index + 1;
          const isPageVisible = visiblePages[pageNum];
          const isPageRendered = renderedPages[pageNum];

          return (
            <div 
              key={pageNum} 
              data-page={pageNum}
              className="shadow-xl bg-white border border-zinc-700/50 rounded-md overflow-hidden relative shrink-0"
              style={getPageStyle(pageNum)}
            >
              {/* If lazy loader hasn't marked it visible, or it is rendering, show skeleton */}
              {(!isPageVisible || !isPageRendered) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100 animate-pulse z-10 gap-2">
                  <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
                  <span className="text-[10px] font-bold text-gray-400">Loading Page {pageNum}...</span>
                </div>
              )}

              {/* Render canvas component only when visible near viewport */}
              {isPageVisible && (
                <PDFPage 
                  pdf={pdf} 
                  pageNumber={pageNum} 
                  scale={scale} 
                  onRenderSuccess={() => markPageRendered(pageNum)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
