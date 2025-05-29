import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, profilePicture } = body;

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Username already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        password: hashedPassword,
        profilePicture: profilePicture || null,
      },
    });

    return NextResponse.json({ message: "Signup successful", userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
