import prisma, { convertBigIntToNumber } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// PUT /api/teams/[id]/members - Mettre à jour les membres d'une équipe
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { members } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }
    
    // Vérifier si l'équipe existe
    const existingTeam = await prisma.team.findUnique({
      where: { id: BigInt(id) },
      include: {
        users: {
          where: {
            role: 'TEAM_MANAGER'
          }
        },
        TeamMember: true
      }
    });
    
    if (!existingTeam) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    // Récupérer l'ID du manager (qui doit toujours être membre de l'équipe)
    let managerId = null;
    if (existingTeam.users.length > 0) {
      managerId = existingTeam.users[0].id;
    }
    
    // Convertir tous les membres en BigInt pour la base de données
    const memberIds = members.map((m: string) => BigInt(m));
    
    // S'assurer que le manager est inclus dans les membres
    if (managerId && !memberIds.some(id => id.toString() === managerId.toString())) {
      memberIds.push(managerId);
    }
    
    // Supprimer tous les membres actuels
    await prisma.teamMember.deleteMany({
      where: {
        teamId: BigInt(id)
      }
    });
    
    // Créer de nouvelles entrées pour tous les membres sélectionnés
    const memberPromises = memberIds.map(userId => {
      return prisma.teamMember.create({
        data: {
          teamId: BigInt(id),
          userId
        }
      });
    });
    
    await Promise.all(memberPromises);
    
    // Récupérer l'équipe mise à jour avec ses relations
    const updatedTeam = await prisma.team.findUnique({
      where: { id: BigInt(id) },
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
    const teamWithoutBigInt = convertBigIntToNumber(updatedTeam);
    
    return NextResponse.json(teamWithoutBigInt);
  } catch (error) {
    console.error('Error updating team members:', error);
    return NextResponse.json({ error: 'Error updating team members' }, { status: 500 });
  }
}

// GET /api/teams/[id]/members - Récupérer tous les membres d'une équipe
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }
    
    const members = await prisma.teamMember.findMany({
      where: { teamId: BigInt(id) },
      include: {
        user: true
      }
    });
    
    // Convertir les BigInt en nombres pour la sérialisation JSON
    const membersWithoutBigInt = convertBigIntToNumber(members);
    
    return NextResponse.json(membersWithoutBigInt);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Error fetching team members' }, { status: 500 });
  }
}
