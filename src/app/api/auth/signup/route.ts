
import prisma, { convertBigIntToNumber } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import type { UserProfile } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, username, phoneNumber } = body;

    if (!email || !password || !firstName || !lastName || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingUserByEmail) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const existingUserByUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUserByUsername) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username,
        phoneNumber,
        role: 'USER', // Default role
        isActive: true,
        isApproved: true, // Auto-approve for this setup
        createdAt: new Date(),
        lastLogin: new Date(),
      },
    });

    // Conversion automatique des BigInt en nombres pour la sérialisation JSON
    const userToReturn = convertBigIntToNumber(newUser) as unknown as UserProfile;


    return NextResponse.json({ user: userToReturn }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
