import { z } from 'zod';
import type { CollectionKind } from '@/generated/prisma/enums';

const KIND_BY_SLUG: Record<string, CollectionKind> = {
  campanha: 'CAMPANHA',
  encontros: 'ENCONTROS',
  magias: 'MAGIAS',
  bestiario: 'BESTIARIO',
  equipamentos: 'EQUIPAMENTOS',
  biblioteca: 'BIBLIOTECA',
};

/** Slug da seção -> tipo de coleção. `personagem` e `dados` não são coleções genéricas. */
export function collectionKindFor(slug: string): CollectionKind | undefined {
  return Object.hasOwn(KIND_BY_SLUG, slug) ? KIND_BY_SLUG[slug] : undefined;
}

export const entryInputSchema = z.object({
  name: z.string().trim().min(1, 'Digite um nome.').max(80, 'O nome pode ter até 80 caracteres.'),
  detail: z.string().trim().max(6000, 'O texto pode ter até 6000 caracteres.').default(''),
});

/** Cota por usuário e tipo: limita armazenamento e o tamanho da listagem (carregada inteira). */
export const MAX_ENTRIES_PER_KIND = 500;
export const QUOTA_MESSAGE =
  'Você atingiu o limite de ' + MAX_ENTRIES_PER_KIND + ' registros desta coleção.';

export type EntryInput = z.input<typeof entryInputSchema>;

export interface EntryView {
  id: string;
  name: string;
  detail: string;
}

export type ActionResult = { ok: true } | { ok: false; error: string };
