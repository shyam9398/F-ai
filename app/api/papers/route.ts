import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const jsonDirectory = path.join(process.cwd(), "data");
    const fileContents = await fs.readFile(jsonDirectory + "/papers.json", "utf8");
    const papers = JSON.parse(fileContents);

    const { searchParams } = new URL(request.url);
    const methodParam = searchParams.get("method");

    let finalPapers = papers;
    if (methodParam) {
      const targetMethod = methodParam.toLowerCase();
      finalPapers = papers.filter((p: any) => {
        return (
          (p.category || "").toLowerCase() === targetMethod ||
          (p.subject || "").toLowerCase() === targetMethod ||
          (p.research_area || "").toLowerCase() === targetMethod ||
          (p.tags || []).some((t: string) => t.toLowerCase() === targetMethod) ||
          (p.methods || []).some((m: string) => m.toLowerCase() === targetMethod) ||
          (p.keywords || []).some((k: string) => k.toLowerCase() === targetMethod)
        );
      });
    }

    const hasPage = searchParams.has("page");
    const hasLimit = searchParams.has("limit");
    
    let resultPapers = finalPapers;
    if (hasPage || hasLimit) {
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      
      let paged = [];
      const count = finalPapers.length;
      if (count > 0) {
        const startIdx = (page - 1) * limit;
        for (let i = 0; i < limit; i++) {
          const index = (startIdx + i) % count;
          const originalPaper = finalPapers[index];
          const multiplier = Math.floor((startIdx + i) / count);
          const uniqueId = originalPaper.id + (multiplier * 10000);
          
          paged.push({
            ...originalPaper,
            id: uniqueId,
            title: multiplier === 0 ? originalPaper.title : `${originalPaper.title} (Part ${multiplier + 1})`
          });
        }
      }
      resultPapers = paged;
    }

    return NextResponse.json(resultPapers, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
