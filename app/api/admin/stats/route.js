import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get pagination and search parameters from the URL
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const skip = (page - 1) * limit;
  const searchQuery = searchParams.get('search') || '';

  try {
    const client = await clientPromise;
    const db = client.db();

    // Create a filter object for the database query
    const filter = {};
    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive search on name
        { email: { $regex: searchQuery, $options: 'i' } } // Case-insensitive search on email
      ];
    }

    // Fetch total number of users that match the filter
    const totalUsers = await db.collection("users").countDocuments(filter);
    
    // Fetch total analyses (this remains the same)
    const analysisStats = await db.collection("users").aggregate([
      { $project: { historyCount: { $size: { $ifNull: ["$history", []] } } } },
      { $group: { _id: null, totalAnalyses: { $sum: "$historyCount" } } }
    ]).toArray();
    const totalAnalyses = analysisStats.length > 0 ? analysisStats[0].totalAnalyses : 0;
    
    // Fetch a paginated list of users that match the filter
    const allUsers = await db.collection("users").find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .project({ name: 1, email: 1, createdAt: 1, image: 1 })
      .toArray();

    return NextResponse.json({
      totalUsers,
      totalAnalyses,
      users: allUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page
    });

  } catch (error) {
    console.error("[API /admin/stats] Error:", error);
    return NextResponse.json({ error: "An error occurred while fetching admin statistics." }, { status: 500 });
  }
}