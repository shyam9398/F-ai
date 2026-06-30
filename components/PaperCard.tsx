"use client";

import { useState, useEffect } from "react";
import { getPapers, type Paper } from "@/lib/paperApi";
import Image from "next/image";

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
      className={`h-[22px] inline-flex items-center px-2.5 rounded-[4px] text-[11px] font-mono hover:opacity-80 transition-opacity ${c.bg} ${c.text} ${c.border || ""} whitespace-nowrap`}
    >
      {!isGray && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${c.dot}`} />
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
    <div className="mb-2 text-[11.5px] tracking-tight flex flex-wrap items-center gap-x-2 gap-y-1 overflow-hidden w-full select-none">
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
            {idx > 0 && <span className="text-[#9CA3AF] mx-1.5 font-normal select-none">•</span>}

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
function PaperThumbnail({ title, thumbnail }: { title: string; thumbnail: string }) {
  return (
    <div className="w-[130px] h-[175px] shrink-0 border border-[#E5E5D8] rounded-[6px] bg-[#F9F8F6] overflow-hidden relative flex items-center justify-center select-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      {thumbnail ? (
        <Image
          src={thumbnail}
          alt={title || "Paper thumbnail"}
          fill
          className="object-cover object-top"
          sizes="130px"
          unoptimized
        />
      ) : (
        <div className="text-[#A3A39C] text-[11px] font-sans font-medium text-center tracking-wide px-2">
          No Cover
        </div>
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
    <div className="flex flex-col items-center text-center select-none">
      <div className="flex items-center gap-1.5 mb-0.5">
        {children}
        <span className="text-[15px] font-bold text-[#111111] leading-none tabular-nums">
          {value}
        </span>
      </div>
      <span className="text-[9px] font-black text-[#8B8B8B] uppercase tracking-[0.08em] leading-none font-sans">
        {label}
      </span>
    </div>
  );
}

/* ─── Paper Card ─────────────────────────────────────────────────────────── */
export function PaperCard({ paper }: { paper: Paper }) {
  const upvotesStr = paper.upvotes || "0";

  return (
    <div className="group flex flex-col md:flex-row items-stretch gap-5 p-5 border border-[#E5E5D8] bg-white rounded-[8px] hover:border-[#F55036]/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-250 cursor-pointer w-full min-h-[215px]">
      {/* LEFT — PDF thumbnail (vertically centered) */}
      <div className="flex items-center justify-center shrink-0 self-center md:self-auto">
        <PaperThumbnail title={paper.title} thumbnail={paper.thumbnail} />
      </div>

      {/* CENTER — Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
        {/* Title */}
        <h3 className="text-[19px] font-serif font-medium text-[#2C2C2C] leading-[1.3] mb-1.5 group-hover:text-[#F55036] transition-colors line-clamp-2">
          {paper.title}
        </h3>

        {/* Authors + Date */}
        <p className="text-[13px] text-[#6B6B6B] mb-3 leading-tight truncate">
          {paper.authors}
          {paper.date && (
            <>
              <span className="mx-2 text-[#DCDCD7]">·</span>
              <span className="text-gray-400 font-medium">{paper.date}</span>
            </>
          )}
        </p>

        {/* Description */}
        {paper.description && (
          <p className="text-[13.5px] font-normal text-[#555555] leading-[1.5] mb-3.5 line-clamp-3">
            {paper.description}
          </p>
        )}

        {/* Benchmark / SOTA (Row 1) */}
        <div className="w-full overflow-hidden">
          <SotaDisplay sota={paper.sota} />
        </div>

        {/* Tags Rows */}
        <div className="flex flex-col gap-1.5 mt-auto">
          {paper.tags && paper.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {paper.tags.map((t) => {
                const colorKey = getTagColor(t);
                return <Pill key={t} label={t} colorKey={colorKey} />;
              })}
            </div>
          )}

          {paper.additionalTags && paper.additionalTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {paper.additionalTags.map((t) => {
                const colorKey = getTagColor(t);
                return <Pill key={t} label={t} colorKey={colorKey} />;
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — Metrics */}
      <div className="shrink-0 flex items-stretch pl-5 pr-3 border-t md:border-t-0 md:border-l border-[#E5E5D8] mt-4 md:mt-0 pt-4 md:pt-0 w-full md:w-[120px] justify-center">
        <div className="flex flex-row md:flex-col justify-around md:justify-center md:gap-7 items-center w-full py-1">
          <Metric value={`↑${upvotesStr}`} label="Stars / Hr" />

          <Metric value={paper.repo} label="Repo">
            <svg className="w-3.5 h-3.5 text-gray-500 fill-none stroke-current shrink-0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="18" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <path d="M18 15V9a4 4 0 0 0-4-4H9" />
              <line x1="6" y1="9" x2="6" y2="15" />
            </svg>
          </Metric>

          <Metric value={(paper.citations || 0).toString()} label="Citations">
            <svg className="w-3.5 h-3.5 text-gray-500 fill-none stroke-current shrink-0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </Metric>
        </div>
      </div>
    </div>
  );
}

/* ─── List ───────────────────────────────────────────────────────────────── */
export default function PaperList() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPapers() {
      try {
        setLoading(true);
        const data = await getPapers();
        setPapers(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load papers. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadPapers();
  }, []);

  if (loading) {
    return (
      <div className="pb-12 pt-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E40AF]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-12 pt-8 flex justify-center items-center text-[#F55036]">
        <p className="text-[14px]">{error}</p>
      </div>
    );
  }

  return (
    <div className="pb-12 bg-transparent flex flex-col gap-4 w-full">
      {papers.map((paper) => (
        <PaperCard key={paper.id} paper={paper} />
      ))}
    </div>
  );
}
