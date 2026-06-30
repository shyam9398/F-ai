import { NextRequest, NextResponse } from "next/server";
import { deduplicatePapers } from "@/lib/deduplicate";

// In‑memory cache for the combined pool. Cache expires after CACHE_TTL_MS.
let cachedPapersPool: any[] | null = null;
let lastCacheUpdateTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Simple LRU cache for GitHub repo stats (5 min TTL)
const githubCache = new Map<string, { data: any; ts: number }>();
const GITHUB_TTL = 5 * 60 * 1000;

// In-memory cache for citation counts (30 min TTL)
const citationCache = new Map<string, { count: number; ts: number }>();
const CITATION_TTL = 30 * 60 * 1000;

/** Extract GitHub repository URL from a text. */
function extractGithubUrl(text: string): string | null {
  if (!text) return null;
  const match = text.match(/https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)/i);
  if (match) {
    let url = match[0];
    if (url.endsWith(".") || url.endsWith(",") || url.endsWith(")")) {
      url = url.slice(0, -1);
    }
    return url;
  }
  return null;
}

/** Match local high-quality SVGs based on title. */
function getMatchingThumbnail(title: string): string | null {
  const t = title.toLowerCase();
  if (t.includes("attention") || t.includes("transformer")) return "/thumbnails/attention.svg";
  if (t.includes("llama")) return "/thumbnails/llama.svg";
  if (t.includes("gpt-4") || t.includes("gpt 4")) return "/thumbnails/gpt4.svg";
  if (t.includes("gpt-3") || t.includes("gpt 3")) return "/thumbnails/gpt3.svg";
  if (t.includes("flan-t5") || t.includes("flant5")) return "/thumbnails/flant5.svg";
  if (t.includes("t5")) return "/thumbnails/t5.svg";
  if (t.includes("bert")) return "/thumbnails/bert.svg";
  if (t.includes("roberta")) return "/thumbnails/roberta.svg";
  if (t.includes("opt-") || t.includes(" opt ")) return "/thumbnails/opt.svg";
  if (t.includes("palm")) return "/thumbnails/palm.svg";
  return null;
}

/** Fetch citation count from OpenAlex (with Semantic Scholar fallback). */
async function getRealCitations(arxivId: string, title: string): Promise<number> {
  const cacheKey = arxivId || title;
  if (!cacheKey) return 0;
  const cached = citationCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CITATION_TTL) {
    return cached.count;
  }

  // 1. Try OpenAlex API (Free, no key required, highly reliable)
  try {
    let url = "";
    if (arxivId) {
      const cleanId = arxivId.split("v")[0];
      url = `https://api.openalex.org/works/https://arxiv.org/abs/${cleanId}`;
    } else {
      url = `https://api.openalex.org/works?filter=title.search:${encodeURIComponent(title)}&limit=1`;
    }

    const res = await fetch(url, {
      headers: { "User-Agent": "FrontierPaperExplorer/1.0 (mailto:burla.ankit.dev@gmail.com)" },
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      let count = 0;
      if (arxivId) {
        count = data.cited_by_count ?? 0;
      } else if (data.results && data.results[0]) {
        count = data.results[0].cited_by_count ?? 0;
      }
      citationCache.set(cacheKey, { count, ts: Date.now() });
      return count;
    }
  } catch (err) {
    console.error(`OpenAlex citation fetch failed for ${cacheKey}:`, err);
  }

  // 2. Fallback to Semantic Scholar API
  try {
    if (arxivId) {
      const cleanId = arxivId.split("v")[0];
      const ssUrl = `https://api.semanticscholar.org/graph/v1/paper/arXiv:${cleanId}?fields=citationCount`;
      const res = await fetch(ssUrl, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        const count = data.citationCount ?? 0;
        citationCache.set(cacheKey, { count, ts: Date.now() });
        return count;
      }
    }
  } catch (err) {
    console.error(`Semantic Scholar citation fetch failed for ${cacheKey}:`, err);
  }

  return 0;
}

