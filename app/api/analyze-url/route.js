import { NextResponse } from "next/server";
import * as cheerio from 'cheerio';

export async function POST(request) {
    try {
        const { url } = await request.json();

        // Validate the URL
        if (!url || !URL.canParse(url)) {
            return NextResponse.json({ error: 'A valid URL is required.' }, { status: 400 });
        }

        // 1. Fetch the HTML content from the provided URL
        console.log(`[API /analyze-url] Fetching content from: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch the URL. Server responded with status: ${response.status}`);
        }
        const html = await response.text();

        // 2. Use Cheerio to parse the HTML and extract the main text
        const $ = cheerio.load(html);
        
        // A common strategy is to combine titles and paragraphs. This can be refined later.
        let articleText = '';
        $('h1, h2, p').each((i, el) => {
            articleText += $(el).text().trim() + '\n\n';
        });

        if (!articleText.trim()) {
            throw new Error('Could not extract any readable article text from the provided URL.');
        }

        // 3. Internally call your existing text analysis API with the scraped text
        console.log(`[API /analyze-url] Forwarding extracted text to /api/analyze-text...`);
        const analyzeRequest = await fetch(new URL('/api/analyze-text', request.url), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Forward the user's cookie to the next API call so their session is recognized
                // This is crucial for saving to the correct user's history
                'Cookie': request.headers.get('cookie') || ''
            },
            body: JSON.stringify({ text: articleText })
        });
        
        const analysisResult = await analyzeRequest.json();

        if(!analyzeRequest.ok) {
            throw new Error(analysisResult.error || "The internal text analysis failed.");
        }

        // 4. Return the final analysis result back to the client
        return NextResponse.json(analysisResult);

    } catch (error) {
        console.error("[API /analyze-url] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}