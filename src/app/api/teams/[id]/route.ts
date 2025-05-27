import prisma, { convertBigIntToNumber } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/teams/[id] - Récupérer une équipe par son ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }
    
    const team = await prisma.team.findUnique({
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
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    // Convertir les BigInt en nombres pour la sérialisation JSON
    const teamWithoutBigInt = convertBigIntToNumber(team);
    
    return NextResponse.json(teamWithoutBigInt);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ error: 'Error fetching team' }, { status: 500 });
  }
}

// PUT /api/teams/[id] - Mettre à jour une équipe
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { name, contact, managerId } = body;
    
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
        }
      }
    });
    
    if (!existingTeam) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    // Mise à jour de l'équipe
    const updatedTeam = await prisma.team.update({
      where: { id: BigInt(id) },
      data: {
        name,
        contact: contact || null,
      },
    });
    
    // Si un nouveau manager est spécifié
    if (managerId) {
      // Réinitialiser l'ancien manager si nécessaire
      if (existingTeam.users.length > 0) {
        const currentManager = existingTeam.users[0];
        await prisma.user.update({
          where: { id: currentManager.id },
          data: {
            teamId: null,
            role: 'USER'
          }
        });
      }
      
      // Définir le nouveau manager
      await prisma.user.update({
        where: { id: BigInt(managerId) },
        data: {
          teamId: BigInt(id),
          role: 'TEAM_MANAGER'
        }
      });
      
      // S'assurer que le manager est membre de l'équipe
      const existingMember = await prisma.teamMember.findFirst({
        where: {
          teamId: BigInt(id),
          userId: BigInt(managerId)
        }
      });
      
      if (!existingMember) {
        await prisma.teamMember.create({
          data: {
            teamId: BigInt(id),
            userId: BigInt(managerId)
          }
        });
      }
    }
    
    // Récupérer l'équipe mise à jour avec ses relations
    const team = await prisma.team.findUnique({
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
    const teamWithoutBigInt = convertBigIntToNumber(team);
    
    return NextResponse.json(teamWithoutBigInt);
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json({ error: 'Error updating team' }, { status: 500 });
  }
}

// DELETE /api/teams/[id] - Supprimer une équipe
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }
    
    // Vérifier si l'équipe existe
    const existingTeam = await prisma.team.findUnique({
      where: { id: BigInt(id) },
      include: {
        users: true,
        TeamMember: true
      }
    });
    
    if (!existingTeam) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    // Mettre à jour les utilisateurs qui sont managers de cette équipe
    await prisma.user.updateMany({
      where: { 
        teamId: BigInt(id),
        role: 'TEAM_MANAGER'
      },
      data: {
        teamId: null,
        role: 'USER'
      }
    });
    
    // Supprimer tous les membres de l'équipe
    await prisma.teamMember.deleteMany({
      where: { teamId: BigInt(id) }
    });
    
    // Supprimer l'équipe
    await prisma.team.delete({
      where: { id: BigInt(id) }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json({ error: 'Error deleting team' }, { status: 500 });
  }
}
