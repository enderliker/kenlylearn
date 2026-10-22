import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { 
  createMaterial, 
  listMaterials, 
  UnauthorizedSubjectAccessError 
} from '@/lib/materials/materials-service';
import { 
  extractTextFromDocument, 
  UnsupportedFileTypeError, 
  FileSizeLimitError, 
  CorruptedFileError 
} from '@/lib/ingestion/extractor';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId') || undefined;

    const items = await listMaterials({
      userId: session.user.id,
      subjectId,
    });

    return NextResponse.json({
      success: true,
      materials: items,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve materials' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';

    // Handle Multipart Form Upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      const subjectId = (formData.get('subjectId') as string) || undefined;
      const customTitle = (formData.get('title') as string) || undefined;

      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: 'A valid file must be provided in the form data' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type || 'text/plain';
      const fileName = file.name || 'document.txt';

      const extracted = await extractTextFromDocument({
        buffer,
        mimeType,
        filename: fileName,
      });

      // Determine clean database fileType tag
      let fileType = 'text';
      if (mimeType.includes('pdf')) {
        fileType = 'pdf';
      } else if (mimeType.startsWith('image/')) {
        fileType = 'image';
      }

      const material = await createMaterial({
        userId: session.user.id,
        title: customTitle?.trim() || extracted.title,
        fileName,
        fileType,
        fileSize: buffer.length,
        extractedText: extracted.text,
        tokenEstimate: extracted.estimatedTokens,
        subjectId,
      });

      return NextResponse.json(
        {
          success: true,
          material: {
            id: material.id,
            title: material.title,
            fileName: material.fileName,
            fileType: material.fileType,
            fileSize: material.fileSize,
            tokenEstimate: material.tokenEstimate,
            pageCount: extracted.pageCount,
            wordCount: extracted.wordCount,
            subjectId: material.subjectId,
            createdAt: material.createdAt,
          },
        },
        { status: 201 }
      );
    }

    // Handle JSON Payload
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { title, content, fileName, fileType = 'text', subjectId } = body;

      if (!title || !content || typeof content !== 'string') {
        return NextResponse.json(
          { error: 'Fields title and content are required' },
          { status: 400 }
        );
      }

      const material = await createMaterial({
        userId: session.user.id,
        title: title.trim(),
        fileName: fileName || `${title.toLowerCase().replace(/\s+/g, '-')}.txt`,
        fileType,
        fileSize: Buffer.byteLength(content, 'utf-8'),
        extractedText: content,
        subjectId,
      });

      return NextResponse.json(
        {
          success: true,
          material,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: 'Unsupported Content-Type header' },
      { status: 415 }
    );
  } catch (err: unknown) {
    if (err instanceof UnauthorizedSubjectAccessError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    if (
      err instanceof UnsupportedFileTypeError ||
      err instanceof FileSizeLimitError ||
      err instanceof CorruptedFileError
    ) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error processing material' }, { status: 500 });
  }
}
