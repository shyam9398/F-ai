import { pool, checkDbStatus } from "./db";

export class PaperRepository {
  /**
   * Fetch papers from the database with dynamic filters, sorting, search, and pagination.
   */
  static async getPapers(params: {
    category?: string;
    sort?: string;
    search?: string;
    page?: number;
    limit?: number;
    researchArea?: string;
    task?: string;
    method?: string;
    dataset?: string;
    model?: string;
    conference?: string;
    year?: number;
    ids?: string[];
  }): Promise<{ papers: any[]; totalCount: number }> {
    await checkDbStatus();

    const {
      category,
      sort,
      search,
      page = 1,
      limit = 50,
      researchArea,
      task,
      method,
      dataset,
      model,
      conference,
      year,
      ids,
    } = params;

    const conditions: string[] = [];
    const values: any[] = [];

    // Helper to add a condition with proper $1, $2 placeholder indexing
    const addCondition = (clause: string, ...vals: any[]) => {
      let finalClause = clause;
      for (const val of vals) {
        values.push(val);
        finalClause = finalClause.replace("?", `$${values.length}`);
      }
      conditions.push(finalClause);
    };

    // Filter by specific IDs
    if (ids && ids.length > 0) {
      addCondition("p.id = ANY(?)", ids);
    } else if (ids && ids.length === 0) {
      return { papers: [], totalCount: 0 };
    }

    // Category filter: checks if category matches task name/slug or method name/slug
    if (category && category !== "All Methods") {
      addCondition(
        `(EXISTS (SELECT 1 FROM paper_tasks pt JOIN tasks t ON pt.task_id = t.id WHERE pt.paper_id = p.id AND (t.name = ? OR t.slug = ?)) OR 
          EXISTS (SELECT 1 FROM paper_methods pm JOIN methods m ON pm.method_id = m.id WHERE pm.paper_id = p.id AND (m.name = ? OR m.slug = ?)))`,
        category,
        category.toLowerCase().replace(/\s+/g, "-"),
        category,
        category.toLowerCase().replace(/\s+/g, "-")
      );
    }

    if (researchArea) {
      addCondition(
        `EXISTS (SELECT 1 FROM paper_tasks pt JOIN tasks t ON pt.task_id = t.id WHERE pt.paper_id = p.id AND (t.name = ? OR t.slug = ?))`,
        researchArea,
        researchArea.toLowerCase().replace(/\s+/g, "-")
      );
    }

    if (task) {
      addCondition(
        `EXISTS (SELECT 1 FROM paper_tasks pt JOIN tasks t ON pt.task_id = t.id WHERE pt.paper_id = p.id AND (t.name = ? OR t.slug = ?))`,
        task,
        task.toLowerCase().replace(/\s+/g, "-")
      );
    }

    if (method) {
      addCondition(
        `EXISTS (SELECT 1 FROM paper_methods pm JOIN methods m ON pm.method_id = m.id WHERE pm.paper_id = p.id AND (m.name = ? OR m.slug = ?))`,
        method,
        method.toLowerCase().replace(/\s+/g, "-")
      );
    }

    if (dataset) {
      addCondition(
        `EXISTS (SELECT 1 FROM paper_datasets pd JOIN datasets d ON pd.dataset_id = d.id WHERE pd.paper_id = p.id AND (d.name = ? OR d.slug = ?))`,
        dataset,
        dataset.toLowerCase().replace(/\s+/g, "-")
      );
    }

    if (model) {
      addCondition(
        `EXISTS (SELECT 1 FROM paper_models pm JOIN models mo ON pm.model_id = mo.id WHERE pm.paper_id = p.id AND (mo.name = ? OR mo.slug = ?))`,
        model,
        model.toLowerCase().replace(/\s+/g, "-")
      );
    }

    if (conference) {
      addCondition(
        `EXISTS (SELECT 1 FROM paper_conferences pc JOIN conferences c ON pc.conference_id = c.id WHERE pc.paper_id = p.id AND (c.name = ? OR c.slug = ?))`,
        conference,
        conference.toLowerCase().replace(/\s+/g, "-")
      );
    }

    if (year) {
      addCondition("EXTRACT(YEAR FROM p.publication_date)::integer = ?", year);
    }

    if (search) {
      const searchPattern = `%${search}%`;
      addCondition(
        `(p.title ILIKE ? OR 
          p.abstract ILIKE ? OR 
          EXISTS (SELECT 1 FROM paper_authors pa JOIN authors a ON pa.author_id = a.id WHERE pa.paper_id = p.id AND a.name ILIKE ?) OR
          EXISTS (SELECT 1 FROM paper_tasks pt JOIN tasks t ON pt.task_id = t.id WHERE pt.paper_id = p.id AND t.name ILIKE ?) OR
          EXISTS (SELECT 1 FROM paper_methods pm JOIN methods m ON pm.method_id = m.id WHERE pm.paper_id = p.id AND m.name ILIKE ?) OR
          EXISTS (SELECT 1 FROM paper_datasets pd JOIN datasets d ON pd.dataset_id = d.id WHERE pd.paper_id = p.id AND d.name ILIKE ?) OR
          EXISTS (SELECT 1 FROM paper_models pm JOIN models mo ON pm.model_id = mo.id WHERE pm.paper_id = p.id AND mo.name ILIKE ?) OR
          EXISTS (SELECT 1 FROM paper_conferences pc JOIN conferences c ON pc.conference_id = c.id WHERE pc.paper_id = p.id AND c.name ILIKE ?))`,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern
      );
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count query
    const countQuery = `SELECT COUNT(*) FROM papers p ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    // Sorting
    let orderBy = "ORDER BY p.publication_date DESC, p.id DESC";
    if (sort) {
      const s = sort.toLowerCase();
      if (s === "popular" || s === "citations" || s === "most cited") {
        orderBy = "ORDER BY p.citation_count DESC, p.publication_date DESC";
      } else if (s === "newest" || s === "latest") {
        orderBy = "ORDER BY p.publication_date DESC, p.id DESC";
      } else if (s === "trending") {
        orderBy = "ORDER BY p.trending_score DESC, p.github_stars DESC";
      }
    }

    // Pagination
    const offset = (page - 1) * limit;
    const limitIndex = values.length + 1;
    const offsetIndex = values.length + 2;

    const query = `
      SELECT p.*,
        p.citation_count AS citations,
        p.thumbnail_url AS thumbnail,
        COALESCE((SELECT string_agg(a.name, ', ') FROM paper_authors pa JOIN authors a ON pa.author_id = a.id WHERE pa.paper_id = p.id), '') AS authors,
        COALESCE((SELECT array_agg(t.name) FROM paper_tasks pt JOIN tasks t ON pt.task_id = t.id WHERE pt.paper_id = p.id), '{}') AS tasks,
        COALESCE((SELECT array_agg(t.name) FROM paper_tasks pt JOIN tasks t ON pt.task_id = t.id WHERE pt.paper_id = p.id), '{}') AS tags,
        COALESCE((SELECT array_agg(m.name) FROM paper_methods pm JOIN methods m ON pm.method_id = m.id WHERE pm.paper_id = p.id), '{}') AS methods,
        COALESCE((SELECT array_agg(m.name) FROM paper_methods pm JOIN methods m ON pm.method_id = m.id WHERE pm.paper_id = p.id), '{}') AS "additionalTags",
        COALESCE((SELECT array_agg(d.name) FROM paper_datasets pd JOIN datasets d ON pd.dataset_id = d.id WHERE pd.paper_id = p.id), '{}') AS datasets,
        COALESCE((SELECT array_agg(mo.name) FROM paper_models pm JOIN models mo ON pm.model_id = mo.id WHERE pm.paper_id = p.id), '{}') AS models,
        EXTRACT(YEAR FROM p.publication_date)::integer AS year
      FROM papers p
      ${whereClause}
      ${orderBy}
      LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `;

    const queryValues = [...values, limit, offset];
    const result = await pool.query(query, queryValues);

    return {
      papers: result.rows,
      totalCount,
    };
  }

  /**
   * Retrieve a single paper by its ID.
   */
  static async getPaperById(id: string): Promise<any | null> {
    await checkDbStatus();
    const query = `
      SELECT p.*,
        p.citation_count AS citations,
        p.thumbnail_url AS thumbnail,
        COALESCE((SELECT string_agg(a.name, ', ') FROM paper_authors pa JOIN authors a ON pa.author_id = a.id WHERE pa.paper_id = p.id), '') AS authors,
        COALESCE((SELECT array_agg(t.name) FROM paper_tasks pt JOIN tasks t ON pt.task_id = t.id WHERE pt.paper_id = p.id), '{}') AS tasks,
        COALESCE((SELECT array_agg(t.name) FROM paper_tasks pt JOIN tasks t ON pt.task_id = t.id WHERE pt.paper_id = p.id), '{}') AS tags,
        COALESCE((SELECT array_agg(m.name) FROM paper_methods pm JOIN methods m ON pm.method_id = m.id WHERE pm.paper_id = p.id), '{}') AS methods,
        COALESCE((SELECT array_agg(m.name) FROM paper_methods pm JOIN methods m ON pm.method_id = m.id WHERE pm.paper_id = p.id), '{}') AS "additionalTags",
        COALESCE((SELECT array_agg(d.name) FROM paper_datasets pd JOIN datasets d ON pd.dataset_id = d.id WHERE pd.paper_id = p.id), '{}') AS datasets,
        COALESCE((SELECT array_agg(mo.name) FROM paper_models pm JOIN models mo ON pm.model_id = mo.id WHERE pm.paper_id = p.id), '{}') AS models,
        EXTRACT(YEAR FROM p.publication_date)::integer AS year
      FROM papers p
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Dynamically fetch related papers based on similarity score:
   * Match research area, category, datasets, tasks, and methods.
   */
  static async getRelatedPapers(paper: any): Promise<any[]> {
    await checkDbStatus();
    const query = `
      SELECT p.*,
        p.citation_count AS citations,
        p.thumbnail_url AS thumbnail,
        COALESCE((SELECT string_agg(a.name, ', ') FROM paper_authors pa JOIN authors a ON pa.author_id = a.id WHERE pa.paper_id = p.id), '') AS authors,
        COALESCE((SELECT array_agg(t.name) FROM paper_tasks pt JOIN tasks t ON pt.task_id = t.id WHERE pt.paper_id = p.id), '{}') AS tasks,
        COALESCE((SELECT array_agg(t.name) FROM paper_tasks pt JOIN tasks t ON pt.task_id = t.id WHERE pt.paper_id = p.id), '{}') AS tags,
        COALESCE((SELECT array_agg(m.name) FROM paper_methods pm JOIN methods m ON pm.method_id = m.id WHERE pm.paper_id = p.id), '{}') AS methods,
        COALESCE((SELECT array_agg(m.name) FROM paper_methods pm JOIN methods m ON pm.method_id = m.id WHERE pm.paper_id = p.id), '{}') AS "additionalTags",
        COALESCE((SELECT array_agg(d.name) FROM paper_datasets pd JOIN datasets d ON pd.dataset_id = d.id WHERE pd.paper_id = p.id), '{}') AS datasets,
        COALESCE((SELECT array_agg(mo.name) FROM paper_models pm JOIN models mo ON pm.model_id = mo.id WHERE pm.paper_id = p.id), '{}') AS models,
        EXTRACT(YEAR FROM p.publication_date)::integer AS year,
        
        (SELECT COUNT(*) FROM paper_tasks pt1 JOIN paper_tasks pt2 ON pt1.task_id = pt2.task_id WHERE pt1.paper_id = p.id AND pt2.paper_id = $1) * 2 +
        (SELECT COUNT(*) FROM paper_methods pm1 JOIN paper_methods pm2 ON pm1.method_id = pm2.method_id WHERE pm1.paper_id = p.id AND pm2.paper_id = $1) * 1 +
        (SELECT COUNT(*) FROM paper_datasets pd1 JOIN paper_datasets pd2 ON pd1.dataset_id = pd2.dataset_id WHERE pd1.paper_id = p.id AND pd2.paper_id = $1) * 2 +
        (SELECT COUNT(*) FROM paper_models pm1 JOIN paper_models pm2 ON pm1.model_id = pm2.model_id WHERE pm1.paper_id = p.id AND pm2.paper_id = $1) * 1 AS similarity
      FROM papers p
      WHERE p.id <> $1 AND (
        EXISTS (SELECT 1 FROM paper_tasks pt1 JOIN paper_tasks pt2 ON pt1.task_id = pt2.task_id WHERE pt1.paper_id = p.id AND pt2.paper_id = $1) OR
        EXISTS (SELECT 1 FROM paper_methods pm1 JOIN paper_methods pm2 ON pm1.method_id = pm2.method_id WHERE pm1.paper_id = p.id AND pm2.paper_id = $1) OR
        EXISTS (SELECT 1 FROM paper_datasets pd1 JOIN paper_datasets pd2 ON pd1.dataset_id = pd2.dataset_id WHERE pd1.paper_id = p.id AND pd2.paper_id = $1) OR
        EXISTS (SELECT 1 FROM paper_models pm1 JOIN paper_models pm2 ON pm1.model_id = pm2.model_id WHERE pm1.paper_id = p.id AND pm2.paper_id = $1)
      )
      ORDER BY similarity DESC, p.citation_count DESC
      LIMIT 6
    `;
    const result = await pool.query(query, [paper.id]);
    return result.rows;
  }
}
