import { NextResponse } from "next/server";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { google } from 'googleapis';

const apiKey = process.env.API_KEY;
const endpoint = process.env.API_ENDPOINT;

// Fonction améliorée pour rechercher des titres d'actualité spécifiques
async function getRealHeadlines(googleSearch, topic) {
  try {
    const result = await googleSearch.cse.list({
      q: `latest ${topic} news headline`,
      auth: process.env.GOOGLE_API_KEY,
      cx: process.env.GOOGLE_CSE_ID,
      num: 4,
      sort: 'date'
    });
    // Filtrer les titres génériques ou trop courts
    return result.data.items
      .map(item => item.title)
      .filter(title => title && !title.includes('|') && !title.includes(' - ') && title.split(' ').length > 5);
  } catch (error) {
    console.error(`Google Search failed for topic "${topic}":`, error);
    return []; // Retourner un tableau vide en cas d'erreur
  }
}

export async function GET() {
  if (!apiKey || !endpoint) {
    return NextResponse.json({ error: "Azure AI credentials are not configured." }, { status: 500 });
  }

  const search = google.customsearch('v1');
  
  // Rechercher dans plusieurs catégories pour une meilleure variété
  const scienceHeadlines = await getRealHeadlines(search, 'science');
  const worldHeadlines = await getRealHeadlines(search, 'world');
  const techHeadlines = await getRealHeadlines(search, 'technology');

  let allHeadlines = [...scienceHeadlines, ...worldHeadlines, ...techHeadlines];
  
  // Utiliser une liste de secours si la recherche Google ne retourne rien d'utile
  if (allHeadlines.length < 5) {
    allHeadlines.push(
        "Scientists Discover a New Species of 'Singing' Dog in New Guinea",
        "Japan's Nikkei index hits all-time high, erasing 1989 bubble-era record",
        "NASA's Artemis mission confirms water ice on Moon's south pole",
        "Major international study finds bees can understand the concept of zero",
        "New deep-sea submersible reaches the deepest point of the Atlantic Ocean"
    );
  }
  
  // Créer un échantillon aléatoire et unique de titres
  const uniqueHeadlines = [...new Set(allHeadlines)];
  const randomSample = uniqueHeadlines.sort(() => 0.5 - Math.random()).slice(0, 5);
  const headlinesString = randomSample.join("\n");

  const prompt = `
    Based on the following real news headlines, generate a quiz with exactly 5 questions.
    
    Instructions:
    1. Create a JSON object with a single key "questions" which contains an array of 5 objects.
    2. For each object, create a "title" which is a news headline.
    3. Make 2 of the titles FAKE by plausibly altering the real headlines provided below. Do not just negate them; change a specific detail (e.g., a country, a number, a finding).
    4. Make the other 3 titles REAL, inspired by the list.
    5. For each object, add a boolean property "isFake".
    6. For each object, add a string property "explanation" detailing why the headline is real or fake.
    7. CRITICAL: Ensure the "title" is a plausible news headline, not a website name or a generic phrase like "Breaking News".
    
    Real headlines for inspiration:
    ${headlinesString}

    Return ONLY the JSON object. Example format: {"questions": [{"title": "...", "isFake": boolean, "explanation": "..."}, ...]}
  `;

  try {
    const client = ModelClient(endpoint, new AzureKeyCredential(apiKey));
    const response = await client.path("/chat/completions").post({
      body: {
        model: "openai/gpt-4.1",
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.7,
        messages: [
          { role: "system", content: "You are a helpful assistant that generates quiz questions in JSON format." },
          { role: "user", content: prompt }
        ],
      },
    });

    if (isUnexpected(response)) {
      throw new Error("Azure AI service returned an unexpected response.");
    }
    
    const responseData = JSON.parse(response.body.choices[0].message.content);
    const questionsArray = responseData.questions || (Array.isArray(responseData) ? responseData : null);

    if (!questionsArray || !Array.isArray(questionsArray) || questionsArray.length === 0) {
        throw new Error("AI did not return a valid array of questions.");
    }

    return NextResponse.json(questionsArray);

  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate quiz." }, { status: 500 });
  }
}