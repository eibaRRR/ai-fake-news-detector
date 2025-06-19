import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from 'mongodb';

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  // 1. Ensure the user is an admin
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Validate the user ID from the URL
  if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }
    
  // 3. Prevent an admin from deleting their own account
  if (session.user.id === id) {
      return NextResponse.json({ error: "You cannot delete your own account from the admin dashboard." }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const userIdToDelete = new ObjectId(id);

    // 4. Delete the user from the 'users' collection
    const deleteUserResult = await db.collection("users").deleteOne({ _id: userIdToDelete });
    
    if (deleteUserResult.deletedCount === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 5. Clean up associated data for data integrity
    await db.collection("accounts").deleteMany({ userId: userIdToDelete });
    await db.collection("sessions").deleteMany({ userId: userIdToDelete });

    return NextResponse.json({ message: "User and all associated data deleted successfully." });

  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "An error occurred while deleting the user." }, { status: 500 });
  }
}