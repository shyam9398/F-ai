import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb() {
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
      <span className="text-[#F55036] font-semibold">Large Language Model (LLM)</span>
    </nav>
  );
}
