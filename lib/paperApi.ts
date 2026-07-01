export interface Paper {
  id: string;
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
  const starsVal = p.github_stars !== undefined && p.github_stars !== null ? parseInt(p.github_stars) : 0;
  const forksVal = p.github_forks !== undefined && p.github_forks !== null ? parseInt(p.github_forks) : 0;
  const citationsVal = p.citation_count !== undefined && p.citation_count !== null ? parseInt(p.citation_count) : 0;
  
  // Format repo name / star count from github_url / github_forks
  let repoName = String(forksVal);

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

  // Format publication date string
  let dateVal = "";
  if (p.publication_date) {
    try {
      dateVal = new Date(p.publication_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      dateVal = String(p.publication_date);
    }
  } else {
    dateVal = String(p.year || "");
  }

  // Map database array columns to front-end string fields where required
  const modelsStr = Array.isArray(p.models)
    ? p.models.join(", ")
    : p.models_used || "";
  const datasetsStr = Array.isArray(p.datasets)
    ? p.datasets.join(", ")
    : p.datasets_used || "";

  return {
    id: String(p.id),
    title: p.title || "",
    authors: p.authors || "",
    description: p.abstract || p.description || "",
    date: dateVal,
    sota: sotaVal,
    tags: p.tags || [],
    additionalTags: p.methods || p.additionalTags || [],
    thumbnail: p.thumbnail_url || p.thumbnail || "",
    upvotes: starsVal.toString(),
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
    models_used: modelsStr,
    datasets_used: datasetsStr,
    framework: p.framework || "",
    language: p.language || "",
    tasks: p.tasks || [],
    conference: p.conference || "",
    journal: p.journal || "",
    project_url: p.project_url || "",
    publication_date: dateVal,
    reading_time: p.reading_time || "",
    methods: p.methods || [],
    benchmarks: p.benchmarks || [],
    results: p.results || [],
  };
}

/**
 * Fetch papers from our database-backed endpoint.
 */
export async function getPapers(
  method?: string,
  page: number = 1,
  limit: number = 50,
  sort?: string,
  search?: string,
  ids?: string[],
  task?: string
): Promise<{ 
  papers: Paper[]; 
  totalCount: number; 
  totalPapersCount: number;
  methods: { name: string; slug: string; paper_count: number }[] 
}> {
  let url = "/api/papers?";
  if (method) url += `method=${encodeURIComponent(method)}&`;
  if (page) url += `page=${page}&`;
  if (limit) url += `limit=${limit}&`;
  if (sort) url += `sort=${encodeURIComponent(sort)}&`;
  if (search) url += `search=${encodeURIComponent(search)}&`;
  if (ids && ids.length > 0) url += `ids=${encodeURIComponent(ids.join(","))}&`;
  if (task) url += `task=${encodeURIComponent(task)}&`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch papers from API");
  const data = await res.json();
  
  const papersArray = Array.isArray(data.papers) ? data.papers : [];
  const totalCount = typeof data.totalCount === "number" ? data.totalCount : papersArray.length;
  const totalPapersCount = typeof data.totalPapersCount === "number" ? data.totalPapersCount : totalCount;
  const methodsArray = Array.isArray(data.methods) ? data.methods : [];

  return {
    papers: papersArray.map(mapToAnkitPaper),
    totalCount,
    totalPapersCount,
    methods: methodsArray,
  };
}

/**
 * Fetch a single paper's full details and related papers from the database.
 */
export async function getPaperDetails(id: string): Promise<{ paper: Paper; relatedPapers: Paper[] }> {
  const res = await fetch(`/api/papers/${id}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Paper not found: ${id}`);
    }
    throw new Error("Failed to fetch paper details");
  }
  const data = await res.json();
  return {
    paper: mapToAnkitPaper(data.paper),
    relatedPapers: (data.relatedPapers || []).map(mapToAnkitPaper),
  };
}
