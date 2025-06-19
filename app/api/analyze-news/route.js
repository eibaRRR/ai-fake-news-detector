import { NextResponse } from "next/server";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { google } from 'googleapis';

const apiKey = process.env.API_KEY;
const endpoint = process.env.API_ENDPOINT;

const createErrorResponse = (message, status) => {
  console.error(`[API /analyze-news] Sending Error Response: ${message}`);
  return NextResponse.json({ error: message }, { status });
};

// Helper function to convert image URL to base64 data URL
async function convertImageUrlToBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('URL does not point to a valid image');
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting image URL to base64:', error);
    throw new Error(`Unable to process image URL: ${error.message}`);
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!apiKey || !endpoint) {
    return createErrorResponse("Server configuration error: API_KEY or API_ENDPOINT is not set.", 500);
  }

  let imageUrl;
  try {
    const body = await request.json();
    imageUrl = body.imageUrl;
    if (!imageUrl) {
      return createErrorResponse("Image URL is required.", 400);
    }
  } catch (e) {
    return createErrorResponse("Invalid request body.", 400);
  }

  try {
    const model = "mistral-ai/mistral-medium-2505";
    const client = ModelClient(endpoint, new AzureKeyCredential(apiKey));

    // Convert image URL to base64 data URL
    console.log(`[API /analyze-news] Converting image URL to base64: ${imageUrl}`);
    const base64ImageUrl = await convertImageUrlToBase64(imageUrl);
    console.log(`[API /analyze-news] Successfully converted image to base64`);

    // --- Step 1: Get initial analysis and a search query from the AI ---
    const initialResponse = await client.path("/chat/completions").post({
      body: {
        model: model,
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content: `You are a world-class fact-checking assistant. Analyze the provided news image. Your primary goal is to provide a neutral, factual analysis and generate a search query that can be used to find verification sources.
            1. Extract all text from the image.
            2. Identify the main claims as an array of strings.
            3. Assess the likelihood of the news being fake (boolean).
            4. Determine political bias and emotional tone.
            5. Identify potential logical fallacies and rate the level of sensationalism.
            6. CRITICAL: Generate a concise, neutral Google search query (as 'searchQuery') that would find reputable sources to verify the main claims.
            7. Return a single JSON object with the specified structure. DO NOT include sources.
            {
              "isLikelyFake": boolean,
              "confidence": number (0-100),
              "analysis": string,
              "extractedText": string,
              "mainClaims": array of strings,
              "bias": string,
              "tone": string,
              "logicalFallacies": array of strings,
              "sensationalism": string,
              "searchQuery": string
            }`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this news image for potential misinformation:" },
              { type: "image_url", image_url: { url: base64ImageUrl } }, // Use base64 instead of original URL
            ],
          },
        ],
      },
    });

    if (isUnexpected(initialResponse)) {
        const azureError = initialResponse.body?.error?.message || JSON.stringify(initialResponse.body);
        return createErrorResponse(`Azure AI service returned an error: ${azureError}`, initialResponse.status);
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
                num: 3,
            });
            if (searchResult.data.items) {
                sources = searchResult.data.items.map(item => ({
                    title: item.title,
                    url: item.link,
                    date: item.snippet,
                }));
            }
        } catch(e) {
            console.error("Google Search API failed:", e.message);
        }
    }
    
    const analysisId = Date.now();
    const finalResult = { ...initialResult, sources, id: analysisId };

    if (session?.user?.email) {
      const analysisData = {
        id: analysisId,
        inputType: 'image',
        inputValue: imageUrl, // Store original URL for display purposes
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
    console.error(`[API /analyze-news] Error:`, error);
    return createErrorResponse(error.message || "An unknown error occurred.", 500);
  }
}
