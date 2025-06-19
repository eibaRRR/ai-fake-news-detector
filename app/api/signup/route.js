import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import clientPromise from "@/lib/mongodb";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
        return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
        return NextResponse.json({ error: "User with this email already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user with a default role
    await db.collection('users').insertOne({
        name,
        email,
        password: hashedPassword,
        role: 'user', // <-- FIX: Assign a default role of 'user'
        createdAt: new Date(),
    });

    return NextResponse.json({ message: "User created successfully." }, { status: 201 });

  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ error: "An error occurred during sign up." }, { status: 500 });
  }
}