"use client";

import { Layers } from "lucide-react";

interface PlatformMappingProps {
  modelsUsed: string;
  datasetsUsed: string;
  framework: string;
  language: string;
  tasks: string[];
  researchArea: string;
}

export default function PlatformMapping({
  modelsUsed,
  datasetsUsed,
  framework,
  language,
  tasks,
  researchArea
}: PlatformMappingProps) {
  return (
    <div className="bg-white border border-border rounded-card p-5 shadow-card-sm text-left space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Layers className="w-5 h-5 text-[#F43F5E]" />
        <span className="text-[11px] font-black text-secondaryText uppercase tracking-widest leading-none">
          PLATFORM MAPPING
        </span>
      </div>

      <div className="space-y-3.5 text-xs">
        <div>
          <span className="block font-bold text-gray-400 uppercase tracking-wider mb-0.5">
            Models Used
          </span>
          <span className="font-semibold text-textDark">
            {modelsUsed || "N/A"}
          </span>
        </div>

        <div>
          <span className="block font-bold text-gray-400 uppercase tracking-wider mb-0.5">
            Datasets Used
          </span>
          <span className="font-semibold text-textDark">
            {datasetsUsed || "N/A"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="block font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              Framework
            </span>
            <span className="font-semibold text-textDark">
              {framework || "N/A"}
            </span>
          </div>
          <div>
            <span className="block font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              Language
            </span>
            <span className="font-semibold text-textDark">
              {language || "N/A"}
            </span>
          </div>
        </div>

        <div>
          <span className="block font-bold text-gray-400 uppercase tracking-wider mb-1">
            Tasks
          </span>
          <div className="flex flex-wrap gap-1.5">
            {tasks.map((task) => (
              <span 
                key={task} 
                className="px-2 py-0.5 bg-gray-50 border border-border text-gray-600 rounded-md font-semibold text-[10px]"
              >
                {task}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="block font-bold text-gray-400 uppercase tracking-wider mb-0.5">
            Research Area
          </span>
          <span className="font-semibold text-textDark">
            {researchArea || "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}