/** Fetch GitHub repository statistics (stars, forks, issues). */
async function fetchGitHubStats(url: string) {
  if (!url) return { stars: 0, forks: 0, issues: 0 };
  const cached = githubCache.get(url);
  const now = Date.now();
  if (cached && now - cached.ts < GITHUB_TTL) return cached.data;

  try {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/i);
    if (!match) return { stars: 0, forks: 0, issues: 0 };
    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, "");
    const apiUrl = `https://api.github.com/repos/${owner}/${cleanRepo}`;
    const headers: Record<string, string> = {
      "User-Agent": "FrontierPaperExplorer/1.0",
    };
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(apiUrl, {
      headers,
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`GitHub fetch failed ${res.status}`);
    const data = await res.json();
    const result = {
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
      issues: data.open_issues_count ?? 0,
    };
    githubCache.set(url, { data: result, ts: now });
    return result;
  } catch (e) {
    console.error("GitHub stats error", e);
    return { stars: 0, forks: 0, issues: 0 };
  }
}

/** Helper to tag papers with method categories based on keywords. */
function tagPaperMethods(paper: any): any {
  const text = `${paper.title || ""} ${paper.abstract || ""}`.toLowerCase();
  const methods = new Set<string>();
  const tags = new Set<string>(paper.tags || []);

  const map: Record<string, string> = {
    attention: "Attention",
    transformer: "Attention",
    query: "Attention",
    "self-attention": "Attention",
    architecture: "Architecture",
    network: "Architecture",
    mlp: "Architecture",
    cnn: "Architecture",
    rnn: "Architecture",
    optimize: "Optimization",
    optimization: "Optimization",
    adam: "Optimization",
    sgd: "Optimization",
    gradient: "Optimization",
    train: "Training",
    pretrain: "Training",
    finetun: "Training",
    supervis: "Training",
    embedding: "Embedding",
    vector: "Embedding",
    representation: "Embedding",
    regulariz: "Regularization",
    dropout: "Regularization",
    "weight decay": "Regularization",
    diffusion: "Diffusion",
    denois: "Diffusion",
    "stable diffusion": "Diffusion",
    gan: "Diffusion",
    vision: "Vision",
    image: "Vision",
    segment: "Vision",
    "object detect": "Vision",
    pixel: "Vision",
    llm: "LLM",
    "large language model": "LLM",
    gpt: "LLM",
    llama: "LLM",
    prompt: "LLM",
    agent: "Agents",
    autonomous: "Agents",
    "multi-agent": "Agents",
    reasoning: "Reasoning",
    cot: "Reasoning",
    "chain of thought": "Reasoning",
    logic: "Reasoning",
    robot: "Robotics",
    manipulation: "Robotics",
    control: "Robotics",
    locomotion: "Robotics",
    reinforcement: "Reinforcement Learning",
    rl: "Reinforcement Learning",
    ppo: "Reinforcement Learning",
    "q-learning": "Reinforcement Learning",
    reward: "Reinforcement Learning",
    audio: "Audio",
    speech: "Audio",
    voice: "Audio",
    sound: "Audio",
    video: "Video",
    temporal: "Video",
    frame: "Video",
    multimodal: "Multimodal",
    "vision-language": "Multimodal",
    vlm: "Multimodal",
    "text-to-image": "Multimodal",
  };

  for (const [kw, method] of Object.entries(map)) {
    if (text.includes(kw)) methods.add(method);
  }

  if (methods.size === 0) methods.add("Architecture");
  const methodList = Array.from(methods);
  const category = methodList[0];

  return {
    ...paper,
    category,
    methods: methodList,
    tags: Array.from(new Set([...methodList, ...Array.from(tags)])).slice(0, 4),
  };
}

