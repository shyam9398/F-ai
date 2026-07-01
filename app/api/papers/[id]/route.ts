import { NextRequest, NextResponse } from "next/server";
import { PaperRepository } from "@/lib/paperRepository";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing paper ID" }, { status: 400 });
    }

    const paper = await PaperRepository.getPaperById(id);

    if (!paper) {
      return NextResponse.json({ error: `Paper not found: ${id}` }, { status: 404 });
    }

    // Fetch related papers dynamically from the database using our repository logic
    const relatedPapers = await PaperRepository.getRelatedPapers(paper);

    return NextResponse.json({
      paper,
      relatedPapers,
    });
  } catch (error: any) {
    console.error(`GET /api/papers/[id] error details for ID:`, error);
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
