export interface Paper {
  id: number;
  title: string;
  authors: string;
  conference: string;
  year: number;
  description: string;
  citations: number;
  usage: number;
  thumbnail: string;
  tags: string[];
  category: "Architecture" | "Optimization" | "Training" | "Attention" | "Regularization" | "Embedding";
  externalLink: string;
}

export const papersData: Paper[] = [
  {
    id: 1,
    title: "Attention Is All You Need",
    authors: "Vaswani et al.",
    conference: "NeurIPS 2017",
    year: 2017,
    description: "Introduces the Transformer architecture, relying solely on attention mechanism, achieving state-of-the-art results on multiple tasks.",
    citations: 83502,
    usage: 14731,
    thumbnail: "/thumbnails/attention.svg",
    tags: ["Transformer", "Attention", "Architecture"],
    category: "Attention",
    externalLink: "https://arxiv.org/abs/1706.03762"
  },
  {
    id: 2,
    title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    authors: "Devlin et al.",
    conference: "NAACL 2019",
    year: 2019,
    description: "Pre-trains deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context.",
    citations: 76654,
    usage: 19215,
    thumbnail: "/thumbnails/bert.svg",
    tags: ["Pre-training", "Transformer", "Embedding"],
    category: "Training",
    externalLink: "https://arxiv.org/abs/1810.04805"
  },
  {
    id: 3,
    title: "GPT-3: Language Models are Few-Shot Learners",
    authors: "Brown et al.",
    conference: "NeurIPS 2020",
    year: 2020,
    description: "Demonstrates that large language models can perform a wide variety of tasks in a few-shot setting.",
    citations: 47892,
    usage: 12104,
    thumbnail: "/thumbnails/gpt3.svg",
    tags: ["Large Model", "Few-shot Learning", "Pre-training"],
    category: "Architecture",
    externalLink: "https://arxiv.org/abs/2005.14165"
  },
  {
    id: 4,
    title: "RoBERTa: A Robustly Optimized BERT Pretraining Approach",
    authors: "Liu et al.",
    conference: "arXiv 2019",
    year: 2019,
    description: "Finds that BERT was significantly under-trained, and proposes an improved recipe for training BERT models.",
    citations: 28941,
    usage: 8431,
    thumbnail: "/thumbnails/roberta.svg",
    tags: ["BERT", "Optimization", "Training"],
    category: "Optimization",
    externalLink: "https://arxiv.org/abs/1907.11692"
  },
  {
    id: 5,
    title: "Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer",
    authors: "Raffel et al.",
    conference: "JMLR 2020",
    year: 2020,
    description: "Systematically studies transfer learning for NLP and introduces a unified text-to-text framework (T5) for NLP tasks.",
    citations: 23141,
    usage: 6942,
    thumbnail: "/thumbnails/t5.svg",
    tags: ["T5", "Text-to-Text", "Training"],
    category: "Training",
    externalLink: "https://arxiv.org/abs/1910.10683"
  },
  {
    id: 6,
    title: "PaLM: Scaling Language Modeling with Pathways",
    authors: "Chowdhery et al.",
    conference: "JMLR 2023",
    year: 2023,
    description: "Introduces PaLM, a 540-billion parameter Transformer language model trained on a high-efficiency system called Pathways.",
    citations: 4892,
    usage: 1541,
    thumbnail: "/thumbnails/palm.svg",
    tags: ["PaLM", "Scaling", "Architecture"],
    category: "Architecture",
    externalLink: "https://arxiv.org/abs/2204.02311"
  },
  {
    id: 7,
    title: "LLaMA: Open and Efficient Foundation Language Models",
    authors: "Touvron et al.",
    conference: "arXiv 2023",
    year: 2023,
    description: "Introduces LLaMA, a collection of foundation language models ranging from 7B to 65B parameters, trained on trillions of tokens.",
    citations: 9843,
    usage: 4125,
    thumbnail: "/thumbnails/llama.svg",
    tags: ["LLaMA", "Foundation Model", "Architecture"],
    category: "Architecture",
    externalLink: "https://arxiv.org/abs/2302.13971"
  },
  {
    id: 8,
    title: "OPT: Open Pre-trained Transformer Language Models",
    authors: "Zhang et al.",
    conference: "arXiv 2022",
    year: 2022,
    description: "Presents OPT, a suite of decoder-only pre-trained transformers ranging from 125M to 175B parameters shared openly.",
    citations: 3412,
    usage: 1105,
    thumbnail: "/thumbnails/opt.svg",
    tags: ["OPT", "Open Source", "Architecture"],
    category: "Architecture",
    externalLink: "https://arxiv.org/abs/2205.01068"
  },
  {
    id: 9,
    title: "Scaling Instruction-Finetuned Language Models",
    authors: "Chung et al.",
    conference: "arXiv 2022",
    year: 2022,
    description: "Introduces FLAN-T5, exploring instruction finetuning scaling across model size and number of tasks.",
    citations: 5431,
    usage: 2314,
    thumbnail: "/thumbnails/flant5.svg",
    tags: ["FLAN", "Instruction Tuning", "Training"],
    category: "Training",
    externalLink: "https://arxiv.org/abs/2210.11416"
  },
  {
    id: 10,
    title: "GPT-4 Technical Report",
    authors: "OpenAI",
    conference: "arXiv 2023",
    year: 2023,
    description: "Presents GPT-4, a large multimodal model capable of processing image and text inputs and emitting text outputs.",
    citations: 18431,
    usage: 8431,
    thumbnail: "/thumbnails/gpt4.svg",
    tags: ["GPT-4", "Multimodal", "Architecture"],
    category: "Architecture",
    externalLink: "https://arxiv.org/abs/2303.08774"
  }
];
