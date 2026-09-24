import { NextResponse } from "next/server";

import { getViewer, isFounderViewer } from "@/lib/auth/viewer";
import { getStartupBySlug } from "@/lib/fixtures/startups";
import { listWaitlist } from "@/lib/waitlist/store";

/**
 * 1-click waitlist CSV export (PRD §4.1) — founder only.
 *
 * With a configured backend the gate is the real session owner check; the
 * `?as=founder` flag is only honoured in backend-less demo mode.
 */

function csvCell(value: string | null): string {
  const text = value ?? "";
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const startup = await getStartupBySlug(slug);

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const asFounder = new URL(request.url).searchParams.get("as") === "founder";
  const viewer = await getViewer();

  if (!isFounderViewer(viewer, startup, asFounder)) {
    return NextResponse.json(
      { error: "Only the startup founder can export this waitlist." },
      { status: 403 }
    );
  }

  const rows = await listWaitlist(startup.id);

  const header = [
    "email",
    "phone",
    "notes",
    "referral_source",
    "created_at",
  ];

  const csv = [
    header.join(","),
    ...rows.map((row) =>
      [
        row.email,
        row.phone,
        row.notes,
        row.referral_source,
        row.created_at,
      ]
        .map(csvCell)
        .join(",")
    ),
  ].join("\r\n");

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      // BOM + CRLF so Excel opens Nepali text and columns correctly.
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${startup.slug}-waitlist.csv"`,
      "cache-control": "no-store",
    },
  });
}
