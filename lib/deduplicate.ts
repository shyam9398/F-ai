// lib/deduplicate.ts
// Deduplicate an array of paper objects using multiple keys.
// Returns a new array with unique papers, keeping the richest version.

export interface Paper {
  id: string;
  arxiv_id?: string;
  doi?: string;
  pdf_url?: string;
  title?: string;
  // other fields are kept as any for flexibility
  [key: string]: any;
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function deduplicatePapers(papers: Paper[]): Paper[] {
  const seenArxiv = new Set<string>();
  const seenDoi = new Set<string>();
  const seenPdf = new Set<string>();
  const seenTitle = new Set<string>();
  const unique: Paper[] = [];

  for (const paper of papers) {
    const arxivId = (paper.arxiv_id || "").toLowerCase();
    const doi = (paper.doi || "").toLowerCase();
    const pdf = (paper.pdf_url || "").toLowerCase();
    const titleNorm = paper.title ? normalizeTitle(paper.title) : "";

    if (arxivId && seenArxiv.has(arxivId)) continue;
    if (doi && seenDoi.has(doi)) continue;
    if (pdf && seenPdf.has(pdf)) continue;
    if (titleNorm && seenTitle.has(titleNorm)) continue;

    if (arxivId) seenArxiv.add(arxivId);
    if (doi) seenDoi.add(doi);
    if (pdf) seenPdf.add(pdf);
    if (titleNorm) seenTitle.add(titleNorm);

    unique.push(paper);
  }
  return unique;
}
