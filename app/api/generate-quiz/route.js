import { NextResponse } from "next/server";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const apiKey = process.env.API_KEY;
const endpoint = process.env.API_ENDPOINT;

export async function GET() {
  if (!apiKey || !endpoint) {
    return NextResponse.json({ error: "Azure AI credentials are not configured." }, { status: 500 });
  }
  
  // A diverse list of topics for generating unique facts and fictions
  const quizTopics = [
    "weird science discoveries", "unusual historical events", "strange animal behavior",
    "future technology predictions", "deep sea exploration", "space colonization facts",
    "common misconceptions", "bizarre world records", "cryptocurrency history",
    "AI capabilities", "archaeological mysteries", "sustainable energy breakthroughs",
    "human psychology experiments", "the solar system", "ancient civilizations"
  ];
  
  // Select 3 random topics to ensure variety in each quiz
  const selectedTopics = quizTopics.sort(() => 0.5 - Math.random()).slice(0, 3);
  const topicsString = selectedTopics.join(", ");

  const prompt = `
    Generate a "Fact or Fiction" quiz with exactly 5 unique questions based on the following themes: ${topicsString}.

    Instructions:
    1.  Create a JSON object with a single key "questions", containing an array of 5 unique objects.
    2.  Each object must have a "title" that is a short, factual-sounding statement.
    3.  Make 2 of the statements FAKE. They must be plausible but incorrect.
    4.  Make the other 3 statements REAL and verifiably true.
    5.  For each statement, add a boolean property "isFake" (true if the statement is false, false if it is true).
    6.  For each statement, add a string property "explanation" that clearly explains why the statement is true or false. If it's fake, the explanation should provide the correct fact.
    7.  CRITICAL: The statements must be distinct and not repetitive. They should be interesting and challenging.

    Return ONLY the JSON object. Example format: 
    {"questions": [{"title": "A shrimp's heart is in its head.", "isFake": false, "explanation": "This is true! A shrimp's heart is located in its cephalothorax, which is the fused head and thorax region."}, ...]}
  `;

  try {
    const client = ModelClient(endpoint, new AzureKeyCredential(apiKey));
    const response = await client.path("/chat/completions").post({
      body: {
        // Corrected to use your preferred model
        model: "mistral-ai/mistral-medium-2505",
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.9, // Higher temperature for more creative and varied statements
        messages: [
          { role: "system", content: "You are a creative assistant that generates unique 'Fact or Fiction' quiz questions in JSON format." },
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
