"use client";

import { MessageCircle } from "lucide-react";
import { type Paper } from "@/lib/paperApi";
import Image from "next/image";
import { usePDFThumbnail } from "../hooks/usePDFThumbnail";

/* ─── Custom Github SVG Component ────────────────────────────────────────── */
function Github({ size = 13, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

/* ─── Tag color map ──────────────────────────────────────────────────────── */
const TAG_COLORS: Record<string, { bg: string; text: string; dot: string; border?: string }> = {
  purple: { bg: "bg-[#F3E8FF]", text: "text-[#6B21A8]", dot: "bg-[#9333EA]", border: "border border-[#D8B4FE]" },
  blue: { bg: "bg-[#E0F2FE]", text: "text-[#0369A1]", dot: "bg-[#0284C7]", border: "border border-[#BAE6FD]" },
  green: { bg: "bg-[#ECFDF5]", text: "text-[#047857]", dot: "bg-[#10B981]", border: "border border-[#A7F3D0]" },
  cyan: { bg: "bg-[#CFFAFE]", text: "text-[#0E7490]", dot: "bg-[#06B6D4]", border: "border border-[#A5F3FC]" },
  gray: { bg: "bg-white", text: "text-[#111111]", dot: "", border: "border border-[#E5E5E0]" },
};

function getTagColor(label: string): string {
  const map: Record<string, string> = {
    "Reinforcement Learning": "blue",
    "Image Understanding": "blue",
    Agents: "green",
    "Long Context": "purple",
  };
  return map[label] || "gray";
}

/* ─── Pill tag ───────────────────────────────────────────────────────────── */
function Pill({ label, colorKey }: { label: string; colorKey: string }) {
  const c = TAG_COLORS[colorKey] || TAG_COLORS.gray;
  const isGray = colorKey === "gray";

  return (
    <span
      className={`h-[28px] xl:h-[24px] inline-flex items-center px-3 xl:px-2 rounded-[4px] text-[11px] font-mono cursor-pointer hover:opacity-80 transition-opacity ${c.bg} ${c.text} ${c.border || ""} whitespace-nowrap`}
    >
      {!isGray && (
        <span className={`w-1.5 h-1.5 rounded-full mr-2 shrink-0 ${c.dot}`} />
      )}
      {label}
    </span>
  );
}

/* ─── SOTA Display ───────────────────────────────────────────────────────── */
function SotaDisplay({ sota }: { sota: string }) {
  if (!sota) return null;
  const segments = sota.split(" • ");

  return (
    <div className="mb-[12px] text-[11.5px] tracking-tight flex flex-nowrap items-center gap-x-2 gap-y-1 overflow-hidden whitespace-nowrap w-full">
      {segments.map((segment, idx) => {
        const isSota = segment.startsWith("SOTA on ");
        const isOn = segment.includes(" on ");

        let prefix = "";
        let benchmarks = segment;

        if (isSota) {
          benchmarks = segment.replace("SOTA on ", "");
        } else if (isOn) {
          const parts = segment.split(" on ");
          prefix = parts[0];
          benchmarks = parts[1];
        }

        return (
          <span key={idx} className="inline-flex items-center">
            {idx > 0 && <span className="text-[#9CA3AF] mx-1.5 font-normal">•</span>}

            {isSota ? (
              <>
                <span className="text-[#B48C52] font-semibold mr-1 tracking-wide">SOTA</span>
                <span className="mr-1 text-[10px]">🏆</span>
                <span className="text-[#8B8B8B] mr-1 font-normal">on</span>
                <span className="text-[#1E40AF] font-mono text-[11.5px] tracking-tighter">{benchmarks}</span>
              </>
            ) : isOn ? (
              <>
                <span className="text-[#8B8B8B] font-normal mr-1">{prefix}</span>
                <span className="text-[#8B8B8B] mr-1 font-normal">on</span>
                <span className="text-[#1E40AF] font-mono text-[11.5px] tracking-tighter">{benchmarks}</span>
              </>
            ) : (
              <span className="text-[#8B8B8B] font-normal tracking-tight">{segment}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

/* ─── Thumbnail ──────────────────────────────────────────────────────────── */
function PaperThumbnail({ title, thumbnail, pdfUrl }: { title: string; thumbnail: string; pdfUrl: string }) {
  const { thumbnail: generatedThumbnail } = usePDFThumbnail(thumbnail ? "" : pdfUrl);
  const displayThumbnail = thumbnail || generatedThumbnail;

  return (
    <div className="w-full xl:w-[170px] h-[180px] sm:h-[220px] xl:h-[240px] shrink-0 border border-[#E5E5E0] rounded-md xl:rounded-none bg-[#F8F7F2] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.07)] relative flex items-center justify-center">
      {displayThumbnail ? (
        <Image
          src={displayThumbnail}
          alt={title || "Paper thumbnail"}
          fill
          className="object-cover object-top"
          sizes="(max-width: 1280px) 100vw, 170px"
          unoptimized
        />
      ) : (
        <div className="text-[#8B8B8B] text-[10px] font-mono px-4 text-center">Generating...</div>
      )}
    </div>
  );
}

/* ─── Metric block ───────────────────────────────────────────────────────── */
function Metric({
  value,
  label,
  children,
}: {
  value: string;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1.5">
        {children}
        <span className="text-[14.5px] font-bold text-[#111111] leading-none tabular-nums">
          {value}
        </span>
      </div>
      <span className="text-[8px] font-bold text-[#8B8B8B] uppercase tracking-[0.08em] leading-none">
        {label}
      </span>
    </div>
  );
}

/* ─── Paper Card ─────────────────────────────────────────────────────────── */
export function PaperCard({ paper }: { paper: Paper }) {
  // Parse upvotes string to float for stars/hr, e.g. "11.2K" -> "11.2"
  const upvotesNum = parseFloat(paper.upvotes) || 0;

  return (
    <div className="group flex flex-col xl:flex-row gap-4 xl:gap-6 p-4 xl:py-6 xl:px-6 border xl:border-x-0 xl:border-t-0 border-[#E5E5E0] bg-white xl:bg-transparent min-w-0 cursor-pointer hover:shadow-md xl:hover:bg-white xl:hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-200 rounded-xl xl:rounded-none h-full">
      {/* LEFT — PDF thumbnail */}
      <div className="flex flex-col justify-center shrink-0 w-full xl:w-auto">
        <PaperThumbnail title={paper.title} thumbnail={paper.thumbnail} pdfUrl={paper.pdf_url} />
      </div>

      {/* RIGHT — Content */}
      <div className="flex-1 min-w-0 flex flex-col xl:pr-8">
        {/* Title */}
        <h3 className="text-[18px] xl:text-[20px] font-serif font-medium text-[#2D2D2D] leading-[1.3] mb-2 group-hover:text-[#F55036] transition-colors line-clamp-3 xl:line-clamp-2">
          {paper.title}
        </h3>

        {/* Authors + date */}
        <p className="text-[13px] font-normal text-[#555555] mb-3 truncate">
          {paper.authors}
          <span className="mx-2 text-[#DCDCD7]">·</span>
          {paper.date}
        </p>

        {/* Description */}
        <p className="text-[14px] font-normal text-[#555555] leading-[1.6] mb-4 line-clamp-3">
          {paper.description}
        </p>

        {/* Benchmark / SOTA (Row 1) */}
        <div className="w-full overflow-hidden">
          <SotaDisplay sota={paper.sota} />
        </div>

        {/* Tasks (Row 2) */}
        <div className="flex flex-nowrap items-center gap-2 mb-2 w-full overflow-hidden">
          {paper.tags?.map((t: string, idx: number) => {
            const colorKey = getTagColor(t);
            return <Pill key={`${t}-${idx}`} label={t} colorKey={colorKey} />;
          })}
        </div>

        {/* Methods (Row 3) */}
        <div className="flex flex-nowrap items-center gap-2 w-full overflow-hidden">
          {paper.additionalTags?.map((t: string, idx: number) => {
            const colorKey = getTagColor(t);
            return <Pill key={`${t}-${idx}`} label={t} colorKey={colorKey} />;
          })}
        </div>
      </div>

      {/* RIGHT — Metrics */}
      <div className="shrink-0 flex items-stretch xl:pl-[24px] xl:pr-[32px] border-t xl:border-t-0 xl:border-l border-[#E5E5E0] mt-auto xl:mt-0 pt-4 xl:pt-0 w-full xl:w-auto">
        <div className="flex flex-row xl:flex-col justify-around xl:justify-around items-center w-full xl:w-[64px] xl:py-2 gap-2 xl:gap-0">
          <Metric value={`↑${upvotesNum}`} label="Stars / Hr">
            {/* Minimal optional icon if needed */}
          </Metric>

          <Metric value={paper.repo} label="Repo">
            <Github size={13} className="text-[#8B8B8B] shrink-0" />
          </Metric>

          <Metric value={(paper.citations || 0).toString()} label="Citations">
            <MessageCircle size={13} className="text-[#8B8B8B] shrink-0" />
          </Metric>
        </div>
      </div>
    </div>
  );
}

/* ─── List ───────────────────────────────────────────────────────────────── */
interface PaperListProps {
  papers: Paper[];
  onPaperClick?: (id: string) => void;
}

export default function PaperList({ papers, onPaperClick }: PaperListProps) {
  return (
    <div className="pb-12 bg-transparent grid grid-cols-1 md:grid-cols-2 xl:flex xl:flex-col gap-6 xl:gap-0">
      {papers.map((paper) => (
        <div key={paper.id} onClick={() => onPaperClick && onPaperClick(paper.id)}>
          <PaperCard paper={paper} />
        </div>
      ))}
    </div>
  );
}
