import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch NASA APOD data");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching NASA data:", error);
    return NextResponse.json(
      { error: "Failed to fetch NASA data" },
      { status: 500 }
    );
  }
}