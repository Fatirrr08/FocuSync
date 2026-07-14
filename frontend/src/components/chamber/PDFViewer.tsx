"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const WORKER_SRC = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

interface PDFPage {
  getViewport: (opts: { scale: number }) => { width: number; height: number };
  render: (ctx: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void>; cancel: () => void };
}

interface PDFDocument {
  numPages: number;
  getPage: (n: number) => Promise<PDFPage>;
}

interface PdfjsLib {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<PDFDocument> };
}

function loadPdfJs(): Promise<PdfjsLib> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as { pdfjsLib?: PdfjsLib };
    if (w.pdfjsLib) { resolve(w.pdfjsLib); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      if (w.pdfjsLib) resolve(w.pdfjsLib);
      else reject(new Error("PDF.js loaded but pdfjsLib not found"));
    };
    script.onerror = () => reject(new Error("Failed to load PDF.js"));
    document.head.appendChild(script);
  });
}

export default function PDFViewer() {
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfjsRef = useRef<PdfjsLib | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);

  const renderPage = useCallback(
    async (doc: PDFDocument, num: number, scale: number) => {
      if (!canvasRef.current) return;
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch {}
      }
      try {
        const page: PDFPage = await doc.getPage(num);
        const viewport = page.getViewport({ scale: scale / 100 });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const renderTask = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        renderTaskRef.current = null;
      } catch (err) {
        if (err instanceof Error && err.name !== "RenderingCancelledException") throw err;
      }
    },
    []
  );

  const loadPDF = useCallback(
    async (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
        return;
      }
      setLoading(true);
      setError(null);
      setPdfDoc(null);
      setPageNum(1);
      setZoom(100);
      try {
        const lib = await loadPdfJs();
        pdfjsRef.current = lib;
        lib.GlobalWorkerOptions.workerSrc = WORKER_SRC;
        const buffer = await file.arrayBuffer();
        const doc = await lib.getDocument({ data: buffer }).promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setPageNum(1);
        await renderPage(doc, 1, 100);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load PDF");
      } finally {
        setLoading(false);
      }
    },
    [renderPage]
  );

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, pageNum, zoom);
    }
  }, [pdfDoc, pageNum, zoom, renderPage]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        loadPDF(file);
      } else {
        setError("Please drop a PDF file");
      }
    },
    [loadPDF]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleFilePick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) loadPDF(file);
      e.target.value = "";
    },
    [loadPDF]
  );

  const changePage = useCallback(
    (delta: number) => {
      if (!pdfDoc) return;
      setPageNum((prev) => {
        const next = prev + delta;
        return Math.max(1, Math.min(next, totalPages));
      });
    },
    [pdfDoc, totalPages]
  );

  const changeZoom = useCallback((delta: number) => {
    setZoom((prev) => Math.max(25, Math.min(300, prev + delta)));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!pdfDoc) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        changePage(-1);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        changePage(1);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [pdfDoc, changePage]);

  if (!pdfDoc && !loading && !error) {
    return (
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center w-full h-80 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
          dragOver
            ? "border-violet/60 bg-violet-pale"
            : "border-glass-border bg-glass hover:border-violet/30 hover:bg-violet-pale/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFilePick}
          className="hidden"
        />
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-text-muted mb-4"
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
        <p className="text-text-secondary text-sm mb-1">
          Drop PDF here or click to browse
        </p>
        <p className="text-text-muted text-xs">Max file size: 20MB</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-80 rounded-2xl bg-glass border border-glass-border">
        <div className="w-10 h-10 border-2 border-violet border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-text-secondary text-sm">Loading PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-80 rounded-2xl bg-glass border border-crimson/20">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#EF4444"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-4"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-crimson text-sm mb-3">{error}</p>
        <button
          onClick={() => { setError(null); }}
          className="px-4 py-2 rounded-xl bg-glass border border-glass-border text-text-secondary text-sm font-medium hover:bg-glass-hover transition-all duration-200"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => changePage(-1)}
            disabled={pageNum <= 1}
            className="px-3 py-1.5 rounded-lg bg-glass border border-glass-border text-text-secondary text-sm hover:bg-glass-hover disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
          >
            Prev
          </button>
          <span className="text-text-secondary text-sm font-medium min-w-[60px] text-center">
            {pageNum} / {totalPages}
          </span>
          <button
            onClick={() => changePage(1)}
            disabled={pageNum >= totalPages}
            className="px-3 py-1.5 rounded-lg bg-glass border border-glass-border text-text-secondary text-sm hover:bg-glass-hover disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
          >
            Next
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => changeZoom(-25)}
            disabled={zoom <= 25}
            className="px-2 py-1.5 rounded-lg bg-glass border border-glass-border text-text-secondary text-sm hover:bg-glass-hover disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
          >
            −
          </button>
          <span className="text-text-secondary text-sm font-medium min-w-[50px] text-center">
            {zoom}%
          </span>
          <button
            onClick={() => changeZoom(25)}
            disabled={zoom >= 300}
            className="px-2 py-1.5 rounded-lg bg-glass border border-glass-border text-text-secondary text-sm hover:bg-glass-hover disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
          >
            +
          </button>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-lg bg-glass border border-glass-border text-text-secondary text-sm hover:bg-glass-hover transition-all duration-200"
        >
          Change PDF
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFilePick}
          className="hidden"
        />
      </div>

      <div className="flex items-center justify-center w-full rounded-xl bg-glass border border-glass-border overflow-hidden">
        <canvas ref={canvasRef} className="max-w-full h-auto" />
      </div>
    </div>
  );
}
