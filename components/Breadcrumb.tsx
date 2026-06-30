import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb() {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 py-2" aria-label="Breadcrumb">
      <Link href="/" className="hover:text-gray-900 transition-colors">
        Home
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-300" />
      <Link href="/methods" className="hover:text-gray-900 transition-colors">
        Methods
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-300" />
      <span className="text-primary font-medium">Large Language Model (LLM)</span>
    </nav>
  );
}
