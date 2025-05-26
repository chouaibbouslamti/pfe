import prisma, { convertBigIntToNumber } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/batches - Récupérer tous les lots
export async function GET(request: Request) {
  try {
    // Permettre le filtrage par hangarId
    const { searchParams } = new URL(request.url);
    const hangarId = searchParams.get('hangarId');
    
    const where = hangarId ? { hangarId: Number(hangarId) } : {};

    const batches = await prisma.batch.findMany({
      where,
      include: {
        hangar: true,
        team: true,
        alerts: true,
      },
    });

    // Convertir les BigInt en nombres pour la sérialisation JSON
    const batchesWithoutBigInt = convertBigIntToNumber(batches);

    return NextResponse.json(batchesWithoutBigInt);
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json({ error: 'Error fetching batches' }, { status: 500 });
  }
}

// POST /api/batches - Créer un nouveau lot
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      fertilizerType, 
      maxStorageDays, 
      stockedDate, 
      expectedTransportDate,
      hangarId,
      teamId 
    } = body;

    const batch = await prisma.batch.create({
      data: {
        fertilizerType,
        maxStorageDays,
        stockedDate: new Date(stockedDate),
        expectedTransportDate: expectedTransportDate ? new Date(expectedTransportDate) : null,
        hangarId: Number(hangarId),
        teamId: teamId ? Number(teamId) : null,
      },
    });

    // Convertir les BigInt en nombres pour la sérialisation JSON
    const batchWithoutBigInt = convertBigIntToNumber(batch);

    return NextResponse.json(batchWithoutBigInt, { status: 201 });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json({ error: 'Error creating batch' }, { status: 500 });
  }
}
