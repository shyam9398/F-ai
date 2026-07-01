import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  activeTask?: string;
}

export default function Breadcrumb({ activeTask = "Large Language Model (LLM)" }: BreadcrumbProps) {
  // Map task name to standard user-friendly category title
  const displayName = activeTask === "Language Modeling" ? "Large Language Model (LLM)" : activeTask;

  return (
    <nav className="flex items-center space-x-1.5 text-[11.5px] font-sans text-gray-500 py-1" aria-label="Breadcrumb">
      <Link href="/" className="hover:text-gray-950 transition-colors">
        Home
      </Link>
      <ChevronRight className="w-3 h-3 text-gray-400 stroke-[1.8]" />
      <span className="text-gray-500">
        Methods
      </span>
      <ChevronRight className="w-3 h-3 text-gray-400 stroke-[1.8]" />
      <span className="text-[#FF6A3D] font-bold">
        {displayName}
      </span>
    </nav>
  );
}
