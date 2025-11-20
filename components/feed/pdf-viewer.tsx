"use client";
import { useEffect, useState } from "react";
import { useInView } from "@/hooks/use-in-view";

// Lazy load pdfjs to avoid SSR issues.
const loadPdfJs = async () => {
  const pdfjs = await import("pdfjs-dist");
  // @ts-ignore - workerSrc not in types (runtime property)
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  return pdfjs;
};

interface PdfViewerProps {
  data: string; // base64 data URL (e.g. data:application/pdf;base64,...)
  maxPages?: number; // optional cap to avoid huge docs
}

export default function PdfViewer({ data, maxPages = 25 }: PdfViewerProps) {
  const { ref, inView } = useInView({ threshold: 0.1, once: true });
  const [pages, setPages] = useState<string[]>([]); // store page data URLs
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!inView || pages.length > 0 || loading) return;

    const renderPdf = async () => {
      try {
        setLoading(true);
        const pdfjs = await loadPdfJs();
        const pdf = await pdfjs.getDocument(data).promise;
        const total = Math.min(pdf.numPages, maxPages);
        const rendered: string[] = [];

        for (let i = 1; i <= total; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.25 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport }).promise;
          rendered.push(canvas.toDataURL());
        }
        setPages(rendered);
      } catch (e: any) {
        setError("Failed to render PDF");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    renderPdf();
  }, [inView, data, pages.length, loading, maxPages]);

  return (
    <div ref={ref} className="space-y-3">
      {loading && <div className="text-xs text-muted-foreground">Loading document…</div>}
      {error && <div className="text-xs text-destructive">{error}</div>}
      {!loading && !error && pages.map((src, idx) => (
        <div key={idx} className="border border-border/50 rounded-md overflow-hidden bg-muted">
          <img src={src} alt={`Page ${idx + 1}`} className="w-full h-auto" />
          <div className="px-2 py-1 text-[10px] text-muted-foreground bg-background/80 border-t border-border/40">Page {idx + 1}</div>
        </div>
      ))}
    </div>
  );
}