/** Parse arXiv XML. */
function parseArxivXml(xml: string): any[] {
  const entries: any[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const content = match[1];
    const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(content);
    const title = titleMatch ? titleMatch[1].trim().replace(/\n\s*/g, " ") : "";
    const idMatch = /<id>http:\/\/arxiv\.org\/abs\/([^<]+)<\/id>/.exec(content);
    const arxivId = idMatch ? idMatch[1].trim() : "";
    const summaryMatch = /<summary>([\s\S]*?)<\/summary>/.exec(content);
    const abstract = summaryMatch ? summaryMatch[1].trim().replace(/\n\s*/g, " ") : "";
    const publishedMatch = /<published>([^<]+)<\/published>/.exec(content);
    const published = publishedMatch ? publishedMatch[1].trim() : "";
    const authorRegex = /<author>\s*<name>([\s\S]*?)<\/name>\s*<\/author>/g;
    const authors: string[] = [];
    let authorMatch;
    while ((authorMatch = authorRegex.exec(content)) !== null) {
      authors.push(authorMatch[1].trim());
    }
    const pdfUrl = arxivId ? `https://arxiv.org/pdf/${arxivId}.pdf` : "";
    const year = published ? new Date(published).getFullYear() : null;
    
    // Extract real GitHub URL from abstract if present
    const githubUrl = extractGithubUrl(abstract);

    // Dynamic local SVG thumbnail based on title
    const thumbnail = getMatchingThumbnail(title);

    entries.push({
      id: `arxiv_${arxivId.replace(/\//g, "_")}`,
      arxiv_id: arxivId,
      source: "arXiv",
      title,
      authors: authors.join(", "),
      abstract,
      publication_date: published ? new Date(published).toISOString() : null,
      year,
      categories: ["AI", "Machine Learning"],
      methods: [],
      tasks: [],
      keywords: [],
      thumbnail,
      pdf_url: pdfUrl,
      paper_url: arxivId ? `https://arxiv.org/abs/${arxivId}` : null,
      github_url: githubUrl,
      project_url: arxivId ? `https://arxiv.org/abs/${arxivId}` : null,
      citations: 0,
      github_stars: 0,
      stars_per_hour: 0,
      benchmarks: [],
      sota: null,
      tags: ["arXiv"],
    });
  }
  return entries;
}

