import { NextResponse } from "next/server";

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

export async function GET() {
  if (!GNEWS_API_KEY) {
    return NextResponse.json(
      { error: "GNews API key is not configured on the server." },
      { status: 500 }
    );
  }

  // Fetch the top 9 headlines from the US in English
  const url = `https://gnews.io/api/v4/top-headlines?category=general&lang=ar&country=eg&max=15&apikey=${GNEWS_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("GNews API Error:", await response.text());
      throw new Error("Failed to fetch news from GNews API.");
    }
    const data = await response.json();
    // Return only the articles array
    return NextResponse.json(data.articles);
  } catch (error) {
    console.error("Fetch Live News Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch live news." },
      { status: 500 }
    );
  }
}