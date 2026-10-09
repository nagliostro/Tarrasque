export type IconName =
  | 'swords'
  | 'spark'
  | 'beast'
  | 'bag'
  | 'book'
  | 'tarrasque'
  | 'dice'
  | 'person'
  | 'map'
  | 'panel'
  | 'gear'
  | 'plus'
  | 'close-icon'
  | 'wand'
  | 'arrow';

export interface Section {
  slug: string;
  title: string;
  icon: IconName;
  description: string;
  /** Presentes apenas nas coleções (dados não tem lista). */
  list?: string;
  action?: string;
  field?: string;
  placeholder?: string;
}

export const SECTIONS: Section[] = [
  {
    slug: 'personagem',
    title: 'Personagem',
    icon: 'person',
    description: 'Crie e organize seus personagens.',
    list: 'Meus personagens',
    action: 'Novo personagem',
    field: 'Classe ou origem',
    placeholder: 'Ex.: Elfo · Mago',
  },
  {
    slug: 'campanha',
    title: 'Campanha',
    icon: 'map',
    description: 'Organize os mundos e as histórias do seu grupo.',
    list: 'Minhas campanhas',
    action: 'Nova campanha',
    field: 'Cenário ou sistema',
    placeholder: 'Ex.: Fantasia · D&D 5e',
  },
  {
    slug: 'encontros',
    title: 'Encontros',
    icon: 'swords',
    description: 'Prepare os desafios e registre os participantes de cada encontro.',
    list: 'Meus encontros',
    action: 'Novo encontro',
    field: 'Participantes e preparação',
    placeholder: 'Ex.: 4 aventureiros, 3 inimigos; ruínas ao anoitecer',
  },
  {
    slug: 'magias',
    title: 'Magias',
    icon: 'spark',
    description: 'Mantenha sua coleção de magias e anotações à mão.',
    list: 'Minhas magias',
    action: 'Nova magia',
    field: 'Nível, escola e efeito',
    placeholder: 'Registre os detalhes da sua magia',
  },
  {
    slug: 'bestiario',
    title: 'Bestiário',
    icon: 'beast',
    description: 'Organize criaturas e personagens do mestre para suas aventuras.',
    list: 'Minhas criaturas',
    action: 'Nova criatura',
    field: 'Tipo, desafio e características',
    placeholder: 'Descreva a criatura e suas habilidades',
  },
  {
    slug: 'equipamentos',
    title: 'Equipamentos',
    icon: 'bag',
    description: 'Catalogue armas, armaduras, tesouros e itens mágicos.',
    list: 'Meus equipamentos',
    action: 'Novo equipamento',
    field: 'Tipo, propriedades e valor',
    placeholder: 'Registre as propriedades do item',
  },
  {
    slug: 'biblioteca',
    title: 'Biblioteca',
    icon: 'book',
    description: 'Guarde suas regras da casa, referências e resumos de sessão.',
    list: 'Minhas anotações',
    action: 'Nova anotação',
    field: 'Conteúdo',
    placeholder: 'Escreva sua anotação ou referência',
  },
  { slug: 'dados', title: 'Dados', icon: 'dice', description: '' },
];

export const NAV_GROUPS: { label: string; slugs: string[] }[] = [
  { label: 'JOGAR', slugs: ['personagem', 'campanha', 'encontros'] },
  { label: 'CONSULTAR', slugs: ['magias', 'bestiario', 'equipamentos', 'biblioteca'] },
  { label: 'FERRAMENTAS', slugs: ['dados'] },
];

export const DEFAULT_SLUG = 'personagem';

export function findSection(slug: string): Section | undefined {
  return SECTIONS.find((s) => s.slug === slug);
}
