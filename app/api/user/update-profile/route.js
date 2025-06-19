import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from 'mongodb';

export async function PATCH(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { name } = await request.json();

    if (!name || name.trim().length < 3) {
      return NextResponse.json({ error: "Name must be at least 3 characters long." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Update the user's name in the database
    await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: { name: name.trim() } }
    );

    return NextResponse.json({ message: "Profile updated successfully.", newName: name.trim() });

  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ error: "An error occurred while updating the profile." }, { status: 500 });
  }
}