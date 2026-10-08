'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/modules/identity';
import { prisma } from '@/platform/db';
import {
  collectionKindFor,
  entryInputSchema,
  MAX_ENTRIES_PER_KIND,
  QUOTA_MESSAGE,
  type ActionResult,
  type EntryInput,
} from '../domain/collection';

const NOT_FOUND = 'Registro não encontrado.';
const slugSchema = z.string().min(1).max(40);
const idSchema = z.string().min(1).max(64);

function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Dados inválidos.';
}

function kindOf(slug: string) {
  const parsed = slugSchema.safeParse(slug);
  return parsed.success ? collectionKindFor(parsed.data) : undefined;
}

export async function createEntry(slug: string, input: EntryInput): Promise<ActionResult> {
  const kind = kindOf(slug);
  if (!kind) return { ok: false, error: NOT_FOUND };
  const data = entryInputSchema.safeParse(input);
  if (!data.success) return { ok: false, error: firstError(data.error) };

  const user = await requireUser();
  const total = await prisma.collectionEntry.count({ where: { userId: user.id, kind } });
  if (total >= MAX_ENTRIES_PER_KIND) return { ok: false, error: QUOTA_MESSAGE };
  await prisma.collectionEntry.create({ data: { ...data.data, kind, userId: user.id } });
  revalidatePath('/' + slug);
  return { ok: true };
}

export async function updateEntry(
  slug: string,
  id: string,
  input: EntryInput,
): Promise<ActionResult> {
  const kind = kindOf(slug);
  const parsedId = idSchema.safeParse(id);
  if (!kind || !parsedId.success) return { ok: false, error: NOT_FOUND };
  const data = entryInputSchema.safeParse(input);
  if (!data.success) return { ok: false, error: firstError(data.error) };

  const user = await requireUser();
  const { count } = await prisma.collectionEntry.updateMany({
    where: { id: parsedId.data, userId: user.id, kind },
    data: data.data,
  });
  if (count === 0) return { ok: false, error: NOT_FOUND };
  revalidatePath('/' + slug);
  return { ok: true };
}

export async function deleteEntry(slug: string, id: string): Promise<ActionResult> {
  const kind = kindOf(slug);
  const parsedId = idSchema.safeParse(id);
  if (!kind || !parsedId.success) return { ok: false, error: NOT_FOUND };

  const user = await requireUser();
  const { count } = await prisma.collectionEntry.deleteMany({
    where: { id: parsedId.data, userId: user.id, kind },
  });
  if (count === 0) return { ok: false, error: NOT_FOUND };
  revalidatePath('/' + slug);
  return { ok: true };
}
