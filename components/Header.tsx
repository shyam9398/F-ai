"use client";

import { Search, ChevronDown, User } from "lucide-react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="sticky top-0 bg-white border-b border-border z-40 select-none">
      <div className="container py-4 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-lg shadow-xs">
            A
          </div>
          <span className="text-xl font-black text-textDark tracking-tight">
            Frontier Atlas
          </span>
        </div>

        {/* Middle: Search bar */}
        <div className="flex-1 max-w-xl mx-8 relative hidden md:block">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search papers, authors, topics..."
            className="w-full pl-10 pr-12 py-2 text-sm bg-[#F9FAFB] border border-border rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-textDark font-medium transition-all"
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-gray-400 bg-white border border-border rounded-md shadow-xs">
              <span>⌘</span><span>K</span>
            </kbd>
          </div>
        </div>

        {/* Right: Submit & Profile */}
        <div className="flex items-center gap-4">
          <button className="px-5 py-2.5 bg-primary hover:bg-primaryHover text-white font-bold text-sm rounded-[10px] shadow-xs cursor-pointer transition-colors">
            Submit
          </button>

          <button className="flex items-center gap-1.5 p-1.5 hover:bg-lightGray rounded-full border border-border cursor-pointer transition-all">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 border border-border">
              <User className="w-4 h-4" />
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
