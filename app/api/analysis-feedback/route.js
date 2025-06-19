import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from 'mongodb';

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const { analysisId, feedback } = await request.json();

        if (!analysisId || !feedback) {
            return NextResponse.json({ error: "Analysis ID and feedback are required." }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        // This document will be saved to your database
        const feedbackDocument = {
            analysisId: analysisId,
            userId: new ObjectId(session.user.id),
            userEmail: session.user.email,
            feedback: feedback,
            createdAt: new Date(),
        };

        // This line inserts the feedback into a 'feedbacks' collection
        await db.collection("feedbacks").insertOne(feedbackDocument);

        return NextResponse.json({ message: "Thank you for your feedback!" }, { status: 200 });

    } catch (error) {
        console.error("[API /analysis-feedback] Error:", error);
        return NextResponse.json({ error: "An error occurred while submitting feedback." }, { status: 500 });
    }
}