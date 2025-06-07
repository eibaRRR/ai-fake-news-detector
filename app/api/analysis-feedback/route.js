import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
    const session = await getServerSession(authOptions);

    // Although we're not saving to the DB yet, checking for a session is good practice
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const { analysisId, feedback } = await request.json();

        if (!analysisId || !feedback) {
            return NextResponse.json({ error: "Analysis ID and feedback are required." }, { status: 400 });
        }

        // In a real-world scenario, you would save this feedback to your database,
        // linking it to the analysis and the user.
        // For now, we'll just log it to the server console to demonstrate functionality.
        console.log(`[Feedback Received]
- User: ${session.user.email}
- Analysis ID: ${analysisId}
- Feedback: ${feedback}`);

        return NextResponse.json({ message: "Thank you for your feedback!" }, { status: 200 });

    } catch (error) {
        console.error("[API /analysis-feedback] Error:", error);
        return NextResponse.json({ error: "An error occurred while submitting feedback." }, { status: 500 });
    }
}