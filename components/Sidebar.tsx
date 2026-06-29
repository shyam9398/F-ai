"use client";

import { 
  TrendingUp, Clock, Star, Brain, Lightbulb, 
  Cpu, Terminal, Laptop, Globe, Eye,
  ChevronLeft, Menu
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeDiscover: string;
  onDiscoverChange: (tab: string) => void;
}

export default function Sidebar({ activeDiscover, onDiscoverChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const discoverItems = [
    { label: "Trending Papers", icon: TrendingUp },
    { label: "Latest Papers", icon: Clock },
    { label: "Most GitHub Stars", icon: Star }
  ];

  const tasksItems = [
    { label: "Agents", icon: Cpu },
    { label: "Reasoning", icon: Lightbulb },
    { label: "Language Modeling", icon: Brain },
    { label: "Coding Agents", icon: Terminal },
    { label: "Computer Use", icon: Laptop },
    { label: "World Models", icon: Globe },
    { label: "Robotics", icon: Eye }
  ];

  const methodsItems = [
    { label: "Transformer" },
    { label: "Chain of Thought" },
    { label: "ReAct" },
    { label: "LoRA" }
  ];

  return (
    <aside className={`border-r border-border min-h-screen bg-white transition-all duration-300 select-none flex flex-col p-4 text-left ${
      collapsed ? "w-16" : "w-64"
    }`}>
      {/* Collapse Arrow Button Toggle */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-lightGray rounded-md border border-border cursor-pointer transition-colors"
        >
          {collapsed ? <Menu className="w-4 h-4 text-gray-500" /> : <ChevronLeft className="w-4 h-4 text-gray-500" />}
        </button>
      </div>

      <div className={`space-y-6 overflow-y-auto flex-1 ${collapsed ? "hidden" : "block"}`}>
        {/* DISCOVER SECTION */}
        <div>
          <span className="block text-[10px] font-black text-secondaryText uppercase tracking-widest mb-3">
            DISCOVER
          </span>
          <ul className="space-y-1">
            {discoverItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeDiscover === item.label;
              return (
                <li key={item.label}>
                  <button
                    onClick={() => onDiscoverChange(item.label)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                      isActive
                        ? "bg-rose-50 text-rose-600"
                        : "text-textDark hover:bg-lightGray"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-rose-600' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* TASKS SECTION */}
        <div>
          <span className="block text-[10px] font-black text-secondaryText uppercase tracking-widest mb-3">
            TASKS
          </span>
          <ul className="space-y-1">
            {tasksItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg text-textDark hover:bg-lightGray transition-colors cursor-pointer text-left">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* METHODS SECTION */}
        <div>
          <span className="block text-[10px] font-black text-secondaryText uppercase tracking-widest mb-3">
            METHODS
          </span>
          <ul className="space-y-1">
            {methodsItems.map((item) => (
              <li key={item.label}>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-textDark hover:bg-lightGray rounded-lg transition-colors cursor-pointer text-left">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
