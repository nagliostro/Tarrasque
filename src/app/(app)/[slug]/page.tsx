import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CollectionView, collectionKindFor, listEntries } from '@/modules/collections';
import { requireUser } from '@/modules/identity';
import { Icon, findSection } from '@/modules/shared';

export async function generateMetadata({ params }: PageProps<'/[slug]'>): Promise<Metadata> {
  const section = findSection((await params).slug);
  return { title: section?.title };
}

export default async function SectionPage({ params }: PageProps<'/[slug]'>) {
  const section = findSection((await params).slug);
  if (!section) notFound();

  const kind = collectionKindFor(section.slug);
  if (kind) {
    const user = await requireUser();
    const entries = await listEntries(user.id, kind);
    return <CollectionView section={section} entries={entries} />;
  }

  const isDice = section.slug === 'dados';

  return (
    <>
      <div className="page-top">
        <div>
          <p className="eyebrow">SEU PRÓXIMO CAPÍTULO</p>
          <h1>
            {section.title}
            <span>.</span>
          </h1>
          {section.description && <p className="subtitle">{section.description}</p>}
        </div>
        {!isDice && (
          <button className="primary">
            <Icon name="plus" />
            <span>{section.action}</span>
          </button>
        )}
      </div>

      {isDice ? (
        <section className="empty">
          <div className="emblem">
            <div className="orbit" />
            <Icon name="dice" />
          </div>
          <p className="eyebrow">MESA DE DADOS</p>
          <h2>A mesa está sendo preparada.</h2>
        </section>
      ) : (
        <>
          <div className="section-line">
            <span>
              {section.list} <b>0</b>
            </span>
            <span className="section-caption">SUAS HISTÓRIAS COMEÇAM AQUI</span>
          </div>
          <label className="search-field">
            Buscar nesta coleção
            <input type="search" placeholder="Buscar por nome ou descrição" />
          </label>
          <section className="empty">
            <div className="emblem">
              <div className="orbit" />
              <Icon name="dice" />
              <span className="star star-a">+</span>
              <span className="star star-b">+</span>
            </div>
            <p className="eyebrow">A AVENTURA ESTÁ À SUA ESPERA</p>
            <h2>Sua coleção começa aqui.</h2>
            <p>Adicione seu primeiro registro para consultar durante a próxima sessão.</p>
            <button className="primary">
              <Icon name="plus" />
              <span>{section.action}</span>
            </button>
            <span className="empty-foot">Coleção pessoal</span>
          </section>
        </>
      )}
    </>
  );
}
