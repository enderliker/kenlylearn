import { test, describe, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/db/index.ts';
import { users, subjects, materials } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';
import { 
  createMaterial, 
  listMaterials, 
  getMaterialById, 
  deleteMaterial,
  UnauthorizedSubjectAccessError,
  MaterialNotFoundError
} from '../src/lib/materials/materials-service.ts';

describe('Multi-Tenant Materials Service Suite (TDD)', () => {
  const userA = {
    id: 'user-tdd-alpha-' + Date.now(),
    name: 'Student Alpha',
    email: 'alpha-' + Date.now() + '@kenlylearn.io',
  };

  const userB = {
    id: 'user-tdd-beta-' + Date.now(),
    name: 'Student Beta',
    email: 'beta-' + Date.now() + '@kenlylearn.io',
  };

  const subjectA = {
    id: 'sub-tdd-alpha-' + Date.now(),
    userId: userA.id,
    name: 'Distributed Systems',
  };

  const subjectB = {
    id: 'sub-tdd-beta-' + Date.now(),
    userId: userB.id,
    name: 'Molecular Biology',
  };

  before(async () => {
    // Seed test users
    await db.insert(users).values([userA, userB]);
    // Seed subjects
    await db.insert(subjects).values([subjectA, subjectB]);
  });

  test('successfully creates a user-scoped material record', async () => {
    const created = await createMaterial({
      userId: userA.id,
      title: 'Paxos Made Simple',
      fileName: 'paxos.pdf',
      fileType: 'pdf',
      fileSize: 1024,
      extractedText: 'Paxos algorithm guarantees consensus under partial synchrony.',
      tokenEstimate: 12,
      subjectId: subjectA.id,
    });

    assert.ok(created.id);
    assert.equal(created.userId, userA.id);
    assert.equal(created.title, 'Paxos Made Simple');
    assert.equal(created.tokenEstimate, 12);
  });

  test('enforces strict multi-tenant isolation (Anti-IDOR) on subjectId', async () => {
    // User A attempts to link a material to User B's subject
    await assert.rejects(
      async () => {
        await createMaterial({
          userId: userA.id,
          title: 'Illegitimate Subject Link',
          fileName: 'notes.txt',
          fileType: 'text',
          extractedText: 'Should fail IDOR check',
          subjectId: subjectB.id, // Belongs to User B!
        });
      },
      (err) => err instanceof UnauthorizedSubjectAccessError
    );
  });

  test('listMaterials strictly isolates records by authenticated userId', async () => {
    // List for User A
    const listA = await listMaterials({ userId: userA.id });
    assert.ok(listA.length >= 1);
    assert.ok(listA.every((m) => m.userId === userA.id));

    // List for User B
    const listB = await listMaterials({ userId: userB.id });
    assert.equal(listB.length, 0);
  });

  test('getMaterialById prevents cross-tenant access to another user material', async () => {
    const materialA = await createMaterial({
      userId: userA.id,
      title: 'Private Lecture Notes',
      fileName: 'lecture.txt',
      fileType: 'text',
      extractedText: 'Private confidential study content.',
    });

    // User A can fetch it
    const fetched = await getMaterialById({ userId: userA.id, materialId: materialA.id });
    assert.equal(fetched.id, materialA.id);

    // User B CANNOT fetch User A's material (returns MaterialNotFoundError or throws)
    await assert.rejects(
      async () => {
        await getMaterialById({ userId: userB.id, materialId: materialA.id });
      },
      (err) => err instanceof MaterialNotFoundError
    );
  });

  test('deleteMaterial only permits deletion by resource owner', async () => {
    const material = await createMaterial({
      userId: userA.id,
      title: 'Temporary Notes',
      fileName: 'temp.txt',
      fileType: 'text',
      extractedText: 'Temporary text',
    });

    // User B attempts to delete User A's material -> fails
    await assert.rejects(
      async () => {
        await deleteMaterial({ userId: userB.id, materialId: material.id });
      },
      (err) => err instanceof MaterialNotFoundError
    );

    // User A successfully deletes it
    const deleted = await deleteMaterial({ userId: userA.id, materialId: material.id });
    assert.equal(deleted.id, material.id);

    // Subsequent retrieval fails
    await assert.rejects(
      async () => {
        await getMaterialById({ userId: userA.id, materialId: material.id });
      },
      (err) => err instanceof MaterialNotFoundError
    );
  });
});
