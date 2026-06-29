"use client";

import { Code, Star, GitFork, ExternalLink } from "lucide-react";

interface CodeRepoCardProps {
  githubUrl: string;
  paperTitle: string;
}

export default function CodeRepoCard({ githubUrl, paperTitle }: CodeRepoCardProps) {
  // Parse repository name from GitHub URL
  const getRepoName = (url: string) => {
    if (!url) return "";
    try {
      const parts = url.replace("https://github.com/", "").split("/");
      return `${parts[0]}/${parts[1]}`;
    } catch {
      return "repository";
    }
  };

  const handleFindOnGithub = () => {
    const searchUrl = `https://github.com/search?q=${encodeURIComponent(paperTitle)}`;
    window.open(searchUrl, "_blank", "noopener,noreferrer");
  };

  const hasRepo = !!githubUrl;

  return (
    <div className="bg-white border border-border rounded-card p-5 shadow-card-sm text-left">
      <div className="flex items-center gap-2 mb-4">
        <Code className="w-5 h-5 text-primary" />
        <span className="text-[11px] font-black text-secondaryText uppercase tracking-widest leading-none">
          CODE & REPOSITORY
        </span>
      </div>

      {hasRepo ? (
        <div className="space-y-4">
          <div>
            <span className="block text-xs font-semibold text-gray-400 mb-1">
              Official GitHub Repository
            </span>
            <a 
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-bold text-textDark hover:text-primary transition-colors flex items-center gap-1 leading-snug break-all"
            >
              <span>{getRepoName(githubUrl)}</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            </a>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-secondaryText">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>12.4k stars</span>
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="w-4 h-4 text-blue-500" />
              <span>1.8k forks</span>
            </div>
          </div>
          
          <div className="text-[11px] text-gray-400 font-semibold border-t border-border pt-3">
            Last Updated: 2 days ago
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-secondaryText font-medium">
            No official code repository linked.
          </p>
          <button
            onClick={handleFindOnGithub}
            className="w-full py-2.5 bg-gray-50 border border-border hover:bg-gray-100 hover:border-gray-300 text-textDark font-bold text-xs tracking-wider rounded-[10px] transition-all cursor-pointer text-center uppercase flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-gray-700 fill-current" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>FIND ON GITHUB</span>
          </button>
        </div>
      )}
    </div>
  );
}
