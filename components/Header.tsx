"use client";

import { ChevronDown, User } from "lucide-react";

export default function Header() {
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
