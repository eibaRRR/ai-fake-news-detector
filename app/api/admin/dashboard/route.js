import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userPage = parseInt(searchParams.get('userPage') || '1', 10);
    const feedbackPage = parseInt(searchParams.get('feedbackPage') || '1', 10);
    const searchTerm = searchParams.get('search') || '';
    
    const usersLimit = 10;
    const feedbackLimit = 5;

    try {
        const client = await clientPromise;
        const db = client.db();

        const userSearchFilter = searchTerm ? {
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } }
            ]
        } : {};

        // Run all database queries at the same time for better performance
        const [
            totalUsers,
            analysesResult,
            pagedUsers,
            pagedFeedbacks,
            totalFeedbacks
        ] = await Promise.all([
            db.collection("users").countDocuments(userSearchFilter),
            db.collection("users").aggregate([ { $unwind: "$history" }, { $count: "total" } ]).toArray(),
            db.collection("users").find(userSearchFilter).sort({ createdAt: -1 }).skip((userPage - 1) * usersLimit).limit(usersLimit).project({ name: 1, email: 1, createdAt: 1, image: 1 }).toArray(),
            db.collection("feedbacks").aggregate([
                { $sort: { createdAt: -1 } },
                { $skip: (feedbackPage - 1) * feedbackLimit },
                { $limit: feedbackLimit },
                { $lookup: { from: "users", let: { analysis_id: "$analysisId" }, pipeline: [ { $unwind: "$history" }, { $match: { $expr: { $eq: ["$history.id", "$$analysis_id"] } } }, { $project: { _id: 0, analysis: "$history" } } ], as: "analysisInfo" } },
                { $unwind: { path: "$analysisInfo", preserveNullAndEmptyArrays: true } }
            ]).toArray(),
            db.collection("feedbacks").countDocuments()
        ]);

        return NextResponse.json({
            stats: {
                totalUsers: totalUsers,
                totalAnalyses: analysesResult[0]?.total || 0,
            },
            users: {
                list: pagedUsers,
                totalPages: Math.ceil(totalUsers / usersLimit),
                currentPage: userPage,
            },
            feedback: {
                list: pagedFeedbacks,
                totalPages: Math.ceil(totalFeedbacks / feedbackLimit),
                currentPage: feedbackPage,
            }
        });

    } catch (error) {
        console.error("Admin Dashboard API Error:", error);
        return NextResponse.json({ error: "An error occurred while fetching admin data." }, { status: 500 });
    }
}