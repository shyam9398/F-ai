import { NextRequest, NextResponse } from "next/server";
import { PaperRepository } from "@/lib/paperRepository";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("method") || undefined;
    const sort = searchParams.get("sort") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const idsParam = searchParams.get("ids");
    const ids = idsParam ? idsParam.split(",").map(id => id.trim()).filter(Boolean) : undefined;

    const task = searchParams.get("task") || undefined;

    // Fetch filters, page, and pagination count directly from DB via repository
    const { papers, totalCount } = await PaperRepository.getPapers({
      category,
      sort,
      search,
      page,
      limit,
      ids,
      task,
    });

    const methods = await PaperRepository.getAllMethods(task);
    const totalPapersCount = await PaperRepository.getTotalPapersCount(task);

    return NextResponse.json({
      papers,
      totalCount,
      totalPapersCount,
      methods,
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        "X-Total-Count": totalCount.toString(),
      },
    });
  } catch (error: any) {
    console.error("GET /api/papers error details:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal Server Error",
        code: error.code || null,
        stack: error.stack || null,
      },
      { status: 500 }
    );
  }
}
