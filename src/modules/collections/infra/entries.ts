import { prisma } from '@/platform/db';
import type { CollectionKind } from '@/generated/prisma/enums';
import { MAX_ENTRIES_PER_KIND, type EntryView } from '../domain/collection';

/** Ordem do legado: itens novos entram no fim da lista (createdAt crescente). */
export async function listEntries(userId: string, kind: CollectionKind): Promise<EntryView[]> {
  return prisma.collectionEntry.findMany({
    where: { userId, kind },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: { id: true, name: true, detail: true },
    take: MAX_ENTRIES_PER_KIND,
  });
}
