'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/modules/identity';
import {
  QUOTA_MESSAGE,
  MAX_CHARACTERS_PER_USER,
  characterName,
  sheetSchema,
  summarize,
  type ActionResult,
  type SaveResult,
  type Sheet,
} from '../domain/sheet';
import * as store from '../infra/characters';

const NOT_FOUND = 'Personagem não encontrado.';
const idSchema = z.string().min(1).max(64);

/**
 * Salvamento automático: sem `id` cria o personagem, com `id` atualiza. Nome e resumo são
 * derivados da ficha no servidor. Não revalida a rota (o cliente atualiza a lista ao voltar).
 */
export async function saveCharacter(id: string | null, sheet: Sheet): Promise<SaveResult> {
  const data = sheetSchema.safeParse(sheet);
  if (!data.success) return { ok: false, error: data.error.issues[0]?.message ?? 'Ficha inválida.' };
  const name = characterName(data.data).slice(0, 80);
  const summary = summarize(data.data).slice(0, 6000);
  const user = await requireUser();

  if (id === null) {
    if ((await store.countCharacters(user.id)) >= MAX_CHARACTERS_PER_USER) {
      return { ok: false, error: QUOTA_MESSAGE };
    }
    const created = await store.createCharacter(user.id, name, summary, data.data);
    return { ok: true, id: created.id };
  }

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: NOT_FOUND };
  const ok = await store.updateCharacter(user.id, parsedId.data, name, summary, data.data);
  return ok ? { ok: true, id: parsedId.data } : { ok: false, error: NOT_FOUND };
}

export async function loadSheet(id: string): Promise<{ ok: true; sheet: Sheet } | { ok: false; error: string }> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: NOT_FOUND };
  const user = await requireUser();
  const sheet = await store.readSheet(user.id, parsedId.data);
  return sheet ? { ok: true, sheet } : { ok: false, error: NOT_FOUND };
}

export async function deleteCharacter(id: string): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: NOT_FOUND };
  const user = await requireUser();
  if (!(await store.removeCharacter(user.id, parsedId.data))) return { ok: false, error: NOT_FOUND };
  revalidatePath('/personagem');
  return { ok: true };
}
