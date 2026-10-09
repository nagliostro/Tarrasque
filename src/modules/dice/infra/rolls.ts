import { prisma } from '@/platform/db';
import { HISTORY_SIZE, type RollView } from '../domain/dice';

interface Row {
  id: string;
  notation: string;
  total: number;
  values: number[];
  dice: unknown;
  createdAt: Date;
}

export function toView(row: Row): RollView {
  return {
    id: row.id,
    notation: row.notation,
    total: row.total,
    values: row.values,
    dice: Array.isArray(row.dice) ? row.dice.filter((n): n is number => typeof n === 'number') : [],
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listRolls(userId: string): Promise<RollView[]> {
  const rows = await prisma.diceRoll.findMany({
    where: { userId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: HISTORY_SIZE,
  });
  return rows.map(toView);
}

/** Mantém só as últimas HISTORY_SIZE rolagens do usuário. */
export async function pruneRolls(userId: string): Promise<void> {
  const keep = await prisma.diceRoll.findMany({
    where: { userId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: HISTORY_SIZE,
    select: { id: true },
  });
  await prisma.diceRoll.deleteMany({ where: { userId, id: { notIn: keep.map((r) => r.id) } } });
}
