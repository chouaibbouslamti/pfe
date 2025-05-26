import prisma, { convertBigIntToNumber } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/hangars - Récupérer tous les hangars
export async function GET() {
  try {
    const hangars = await prisma.hangar.findMany({
      include: {
        batches: true,
        interventions: true,
        kpis: true,
      },
    });

    // Convertir les BigInt en nombres pour la sérialisation JSON
    const hangarsWithoutBigInt = convertBigIntToNumber(hangars);

    return NextResponse.json(hangarsWithoutBigInt);
  } catch (error) {
    console.error('Error fetching hangars:', error);
    return NextResponse.json({ error: 'Error fetching hangars' }, { status: 500 });
  }
}

// POST /api/hangars - Créer un nouveau hangar
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, location, capacity, status } = body;

    const hangar = await prisma.hangar.create({
      data: {
        name,
        location,
        capacity,
        status,
      },
    });

    // Convertir les BigInt en nombres pour la sérialisation JSON
    const hangarWithoutBigInt = convertBigIntToNumber(hangar);

    return NextResponse.json(hangarWithoutBigInt, { status: 201 });
  } catch (error) {
    console.error('Error creating hangar:', error);
    return NextResponse.json({ error: 'Error creating hangar' }, { status: 500 });
  }
}
