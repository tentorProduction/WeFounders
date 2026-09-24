import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

/**
 * Serves the project's markdown docs so the footer links resolve in the
 * browser. Only whitelisted files can be read.
 */
const DOC_FILES: Record<string, string> = {
  prd: "PRD.md",
  trd: "TRD.md",
  design: "DESIGN.md",
  deployment: "FREE_DEPLOYMENT_GUIDE.md.txt",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ doc: string }> }
) {
  const { doc } = await params;
  const fileName = DOC_FILES[doc];

  if (!fileName) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  try {
    const content = await readFile(path.join(process.cwd(), fileName), "utf8");
    return new NextResponse(content, {
      headers: { "content-type": "text/markdown; charset=utf-8" },
    });
  } catch {
    return NextResponse.json(
      { error: "Document unavailable" },
      { status: 500 }
    );
  }
}
