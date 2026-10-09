'use server';

import { randomInt } from 'node:crypto';
import { requireUser } from '@/modules/identity';
import { prisma } from '@/platform/db';
import {
  expandDice,
  limitMessage,
  notation,
  overLimit,
  rollDie,
  rollInputSchema,
  type RollInput,
  type RollResult,
} from '../domain/dice';
import { pruneRolls, toView } from '../infra/rolls';

/** A rolagem acontece no servidor (CSPRNG); o cliente só anima e exibe o resultado. */
export async function rollDice(input: RollInput): Promise<RollResult> {
  const parsed = rollInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Rolagem inválida.' };
  const { groups, modifier } = parsed.data;
  const over = overLimit(groups);
  if (over) return { ok: false, error: limitMessage(over) };

  const user = await requireUser();
  const dice = expandDice(groups);
  const values = dice.map((sides) => rollDie(sides, () => randomInt(0, 4294967296)));
  const total = values.reduce((a, b) => a + b, 0) + modifier;

  const row = await prisma.diceRoll.create({
    data: { userId: user.id, notation: notation(groups, modifier), total, values, dice },
  });
  await pruneRolls(user.id);
  return { ok: true, roll: toView(row) };
}
