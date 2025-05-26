import prisma, { convertBigIntToNumber } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/teams - Récupérer toutes les équipes
export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        users: true,
        TeamMember: {
          include: {
            user: true
          }
        }
      },
    });

    // Convertir les BigInt en nombres pour la sérialisation JSON
    const teamsWithoutBigInt = convertBigIntToNumber(teams);

    return NextResponse.json(teamsWithoutBigInt);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Error fetching teams' }, { status: 500 });
  }
}

// POST /api/teams - Créer une nouvelle équipe
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contact, managerId } = body;

    // Créer l'équipe
    const team = await prisma.team.create({
      data: {
        name,
        contact: contact || null,
      },
    });

    // Si un managerId est fourni, mettre à jour l'utilisateur avec le teamId et le rôle
    if (managerId) {
      await prisma.user.update({
        where: { id: BigInt(managerId) },
        data: {
          teamId: team.id,
          role: 'TEAM_MANAGER'
        }
      });

      // Ajouter le manager comme membre de l'équipe
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: BigInt(managerId)
        }
      });
    }

    // Récupérer l'équipe avec ses relations
    const createdTeam = await prisma.team.findUnique({
      where: { id: team.id },
      include: {
        users: true,
        TeamMember: {
          include: {
            user: true
          }
        }
      }
    });

    // Convertir les BigInt en nombres pour la sérialisation JSON
    const teamWithoutBigInt = convertBigIntToNumber(createdTeam);

    return NextResponse.json(teamWithoutBigInt, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Error creating team' }, { status: 500 });
  }
}
