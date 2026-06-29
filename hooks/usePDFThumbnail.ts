"use client";

import { useState, useEffect } from "react";

// Global cache to prevent re-generating thumbnails for the same PDF multiple times
const thumbnailCache: { [url: string]: string } = {};

export function usePDFThumbnail(pdfUrl: string) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!pdfUrl) {
      setLoading(false);
      return;
    }

    // Check cache first
    if (thumbnailCache[pdfUrl]) {
      setThumbnail(thumbnailCache[pdfUrl]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(false);

    const generateThumbnail = async () => {
      try {
        // Wait until window.pdfjsLib is available
        let attempts = 0;
        while (typeof window !== "undefined" && !(window as any).pdfjsLib && attempts < 30) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          attempts++;
        }

        if (typeof window === "undefined" || !(window as any).pdfjsLib) {
          throw new Error("PDF.js library not available");
        }

        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        // Load document through local CORS proxy if it is an external URL
        const requestUrl = pdfUrl.startsWith("http") 
          ? `/api/pdf?url=${encodeURIComponent(pdfUrl)}` 
          : pdfUrl;
        const loadingTask = pdfjsLib.getDocument(requestUrl);
        const pdf = await loadingTask.promise;
        
        // Load page 1
        const page = await pdf.getPage(1);
        
        // Set scale for thumbnail dimensions (110 x 145 px)
        const desiredWidth = 110;
        const desiredHeight = 145;
        const viewport = page.getViewport({ scale: 1.0 });
        
        const scaleX = desiredWidth / viewport.width;
        const scaleY = desiredHeight / viewport.height;
        const scale = Math.min(scaleX, scaleY);
        
        const thumbnailViewport = page.getViewport({ scale });

        // Create offscreen canvas
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas context is not available");

        canvas.width = thumbnailViewport.width;
        canvas.height = thumbnailViewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: thumbnailViewport,
        };

        const renderTask = page.render(renderContext);
        await renderTask.promise;

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

        if (isMounted) {
          thumbnailCache[pdfUrl] = dataUrl;
          setThumbnail(dataUrl);
          setLoading(false);
        }
      } catch (err) {
        console.error(`Error generating thumbnail for ${pdfUrl}: `, err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    generateThumbnail();

    return () => {
      isMounted = false;
    };
  }, [pdfUrl]);

  return { thumbnail, loading, error };
}
