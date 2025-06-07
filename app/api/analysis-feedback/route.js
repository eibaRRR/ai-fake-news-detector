import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
    const session = await getServerSession(authOptions);


    if (!session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const { analysisId, feedback } = await request.json();

        if (!analysisId || !feedback) {
            return NextResponse.json({ error: "Analysis ID and feedback are required." }, { status: 400 });
        }

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
