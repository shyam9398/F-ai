const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/burla/Downloads/frontier/public/thumbnails';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const papers = [
  { file: 'attention.svg', title: 'Attention Is All You Need', sub: 'Vaswani et al. • NeurIPS 2017' },
  { file: 'bert.svg', title: 'BERT: Pre-training of Deep Bidirectional...', sub: 'Devlin et al. • NAACL 2019' },
  { file: 'gpt3.svg', title: 'GPT-3: Language Models are Few-Shot...', sub: 'Brown et al. • NeurIPS 2020' },
  { file: 'roberta.svg', title: 'RoBERTa: A Robustly Optimized BERT...', sub: 'Liu et al. • arXiv 2019' },
  { file: 't5.svg', title: 'Exploring the Limits of Transfer...', sub: 'Raffel et al. • JMLR 2020' },
  { file: 'palm.svg', title: 'PaLM: Scaling Language Modeling with...', sub: 'Chowdhery et al. • JMLR 2023' },
  { file: 'llama.svg', title: 'LLaMA: Open and Efficient Foundation...', sub: 'Touvron et al. • arXiv 2023' },
  { file: 'opt.svg', title: 'OPT: Open Pre-trained Transformer...', sub: 'Zhang et al. • arXiv 2022' },
  { file: 'flant5.svg', title: 'Scaling Instruction-Finetuned...', sub: 'Chung et al. • arXiv 2022' },
  { file: 'gpt4.svg', title: 'GPT-4 Technical Report', sub: 'OpenAI • arXiv 2023' }
];

papers.forEach(p => {
  const svg = `<svg width="110" height="145" viewBox="0 0 110 145" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="110" height="145" fill="white" stroke="#ECECEC" stroke-width="1" rx="4"/>
  <text x="55" y="22" font-family="Georgia, serif" font-size="4.2" font-weight="bold" fill="#111827" text-anchor="middle">${p.title}</text>
  <text x="55" y="30" font-family="sans-serif" font-size="3" fill="#6B7280" text-anchor="middle">${p.sub}</text>
  
  <rect x="15" y="42" width="80" height="2" rx="1" fill="#D1D5DB"/>
  <rect x="15" y="48" width="75" height="2" rx="1" fill="#D1D5DB"/>
  <rect x="15" y="54" width="60" height="2" rx="1" fill="#D1D5DB"/>

  <rect x="15" y="66" width="36" height="1.5" rx="0.5" fill="#E5E7EB"/>
  <rect x="15" y="72" width="36" height="1.5" rx="0.5" fill="#E5E7EB"/>
  <rect x="15" y="78" width="36" height="1.5" rx="0.5" fill="#E5E7EB"/>
  <rect x="15" y="84" width="32" height="1.5" rx="0.5" fill="#E5E7EB"/>
  <rect x="15" y="90" width="36" height="1.5" rx="0.5" fill="#E5E7EB"/>

  <rect x="59" y="66" width="36" height="1.5" rx="0.5" fill="#E5E7EB"/>
  <rect x="59" y="72" width="36" height="1.5" rx="0.5" fill="#E5E7EB"/>
  <rect x="59" y="78" width="36" height="1.5" rx="0.5" fill="#E5E7EB"/>
  <rect x="59" y="84" width="34" height="1.5" rx="0.5" fill="#E5E7EB"/>
  <rect x="59" y="90" width="36" height="1.5" rx="0.5" fill="#E5E7EB"/>
</svg>`;
  fs.writeFileSync(path.join(dir, p.file), svg);
});
console.log("Created all SVGs successfully");
