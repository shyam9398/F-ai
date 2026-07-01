const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Load DATABASE_URL from .env
const envContent = fs.readFileSync(path.join(__dirname, "../.env"), "utf8");
const databaseUrlMatch = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)/);
const databaseUrl = databaseUrlMatch ? databaseUrlMatch[1] : null;

if (!databaseUrl) {
  console.error("DATABASE_URL not found in .env");
  process.exit(1);
}

const methodsList = [
  { name: 'Transformer', slug: 'transformer', keywords: ['transformer'] },
  { name: 'Attention', slug: 'attention', keywords: ['attention'] },
  { name: 'Architecture', slug: 'architecture', keywords: ['architecture', 'network design', 'encoder-decoder', 'framework'] },
  { name: 'Optimization', slug: 'optimization', keywords: ['optimization', 'adam', 'sgd', 'optimizer', 'gradient descent', 'loss function'] },
  { name: 'Training', slug: 'training', keywords: ['training', 'pre-train', 'pretrain', 'fine-tune', 'finetune', 'epoch'] },
  { name: 'Regularization', slug: 'regularization', keywords: ['regularization', 'dropout', 'weight decay', 'normalization'] },
  { name: 'Embedding', slug: 'embedding', keywords: ['embedding', 'vector representation', 'dense vector'] },
  { name: 'Diffusion', slug: 'diffusion', keywords: ['diffusion', 'denoising', 'score-based'] },
  { name: 'CNN', slug: 'cnn', keywords: ['cnn', 'convolutional', 'resnet'] },
  { name: 'RNN', slug: 'rnn', keywords: ['rnn', 'lstm', 'gru', 'recurrent'] },
  { name: 'Vision Transformer', slug: 'vision-transformer', keywords: ['vision transformer', 'vit'] },
  { name: 'Graph Neural Network', slug: 'graph-neural-network', keywords: ['graph neural network', 'gnn', 'graph convolution'] },
  { name: 'LoRA', slug: 'lora', keywords: ['lora', 'low-rank adaptation'] },
  { name: 'Prompt Engineering', slug: 'prompt-engineering', keywords: ['prompt', 'prompting', 'in-context learning'] },
  { name: 'Reinforcement Learning', slug: 'reinforcement-learning', keywords: ['reinforcement learning', 'policy gradient', 'rlhf', 'ppo'] },
  { name: 'Self-Supervised Learning', slug: 'self-supervised-learning', keywords: ['self-supervised', 'contrastive learning', 'unsupervised pre-training'] },
  { name: 'Fine-Tuning', slug: 'fine-tuning', keywords: ['fine-tuning', 'instruction tuning', 'parameter-efficient tuning'] },
  { name: 'Knowledge Distillation', slug: 'knowledge-distillation', keywords: ['distillation', 'distill', 'student-teacher'] },
  { name: 'Retrieval-Augmented Generation', slug: 'retrieval-augmented-generation', keywords: ['retrieval-augmented', 'rag', 'retriever-reader'] },
  { name: 'Sparse Attention', slug: 'sparse-attention', keywords: ['sparse attention', 'linear attention'] },
  { name: 'Mixture of Experts', slug: 'mixture-of-experts', keywords: ['mixture of experts', 'moe'] },
];

async function run() {
  console.log("Connecting to PostgreSQL...");
  const pool = new Pool({ connectionString: databaseUrl });
  
  try {
    // 1. Insert/ensure all methods in methodsList exist
    console.log("Seeding methods table...");
    const methodIds = {}; // slug -> id
    
    for (const m of methodsList) {
      // Check if it already exists
      const existRes = await pool.query("SELECT id FROM methods WHERE slug = $1;", [m.slug]);
      if (existRes.rows.length > 0) {
        methodIds[m.slug] = existRes.rows[0].id;
      } else {
        const insertRes = await pool.query(
          "INSERT INTO methods (id, name, slug) VALUES (gen_random_uuid(), $1, $2) RETURNING id;",
          [m.name, m.slug]
        );
        methodIds[m.slug] = insertRes.rows[0].id;
        console.log(`Inserted method: ${m.name}`);
      }
    }
    
    // Also include any other existing methods in database
    const dbAllMethods = await pool.query("SELECT id, name, slug FROM methods;");
    const allDbMethods = dbAllMethods.rows;
    console.log(`Loaded ${allDbMethods.length} total methods from database.`);

    // 2. Fetch all papers
    console.log("Fetching all papers from database...");
    const papersRes = await pool.query("SELECT id, title, abstract FROM papers;");
    const papers = papersRes.rows;
    console.log(`Loaded ${papers.length} papers to classify.`);

    // 3. Clear existing relations to perform a complete clean reload
    console.log("Clearing existing paper_methods relations...");
    await pool.query("TRUNCATE TABLE paper_methods;");

    // 4. Generate associations in memory
    console.log("Analyzing papers and generating associations...");
    const associations = []; // array of { paper_id, method_id }
    
    // Fallback methods if no keywords match
    const trainingMethodId = methodIds['training'];
    const architectureMethodId = methodIds['architecture'];
    
    for (const paper of papers) {
      const title = (paper.title || "").toLowerCase();
      const abstract = (paper.abstract || "").toLowerCase();
      
      let matchedSlugs = [];
      
      for (const m of methodsList) {
        const matchesKeyword = m.keywords.some(kw => 
          title.includes(kw) || abstract.includes(kw)
        );
        if (matchesKeyword) {
          matchedSlugs.push(m.slug);
        }
      }
      
      // If zero matches, assign to Training or Architecture randomly/by length
      if (matchedSlugs.length === 0) {
        if (paper.id.charCodeAt(0) % 2 === 0) {
          matchedSlugs.push('training');
        } else {
          matchedSlugs.push('architecture');
        }
      }
      
      // Map to db ids and push
      for (const slug of matchedSlugs) {
        const mId = methodIds[slug];
        if (mId) {
          associations.push({
            paper_id: paper.id,
            method_id: mId
          });
        }
      }
    }
    
    console.log(`Generated ${associations.length} paper-method associations.`);

    // 5. Bulk insert associations in batches of 1000
    console.log("Writing associations to the database...");
    const batchSize = 1000;
    for (let i = 0; i < associations.length; i += batchSize) {
      const batch = associations.slice(i, i + batchSize);
      
      // Build batch insert query
      const valueStrings = [];
      const queryValues = [];
      
      batch.forEach((assoc, idx) => {
        const base = idx * 2;
        valueStrings.push(`($${base + 1}, $${base + 2})`);
        queryValues.push(assoc.paper_id, assoc.method_id);
      });
      
      const batchQuery = `
        INSERT INTO paper_methods (paper_id, method_id) 
        VALUES ${valueStrings.join(", ")}
        ON CONFLICT DO NOTHING;
      `;
      
      await pool.query(batchQuery, queryValues);
      console.log(`Inserted batch ${i / batchSize + 1} (${i + batch.length}/${associations.length})`);
    }

    console.log("=== Methods classification complete ===");
    
    // Print final counts per method
    const countsRes = await pool.query(`
      SELECT m.name, COUNT(*) as count 
      FROM methods m 
      JOIN paper_methods pm ON m.id = pm.method_id 
      GROUP BY m.name 
      ORDER BY count DESC;
    `);
    console.log("=== Final Counts in Database ===");
    console.log(countsRes.rows);

  } catch (err) {
    console.error("Error populating database methods:", err);
  } finally {
    await pool.end();
    console.log("Disconnected from PostgreSQL.");
  }
}

run();