/** Parse Hugging Face daily papers. */
function parseHfPapers(data: any[]): any[] {
  return (data || []).map((p) => {
    const arxivId = p.id || "";
    const title = p.title || p.paper?.title || "";
    const authors = (p.paper?.authors || []).map((a: any) => a.name).join(", ");
    const abstract = p.paper?.summary || "";
    const published = p.publishedAt || "";
    const year = published ? new Date(published).getFullYear() : null;

    // Use real github url provided by HF or extract from abstract
    const githubUrl = p.paper?.githubUrl || extractGithubUrl(abstract) || null;

    // Dynamic local SVG thumbnail based on title
    const thumbnail = getMatchingThumbnail(title);

    return {
      id: `hf_${arxivId.replace(/\//g, "_")}`,
      arxiv_id: arxivId,
      source: "Hugging Face",
      title,
      authors,
      abstract,
      publication_date: published ? new Date(published).toISOString() : null,
      year,
      categories: ["AI", "Trending"],
      methods: [],
      tasks: [],
      keywords: [],
      thumbnail,
      pdf_url: arxivId ? `https://arxiv.org/pdf/${arxivId}.pdf` : null,
      paper_url: arxivId ? `https://huggingface.co/papers/${arxivId}` : null,
      github_url: githubUrl,
      project_url: arxivId ? `https://arxiv.org/abs/${arxivId}` : null,
      citations: 0,
      github_stars: 0,
      stars_per_hour: 0,
      benchmarks: [],
      sota: null,
      tags: ["Hugging Face", "Daily Papers"],
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const methodParam = searchParams.get("method");
    const sortParam = searchParams.get("sort");
    const searchParam = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const refresh = searchParams.get("refresh") === "1";

    // Refresh cache if requested or TTL expired
    if (refresh || !cachedPapersPool || Date.now() - lastCacheUpdateTime > CACHE_TTL_MS) {
      const pool: any[] = [];

      // 1. Fetch from arXiv
      try {
        const start = (page - 1) * limit;
        const arxivUrl = `http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CV+OR+cat:cs.CL+OR+cat:cs.RO&start=${start}&max_results=${limit}&sortBy=submittedDate&sortOrder=descending`;
        const res = await fetch(arxivUrl, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const txt = await res.text();
          pool.push(...parseArxivXml(txt));
        } else {
          console.error("arXiv API returned non-OK status:", res.status);
        }
      } catch (e) {
        console.error("arXiv fetch error:", e);
      }

      // 2. Fetch from Hugging Face
      try {
        const hfUrl = `https://huggingface.co/api/daily_papers?page=${page}`;
        const res = await fetch(hfUrl, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const data = await res.json();
          pool.push(...parseHfPapers(data));
        } else {
          console.error("Hugging Face API returned non-OK status:", res.status);
        }
      } catch (e) {
        console.error("HF fetch error:", e);
      }

      const tagged = pool.map(tagPaperMethods);
      const deduped = deduplicatePapers(tagged);
      cachedPapersPool = deduped;
      lastCacheUpdateTime = Date.now();
    }

    // Work on cached pool (already deduped & tagged)
    let papersList = cachedPapersPool || [];

    // ---- FILTERING ----
    if (methodParam) {
      const target = methodParam.toLowerCase();
      papersList = papersList.filter((p: any) => {
        return (
          (p.category || "").toLowerCase() === target ||
          (p.tags || []).some((t: string) => t.toLowerCase() === target) ||
          (p.methods || []).some((m: string) => m.toLowerCase() === target) ||
          (p.keywords || []).some((k: string) => k.toLowerCase() === target)
        );
      });
    }

    // ---- SEARCH ----
    if (searchParam) {
      const q = searchParam.toLowerCase();
      papersList = papersList.filter((p: any) => {
        return (
          (p.title || "").toLowerCase().includes(q) ||
          (p.authors || "").toLowerCase().includes(q) ||
          (p.abstract || "").toLowerCase().includes(q) ||
          (p.tags || []).some((t: string) => t.toLowerCase().includes(q)) ||
          (p.methods || []).some((m: string) => m.toLowerCase().includes(q))
        );
      });
    }

    // ---- SORTING ----
    if (sortParam) {
      const s = sortParam.toLowerCase();
      if (s === "popular" || s === "citations" || s === "most cited") {
        // We'll sort after fetching citation counts, but do a rough sort here as well
        papersList = [...papersList].sort((a, b) => (b.citations ?? 0) - (a.citations ?? 0));
      } else if (s === "newest" || s === "latest") {
        papersList = [...papersList].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
      } else if (s === "github stars" || s === "github_stars") {
        papersList = [...papersList].sort((a, b) => (b.github_stars ?? 0) - (a.github_stars ?? 0));
      }
    }

    // ---- PAGINATION ----
    const totalCount = papersList.length;
    const startIdx = (page - 1) * limit;
    const result = papersList.slice(startIdx, startIdx + limit);

    // ---- ENRICH with real citations & GitHub stats (blocking but parallelized for the current page only) ----
    await Promise.all(
      result.map(async (p: any) => {
        // 1. Get real citation count
        p.citations = await getRealCitations(p.arxiv_id, p.title);

        // 2. Get real GitHub stats if github_url exists
        if (p.github_url) {
          const stats = await fetchGitHubStats(p.github_url);
          p.github_stars = stats.stars ?? 0;
          p.github_forks = stats.forks ?? 0;
          p.github_issues = stats.issues ?? 0;
        } else {
          p.github_stars = 0;
          p.github_forks = 0;
          p.github_issues = 0;
        }
      })
    );

    // If sorting by popularity or stars, re-sort the enriched page results to ensure correct order
    if (sortParam) {
      const s = sortParam.toLowerCase();
      if (s === "popular" || s === "citations" || s === "most cited") {
        result.sort((a, b) => (b.citations ?? 0) - (a.citations ?? 0));
      } else if (s === "github stars" || s === "github_stars") {
        result.sort((a, b) => (b.github_stars ?? 0) - (a.github_stars ?? 0));
      }
    }

    return NextResponse.json(result, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-Total-Count": totalCount.toString(),
      },
    });
  } catch (error: any) {
    console.error("GET /api/papers error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
