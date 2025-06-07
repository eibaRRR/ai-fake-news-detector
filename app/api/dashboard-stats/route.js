import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const history = user.history || [];
    
    const totalAnalyses = history.length;
    const fakeCount = history.filter(item => item.result.isLikelyFake).length;
    const authenticCount = totalAnalyses - fakeCount;

    const totalCorrect = user.totalCorrectQuizAnswers || 0;
    const totalAnswered = user.totalQuizQuestionsAnswered || 0;
    const quizAccuracy = totalAnswered > 0 
        ? Math.round((totalCorrect / totalAnswered) * 100) 
        : 0;

    // Return all stats, including the new totalAnswered
    return NextResponse.json({
        totalAnalyses,
        fakeCount,
        authenticCount,
        quizAccuracy,
        totalQuizQuestionsAnswered: totalAnswered // <-- Add this new field
    });

  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}