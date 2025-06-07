import { NextResponse } from "next/server";
import * as cheerio from 'cheerio';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL parameter is required.' }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch the URL: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        let iconUrl = $('link[rel="icon"]').attr('href') || 
                      $('link[rel="shortcut icon"]').attr('href') ||
                      $('link[rel="apple-touch-icon"]').attr('href');

        if (iconUrl) {
            // Resolve relative URLs
            const absoluteIconUrl = new URL(iconUrl, url).href;
            return NextResponse.json({ favicon: absoluteIconUrl });
        } else {
             // If no icon link is found, try the default /favicon.ico path
            const defaultFaviconUrl = new URL('/favicon.ico', url).href;
            // We can't be sure this exists, but it's a common fallback
            return NextResponse.json({ favicon: defaultFaviconUrl });
        }

    } catch (error) {
        console.error(`[API /get-favicon] Error fetching favicon for ${url}:`, error.message);
        return NextResponse.json({ error: `Could not retrieve favicon. ${error.message}` }, { status: 500 });
    }
}