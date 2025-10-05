import { NextResponse } from "next/server";
import { publications } from "@/data/publications";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const year = searchParams.get("year");
    const search = searchParams.get("search");

    let filtered = publications;

    if (category && category !== "all") {
      filtered = filtered.filter((pub) => pub.category === category);
    }

    if (year && year !== "all") {
      filtered = filtered.filter((pub) => pub.year === parseInt(year));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (pub) =>
          pub.title.toLowerCase().includes(searchLower) ||
          pub.keywords?.some((k) => k.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json({
      total: publications.length,
      filtered: filtered.length,
      publications: filtered,
    });
  } catch (error) {
    console.error("Error fetching research data:", error);
    return NextResponse.json(
      { error: "Failed to fetch research data" },
      { status: 500 }
    );
  }
}