import prisma, { convertBigIntToNumber } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/interventions - Récupérer toutes les interventions
export async function GET(request: Request) {
  try {
    // Permettre le filtrage par hangarId ou teamId
    const { searchParams } = new URL(request.url);
    const hangarId = searchParams.get('hangarId');
    const teamId = searchParams.get('teamId');
    
    const where: any = {};
    if (hangarId) where.hangarId = Number(hangarId);
    if (teamId) where.teamId = Number(teamId);

    const interventions = await prisma.intervention.findMany({
      where,
      include: {
        hangar: true,
        team: true,
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    });

    // Convertir les BigInt en nombres pour la sérialisation JSON
    const interventionsWithoutBigInt = convertBigIntToNumber(interventions);

    return NextResponse.json(interventionsWithoutBigInt);
  } catch (error) {
    console.error('Error fetching interventions:', error);
    return NextResponse.json({ error: 'Error fetching interventions' }, { status: 500 });
  }
}

// POST /api/interventions - Créer une nouvelle intervention
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      description, 
      scheduledTime, 
      expectedResolutionTime, 
      hangarId, 
      teamId,
      batchId
    } = body;

    const intervention = await prisma.intervention.create({
      data: {
        description,
        scheduledTime: new Date(scheduledTime),
        expectedResolutionTime: expectedResolutionTime ? new Date(expectedResolutionTime) : undefined,
        hangarId: Number(hangarId),
        teamId: Number(teamId),
        batchId: batchId ? Number(batchId) : undefined,
      },
      include: {
        hangar: true,
        team: true,
      },
    });

    // Convertir les BigInt en nombres pour la sérialisation JSON
    const interventionWithoutBigInt = convertBigIntToNumber(intervention);

    return NextResponse.json(interventionWithoutBigInt, { status: 201 });
  } catch (error) {
    console.error('Error creating intervention:', error);
    return NextResponse.json({ error: 'Error creating intervention' }, { status: 500 });
  }
}
