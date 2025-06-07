import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import clientPromise from "@/lib/mongodb"; // <-- Import the new helper

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
        return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(); // Get the default database
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
        return NextResponse.json({ error: "User with this email already exists." }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    await db.collection('users').insertOne({
        name,
        email,
        password: hashedPassword,
        createdAt: new Date(),
    });

    return NextResponse.json({ message: "User created successfully." }, { status: 201 });

  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ error: "An error occurred during sign up." }, { status: 500 });
  }
}