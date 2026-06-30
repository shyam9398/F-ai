export interface Paper {
  id: number;
  title: string;
  authors: string;
  description: string;
  date: string;
  sota: string;
  tags: string[];
  additionalTags: string[];
  thumbnail: string;
  upvotes: string;
  repo: string;
  citations: number;
  // Extra fields to support front-end search/filtering/sorting
  year: number;
  category: string;
  keywords: string[];
  research_area: string;
  subject: string;
  // Additional fields for PaperDetails compatibility
  abstract: string;
  thumbnail_url: string;
  pdf_url: string;
  github_url: string;
  pages: number;
  file_size: string;
  doi: string;
  models_used: string;
  datasets_used: string;
  framework: string;
  language: string;
  tasks: string[];
  // Citation, bibliography, & performance fields
  conference: string;
  journal: string;
  project_url: string;
  publication_date: string;
  reading_time: string;
  methods: string[];
  benchmarks: string[];
  results: string[];
}

export function mapToAnkitPaper(p: any): Paper {
  const citationsVal = typeof p.citations === "number" ? p.citations : parseInt(p.citations) || 0;
  
  // Format repo name / star count from github_url
  let repoName = "N/A";
  if (p.github_url) {
    if (p.usage !== undefined && p.usage !== 0) {
      repoName = String(p.usage);
    } else {
      repoName = "0";
    }
  }

  // Format sota from benchmarks/results
  let sotaVal = "";
  if (p.sota) {
    sotaVal = p.sota;
  } else if (p.benchmarks && p.results && p.benchmarks.length > 0) {
    sotaVal = p.benchmarks
      .map((b: string, i: number) => {
        const res = p.results[i] ? ` (${p.results[i]})` : "";
        return `SOTA on ${b}${res}`;
      })
      .join(" • ");
  }

  return {
    id: p.id,
    title: p.title || "",
    authors: p.authors || "",
    description: p.abstract || p.description || "",
    date: p.publication_date || p.date || String(p.year || ""),
    sota: sotaVal,
    tags: p.tags || [],
    additionalTags: p.methods || p.additionalTags || [],
    thumbnail: p.thumbnail_url || p.thumbnail || "",
    upvotes: citationsVal.toString(),
    repo: repoName,
    citations: citationsVal,
    // Add extra properties for search/sort
    year: p.year || 2026,
    category: p.category || "",
    keywords: p.keywords || [],
    research_area: p.research_area || "",
    subject: p.subject || "",
    // Additional fields for compatibility
    abstract: p.abstract || p.description || "",
    thumbnail_url: p.thumbnail_url || p.thumbnail || "",
    pdf_url: p.pdf_url || "",
    github_url: p.github_url || "",
    pages: p.pages || 0,
    file_size: p.file_size || "",
    doi: p.doi || "",
    models_used: p.models_used || "",
    datasets_used: p.datasets_used || "",
    framework: p.framework || "",
    language: p.language || "",
    tasks: p.tasks || [],
    conference: p.conference || "",
    journal: p.journal || "",
    project_url: p.project_url || "",
    publication_date: p.publication_date || "",
    reading_time: p.reading_time || "",
    methods: p.methods || [],
    benchmarks: p.benchmarks || [],
    results: p.results || [],
  };
}

export async function getPapers(method?: string, page?: number, limit?: number): Promise<Paper[]> {
  let url = "/api/papers?";
  if (method) url += `method=${encodeURIComponent(method)}&`;
  if (page) url += `page=${page}&`;
  if (limit) url += `limit=${limit}&`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch papers from API");
  const data = await res.json();
  return data.map(mapToAnkitPaper);
}
