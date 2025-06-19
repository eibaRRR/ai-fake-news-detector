import { NextResponse } from "next/server";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { google } from 'googleapis'; // Import Google APIs

const apiKey = process.env.API_KEY;
const endpoint = process.env.API_ENDPOINT;

const createErrorResponse = (message, status) => {
  console.error(`[API /analyze-text] Sending Error Response: ${message}`);
  return NextResponse.json({ error: message }, { status });
};

export async function POST(request) {
  const session = await getServerSession(authOptions);
  const { text, source } = await request.json();

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return createErrorResponse("Text for analysis is required.", 400);
  }

  try {
    if (!apiKey || !endpoint) return createErrorResponse("Azure AI credentials not configured.", 500);

    const client = ModelClient(endpoint, new AzureKeyCredential(apiKey));
    // --- Step 1: Get initial analysis and a search query from the AI ---
    const initialResponse = await client.path("/chat/completions").post({
      body: {
        model: "mistral-ai/mistral-medium-2505",
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content: `You are a world-class fact-checking assistant. Analyze the provided news text. Your primary goal is to provide a neutral, factual analysis and generate a search query that can be used to find verification sources.
            1. Identify the main claims as an array of strings.
            2. Assess the likelihood of the news being fake (boolean).
            3. Determine political bias and emotional tone.
            4. Identify potential logical fallacies and rate the level of sensationalism.
            5. CRITICAL: Generate a concise, neutral Google search query (as 'searchQuery') that would find reputable sources to verify the main claims.
            6. Return a single JSON object with the specified structure. DO NOT include sources.
            {
                "isLikelyFake": boolean,
                "confidence": number (0-100),
                "analysis": string,
                "mainClaims": array of strings,
                "bias": string,
                "tone": string,
                "logicalFallacies": array of strings,
                "sensationalism": string,
                "searchQuery": string
            }`,
          },
          { role: "user", content: [{ type: "text", text: `Analyze this news text for potential misinformation: "${text}"` }] }
        ],
      },
    });

    if (isUnexpected(initialResponse)) {
        const azureError = initialResponse.body?.error?.message || JSON.stringify(initialResponse.body);
        return createErrorResponse(`Azure AI service returned an error: ${azureError}`, azureError.status);
    }
    
    const content = initialResponse.body.choices[0]?.message?.content;
    if (!content) {
        return createErrorResponse("AI service returned an empty response.", 500);
    }

    const initialResult = JSON.parse(content);

    // --- Step 2: Use the generated search query to find real sources ---
    let sources = [];
    if (initialResult.searchQuery && process.env.GOOGLE_API_KEY && process.env.GOOGLE_CSE_ID) {
        try {
            const search = google.customsearch('v1');
            const searchResult = await search.cse.list({
                q: initialResult.searchQuery,
                auth: process.env.GOOGLE_API_KEY,
                cx: process.env.GOOGLE_CSE_ID,
                num: 3, // Get top 3 results
            });
            if (searchResult.data.items) {
                sources = searchResult.data.items.map(item => ({
                    title: item.title,
                    url: item.link,
                    date: item.snippet, // Snippet often contains date info
                }));
            }
        } catch(e) {
            console.error("Google Search API failed:", e.message);
            // Don't fail the whole request, just proceed without sources
        }
    }

    const analysisId = Date.now();
    // Combine the AI analysis with the real-time sources
    const finalResult = { ...initialResult, sources, extractedText: text, id: analysisId };

    if (session?.user?.email && source !== 'live-feed') {
      const analysisData = {
        id: analysisId,
        inputType: 'text',
        inputValue: text,
        result: finalResult,
      };
      const mongoClient = await clientPromise;
      const db = mongoClient.db();
      // MODIFICATION: Removed the $slice operator to store all history
      await db.collection("users").updateOne(
        { email: session.user.email },
        { $push: { history: analysisData } }
      );
    }

    return NextResponse.json(finalResult);
  } catch (error) {
    return createErrorResponse(error.message || "An unknown error occurred.", 500);
  }
}
