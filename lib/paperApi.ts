export interface Paper {
  id: string;
  title: string;
  authors: string;
  abstract?: string;
  publication_date?: string;
  year?: number;
  category?: string;
  methods?: string[];
  keywords?: string[];
  tags?: string[];
  pdf_url?: string;
  github_url?: string;
  citations?: number;
  github_stars?: number;
  github_forks?: number;
  github_issues?: number;
  // Additional optional fields preserved for compatibility
  [key: string]: any;
}

/**
 * Simple wrapper around the backend /api/papers endpoint.
 * The backend now performs all filtering, sorting, pagination and provides real metadata.
 * This client merely forwards the query parameters and returns the JSON payload.
 */
export async function getPapers(
  method?: string,
  page: number = 1,
  limit: number = 50,
  sort?: string,
  search?: string,
  refresh?: boolean
): Promise<Paper[]> {
  let url = "/api/papers?";
  if (method) url += `method=${encodeURIComponent(method)}&`;
  if (page) url += `page=${page}&`;
  if (limit) url += `limit=${limit}&`;
  if (sort) url += `sort=${encodeURIComponent(sort)}&`;
  if (search) url += `search=${encodeURIComponent(search)}&`;
  if (refresh) url += `refresh=1&`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch papers from API");
  const data = await res.json();
  return data as Paper[];
}
