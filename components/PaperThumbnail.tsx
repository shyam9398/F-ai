"use client";

interface PaperThumbnailProps {
  title: string;
  authors: string;
  conference: string;
}

export default function PaperThumbnail({ title, authors, conference }: PaperThumbnailProps) {
  return (
    <div className="w-[110px] h-[140px] bg-white border border-borderGray rounded-md p-2 flex flex-col justify-between shadow-xs select-none overflow-hidden text-gray-800">
      {/* Title section */}
      <div className="text-[5px] font-bold text-center leading-tight line-clamp-2 border-b border-gray-100 pb-1 mb-1 font-serif">
        {title}
      </div>

      {/* Author & Conference tiny lines */}
      <div className="text-[3px] text-center text-gray-500 mb-1 leading-none">
        {authors} • {conference}
      </div>

      {/* Abstract lines representation */}
      <div className="space-y-0.5 mb-1.5">
        <div className="h-[2px] w-full bg-gray-300 rounded-full" />
        <div className="h-[2px] w-11/12 bg-gray-300 rounded-full" />
        <div className="h-[2px] w-4/5 bg-gray-300 rounded-full" />
      </div>

      {/* Double Column lines representation */}
      <div className="flex gap-1.5 flex-1">
        <div className="flex-1 space-y-0.5">
          <div className="h-[1px] w-full bg-gray-200" />
          <div className="h-[1px] w-full bg-gray-200" />
          <div className="h-[1px] w-full bg-gray-200" />
          <div className="h-[1px] w-full bg-gray-200" />
          <div className="h-[1px] w-5/6 bg-gray-200" />
        </div>
        <div className="flex-1 space-y-0.5">
          <div className="h-[1px] w-full bg-gray-200" />
          <div className="h-[1px] w-full bg-gray-200" />
          <div className="h-[1px] w-full bg-gray-200" />
          <div className="h-[1px] w-full bg-gray-200" />
          <div className="h-[1px] w-4/5 bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
