import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
    const session = await getServerSession(authOptions);

    // Secure this route for admins only
    if (session?.user?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    const skip = (page - 1) * limit;

    try {
        const client = await clientPromise;
        const db = client.db();

        // This query fetches feedback and joins it with the original analysis data
        const feedbacks = await db.collection("feedbacks").aggregate([
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "users",
                let: { analysis_id: "$analysisId" },
                pipeline: [
                  { $unwind: "$history" },
                  { $match: { $expr: { $eq: ["$history.id", "$$analysis_id"] } } },
                  { $project: { _id: 0, analysis: "$history" } }
                ],
                as: "analysisInfo"
              }
            },
            { $unwind: { path: "$analysisInfo", preserveNullAndEmptyArrays: true } }
        ]).toArray();
        
        const totalFeedbacks = await db.collection("feedbacks").countDocuments();

        return NextResponse.json({ 
            feedbacks,
            totalPages: Math.ceil(totalFeedbacks / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("[API /admin/feedback] Error:", error);
        return NextResponse.json({ error: "An error occurred while fetching feedback." }, { status: 500 });
    }
}