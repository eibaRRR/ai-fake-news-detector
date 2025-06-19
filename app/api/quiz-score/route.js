import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { score, totalQuestions } = await request.json();
    
    if (typeof score !== 'number' || typeof totalQuestions !== 'number') {
        return NextResponse.json({ error: "Invalid score data." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    // Use the $inc operator to increment the user's total scores and questions answered
    await db.collection("users").updateOne(
      { email: session.user.email },
      { 
        $inc: { 
            totalCorrectQuizAnswers: score,
            totalQuizQuestionsAnswered: totalQuestions 
        }
      }
    );

    return NextResponse.json({ message: "Quiz score saved successfully." }, { status: 200 });

  } catch (error) {
    console.error("Failed to save quiz score:", error);
    return NextResponse.json({ error: "Failed to save quiz score." }, { status: 500 });
  }
}