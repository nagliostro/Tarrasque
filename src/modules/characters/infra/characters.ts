import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/platform/db';
import { MAX_CHARACTERS_PER_USER, type CharacterSummary, type Sheet } from '../domain/sheet';

/** Mais recentes por último, como no legado (novos entram no fim da lista). */
export async function listCharacters(userId: string): Promise<CharacterSummary[]> {
  return prisma.character.findMany({
    where: { userId },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: { id: true, name: true, summary: true },
    take: MAX_CHARACTERS_PER_USER,
  });
}

export async function readSheet(userId: string, id: string): Promise<Sheet | null> {
  const row = await prisma.character.findFirst({ where: { id, userId }, select: { sheet: true } });
  const sheet = row?.sheet;
  return sheet !== null && typeof sheet === 'object' && !Array.isArray(sheet)
    ? (sheet as Sheet)
    : null;
}

export const countCharacters = (userId: string) => prisma.character.count({ where: { userId } });

export const createCharacter = (userId: string, name: string, summary: string, sheet: Sheet) =>
  prisma.character.create({
    data: { userId, name, summary, sheet: sheet as Prisma.InputJsonObject },
    select: { id: true },
  });

export async function updateCharacter(
  userId: string,
  id: string,
  name: string,
  summary: string,
  sheet: Sheet,
): Promise<boolean> {
  const { count } = await prisma.character.updateMany({
    where: { id, userId },
    data: { name, summary, sheet: sheet as Prisma.InputJsonObject },
  });
  return count > 0;
}

export async function removeCharacter(userId: string, id: string): Promise<boolean> {
  const { count } = await prisma.character.deleteMany({ where: { id, userId } });
  return count > 0;
}
