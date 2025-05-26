import prisma, { convertBigIntToNumber } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// GET /api/users - Récupérer tous les utilisateurs
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        team: true,
        TeamMember: true,
      },
    });

    // Convertir les BigInt en nombres pour la sérialisation JSON
    const usersWithoutBigInt = convertBigIntToNumber(users);

    // Ne pas renvoyer les mots de passe
    const usersWithoutPasswords = usersWithoutBigInt.map((user: any) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return NextResponse.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
  }
}

// POST /api/users - Créer un nouvel utilisateur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, username, phoneNumber, role, teamId, isActive, isApproved } = body;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    // Vérifier si le nom d'utilisateur existe déjà
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username,
        phoneNumber,
        role: role || 'USER',
        isActive: isActive !== undefined ? isActive : true,
        isApproved: isApproved !== undefined ? isApproved : true,
        teamId: teamId ? BigInt(teamId) : null,
        createdAt: new Date(),
        lastLogin: null,
      },
    });

    // Si un teamId est fourni, ajouter l'utilisateur comme membre de l'équipe
    if (teamId) {
      await prisma.teamMember.create({
        data: {
          teamId: BigInt(teamId),
          userId: user.id,
        },
      });
    }

    // Ne pas renvoyer le mot de passe
    const userWithoutPassword = convertBigIntToNumber(user);
    const { password: _, ...userToReturn } = userWithoutPassword;

    return NextResponse.json(userToReturn, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
  }
}

// PATCH /api/users - Mettre à jour un utilisateur existant
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Si le mot de passe est fourni, le hasher
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Convertir teamId en BigInt si présent
    if (updateData.teamId) {
      updateData.teamId = BigInt(updateData.teamId);
    }

    // Mettre à jour l'utilisateur
    const user = await prisma.user.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    // Ne pas renvoyer le mot de passe
    const userWithoutPassword = convertBigIntToNumber(user);
    const { password: _, ...userToReturn } = userWithoutPassword;

    return NextResponse.json(userToReturn);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  }
}
