"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ZoomIn, ZoomOut, Maximize2, Minimize2, Download, 
  ExternalLink, ChevronLeft, ChevronRight, Maximize, 
  Loader2, AlertTriangle, CheckSquare
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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);

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

  // Render current page to canvas
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        setRendering(true);
        const page = await pdf.getPage(pageNumber);
        
        // Cancel existing render task if any
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d");
        if (!context) return;

        let viewportScale = scale;
        if (scale === 0) {
          // Fit Width calculation
          const containerWidth = containerRef.current?.clientWidth || 600;
          const defaultViewport = page.getViewport({ scale: 1.0 });
          viewportScale = (containerWidth - 40) / defaultViewport.width;
        }

        const viewport = page.getViewport({ scale: viewportScale });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        setRendering(false);
      } catch (err: any) {
        if (err.name !== "RenderingCancelledException") {
          console.error("Page render error: ", err);
        }
      }
    };

    renderPage();
  }, [pdf, pageNumber, scale, isFullscreen]);

  // Zoom handlers
  const zoomIn = () => setScale(prev => (prev === 0 ? 1.2 : prev + 0.2));
  const zoomOut = () => setScale(prev => (prev === 0 ? 1.0 : Math.max(0.6, prev - 0.2)));
  const fitWidth = () => setScale(0);

  // Paging handlers
  const nextPage = () => setPageNumber(prev => Math.min(numPages, prev + 1));
  const prevPage = () => setPageNumber(prev => Math.max(1, prev - 1));

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
      className={`flex flex-col bg-lightGray border border-border rounded-card overflow-hidden shadow-card-sm w-full ${
        isFullscreen ? "h-screen p-4 bg-zinc-900" : "h-[620px]"
      }`}
    >
      {/* Sticky Top Action Toolbar Bar */}
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
      <div className="flex-1 overflow-auto p-4 flex items-start justify-center relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20 gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <span className="text-sm font-semibold text-secondaryText">Loading PDF Document...</span>
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

        {!error && !loading && (
          <div className={`transition-all duration-300 shadow-lg border border-border bg-white rounded-md overflow-hidden ${
            rendering ? "opacity-60" : "opacity-100"
          }`}>
            <canvas ref={canvasRef} />
          </div>
        )}
      </div>
    </div>
  );
}
