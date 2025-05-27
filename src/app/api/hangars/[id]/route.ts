import prisma, { convertBigIntToNumber } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/hangars/[id] - Récupérer un hangar spécifique
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const hangarId = params.id;
    
    const hangar = await prisma.hangar.findUnique({
      where: { id: Number(hangarId) },
      include: {
        batches: true,
        interventions: true,
        kpis: true,
      },
    });

    if (!hangar) {
      return NextResponse.json({ error: 'Hangar not found' }, { status: 404 });
    }

    // Convertir les BigInt en nombres pour la sérialisation JSON
    const hangarWithoutBigInt = convertBigIntToNumber(hangar);

    return NextResponse.json(hangarWithoutBigInt);
  } catch (error) {
    console.error('Error fetching hangar:', error);
    return NextResponse.json({ error: 'Error fetching hangar' }, { status: 500 });
  }
}

// PUT /api/hangars/[id] - Mettre à jour un hangar
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const hangarId = params.id;
    const body = await request.json();
    const { name, location, capacity, status } = body;

    const existingHangar = await prisma.hangar.findUnique({
      where: { id: Number(hangarId) },
    });

    if (!existingHangar) {
      return NextResponse.json({ error: 'Hangar not found' }, { status: 404 });
    }

    const updatedHangar = await prisma.hangar.update({
      where: { id: Number(hangarId) },
      data: {
        name,
        location,
        capacity,
        status,
      },
    });

    // Convertir les BigInt en nombres pour la sérialisation JSON
    const hangarWithoutBigInt = convertBigIntToNumber(updatedHangar);

    return NextResponse.json(hangarWithoutBigInt);
  } catch (error) {
    console.error('Error updating hangar:', error);
    return NextResponse.json({ error: 'Error updating hangar' }, { status: 500 });
  }
}

// DELETE /api/hangars/[id] - Supprimer un hangar
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const hangarId = params.id;

    const existingHangar = await prisma.hangar.findUnique({
      where: { id: Number(hangarId) },
    });

    if (!existingHangar) {
      return NextResponse.json({ error: 'Hangar not found' }, { status: 404 });
    }

    // Vérifier s'il y a des lots associés au hangar
    const batchCount = await prisma.batch.count({
      where: { hangarId: Number(hangarId) },
    });

    if (batchCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete hangar with associated batches' 
      }, { status: 400 });
    }

    await prisma.hangar.delete({
      where: { id: Number(hangarId) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hangar:', error);
    return NextResponse.json({ error: 'Error deleting hangar' }, { status: 500 });
  }
}
