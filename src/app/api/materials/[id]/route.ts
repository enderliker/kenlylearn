import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { 
  getMaterialById, 
  deleteMaterial, 
  MaterialNotFoundError 
} from '@/lib/materials/materials-service';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const material = await getMaterialById({
      userId: session.user.id,
      materialId: params.id,
    });

    return NextResponse.json({
      success: true,
      material,
    });
  } catch (err: unknown) {
    if (err instanceof MaterialNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteMaterial({
      userId: session.user.id,
      materialId: params.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Material deleted successfully',
    });
  } catch (err: unknown) {
    if (err instanceof MaterialNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
