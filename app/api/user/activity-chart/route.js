import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from 'mongodb';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        // Get the specific user's document
        const user = await db.collection("users").findOne(
            { _id: new ObjectId(session.user.id) },
            { projection: { history: 1 } } // Only fetch the history field for efficiency
        );

        if (!user || !user.history || user.history.length === 0) {
            return NextResponse.json([]); // Return an empty array if there's no history
        }
        
        // Process the history data to count analyses per day
        const activityByDate = user.history.reduce((acc, item) => {
            const date = new Date(item.id).toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        // Format the data for the chart
        const chartData = Object.entries(activityByDate).map(([date, count]) => ({
            date,
            count
        })).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

        return NextResponse.json(chartData);

    } catch (error) {
        console.error("Fetch Activity Chart Error:", error);
        return NextResponse.json({ error: "An error occurred fetching chart data." }, { status: 500 });
    }
}