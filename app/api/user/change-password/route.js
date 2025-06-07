import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import bcrypt from 'bcryptjs';

export async function PATCH(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: "All password fields are required." }, { status: 400 });
    }

    if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters long." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({ email: session.user.email });

    if (!user) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Verify the current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
        return NextResponse.json({ error: "Incorrect current password." }, { status: 403 });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: { password: hashedNewPassword } }
    );

    return NextResponse.json({ message: "Password updated successfully." }, { status: 200 });

  } catch (error) {
    console.error("Change Password Error:", error);
    return NextResponse.json({ error: "An error occurred while changing the password." }, { status: 500 });
  }
}