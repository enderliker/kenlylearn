import { db } from '@/db';
import { materials, subjects } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'node:crypto';
import { estimateTokens } from '@/lib/ingestion/extractor';

export class UnauthorizedSubjectAccessError extends Error {
  constructor(subjectId: string) {
    super(`Access denied to subject '${subjectId}': resource is not owned by the authenticated user.`);
    this.name = 'UnauthorizedSubjectAccessError';
  }
}

export class MaterialNotFoundError extends Error {
  constructor(materialId: string) {
    super(`Material '${materialId}' was not found or access is unauthorized.`);
    this.name = 'MaterialNotFoundError';
  }
}

export interface CreateMaterialParams {
  userId: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  filePath?: string;
  extractedText: string;
  tokenEstimate?: number;
  subjectId?: string;
}

export interface ListMaterialsParams {
  userId: string;
  subjectId?: string;
}

export interface MaterialIdentifier {
  userId: string;
  materialId: string;
}

/**
 * Creates a new material record scoped to the authenticated user.
 * Validates ownership of subjectId if provided to protect against IDOR vulnerabilities.
 */
export async function createMaterial(params: CreateMaterialParams) {
  const {
    userId,
    title,
    fileName,
    fileType,
    fileSize = 0,
    filePath,
    extractedText,
    tokenEstimate = estimateTokens(extractedText),
    subjectId,
  } = params;

  // Anti-IDOR: verify subject ownership
  if (subjectId) {
    const [subject] = await db
      .select({ id: subjects.id, userId: subjects.userId })
      .from(subjects)
      .where(and(eq(subjects.id, subjectId), eq(subjects.userId, userId)))
      .limit(1);

    if (!subject) {
      throw new UnauthorizedSubjectAccessError(subjectId);
    }
  }

  const id = crypto.randomUUID();
  const [created] = await db
    .insert(materials)
    .values({
      id,
      userId,
      subjectId: subjectId || null,
      title: title.trim(),
      fileName: fileName.trim(),
      fileType: fileType.trim(),
      fileSize,
      filePath: filePath || null,
      extractedText,
      tokenEstimate,
    })
    .returning();

  return created;
}

/**
 * Lists materials strictly belonging to the authenticated user.
 */
export async function listMaterials(params: ListMaterialsParams) {
  const { userId, subjectId } = params;

  if (subjectId) {
    return db
      .select()
      .from(materials)
      .where(and(eq(materials.userId, userId), eq(materials.subjectId, subjectId)))
      .orderBy(desc(materials.createdAt));
  }

  return db
    .select()
    .from(materials)
    .where(eq(materials.userId, userId))
    .orderBy(desc(materials.createdAt));
}

/**
 * Fetches a single material record ensuring multi-tenant isolation.
 */
export async function getMaterialById(params: MaterialIdentifier) {
  const { userId, materialId } = params;

  const [record] = await db
    .select()
    .from(materials)
    .where(and(eq(materials.id, materialId), eq(materials.userId, userId)))
    .limit(1);

  if (!record) {
    throw new MaterialNotFoundError(materialId);
  }

  return record;
}

/**
 * Deletes a material record strictly belonging to the authenticated user.
 */
export async function deleteMaterial(params: MaterialIdentifier) {
  const { userId, materialId } = params;

  // Verify ownership before deleting
  const existing = await getMaterialById({ userId, materialId });

  await db
    .delete(materials)
    .where(and(eq(materials.id, materialId), eq(materials.userId, userId)));

  return existing;
}
