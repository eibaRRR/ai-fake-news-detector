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

    // Use a more efficient aggregation pipeline to calculate stats in the database
    const statsAggregation = await db.collection("users").aggregate([
        { $match: { email: session.user.email } },
        { $project: {
            history: { $ifNull: ["$history", []] },
            totalCorrectQuizAnswers: { $ifNull: ["$totalCorrectQuizAnswers", 0] },
            totalQuizQuestionsAnswered: { $ifNull: ["$totalQuizQuestionsAnswered", 0] }
        }},
        { $unwind: { path: "$history", preserveNullAndEmptyArrays: true } },
        { $group: {
            _id: "$_id",
            totalAnalyses: { $sum: { $cond: [{ $ifNull: ["$history.id", false] }, 1, 0] } },
            fakeCount: { 
                $sum: { $cond: [{ $eq: ["$history.result.isLikelyFake", true] }, 1, 0] }
            },
            totalCorrectQuizAnswers: { $first: "$totalCorrectQuizAnswers" },
            totalQuizQuestionsAnswered: { $first: "$totalQuizQuestionsAnswered" }
        }}
    ]).toArray();

    if (statsAggregation.length === 0) {
        // Handle case for a user that might not be in the DB (highly unlikely if they have a session)
        return NextResponse.json({ 
            totalAnalyses: 0, 
            fakeCount: 0, 
            authenticCount: 0, 
            quizAccuracy: 0, 
            totalQuizQuestionsAnswered: 0 
        });
    }

    const stats = statsAggregation[0];
    const authenticCount = stats.totalAnalyses - stats.fakeCount;
    const quizAccuracy = stats.totalQuizQuestionsAnswered > 0 
        ? Math.round((stats.totalCorrectQuizAnswers / stats.totalQuizQuestionsAnswered) * 100) 
        : 0;

    return NextResponse.json({
        totalAnalyses: stats.totalAnalyses,
        fakeCount: stats.fakeCount,
        authenticCount,
        quizAccuracy,
        totalQuizQuestionsAnswered: stats.totalQuizQuestionsAnswered
    });

  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}