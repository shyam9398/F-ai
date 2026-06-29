"use client";

interface TagProps {
  label: string;
}

export default function Tag({ label }: TagProps) {
  const getColorScheme = (text: string) => {
    const val = text.toLowerCase();
    if (val === "transformer") {
      return "bg-orange-50 text-primary border border-orange-100/30";
    }
    if (val === "attention") {
      return "bg-blue-50 text-blue-600 border border-blue-100/30";
    }
    if (val === "architecture") {
      return "bg-purple-50 text-purple-600 border border-purple-100/30";
    }
    if (val === "pre-training") {
      return "bg-green-50 text-green-600 border border-green-100/30";
    }
    if (val === "embedding") {
      return "bg-teal-50 text-teal-600 border border-teal-100/30";
    }
    if (val === "large model") {
      return "bg-blue-50 text-blue-600 border border-blue-100/30";
    }
    if (val === "few-shot learning") {
      return "bg-amber-50 text-amber-600 border border-amber-100/30";
    }
    return "bg-gray-50 text-gray-600 border border-gray-100/30";
  };

  const colorClasses = getColorScheme(label);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colorClasses}`}>
      {label}
    </span>
  );
}
