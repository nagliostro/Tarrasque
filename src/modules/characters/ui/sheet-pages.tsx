'use client';

import { useState } from 'react';
import {
  ABILITIES,
  ALIGNMENTS,
  ARMORS,
  BACKGROUNDS,
  CANTRIP_LINES,
  CLASSES,
  COINS,
  MAX_ATTACK_ROWS,
  MAX_MAGIC_BONUS,
  PROF_LABELS,
  PROF_SYMBOLS,
  RACES,
  SKILLS,
  SPELL_LINES,
  STANDARD_ARRAY,
  WEAPONS,
  ABILITY_CAP,
  formatBonus,
  getPath,
  levelForXp,
  pointCost,
  classicTotal,
  toNumber,
  type Named,
} from '../domain/sheet';
import { ClassicDialog } from './sheet-classic';
import {
  Area,
  Check,
  Field,
  SelectField,
  asText,
  type Option,
  type SheetBinding,
} from './sheet-fields';

const opts = (list: readonly Named[]): Option[] =>
  list.map((x) => ({ value: x.id, label: x.name }));
const LEVELS: Option[] = Array.from({ length: 20 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));
const MAGIC_BONUSES: Option[] = Array.from({ length: MAX_MAGIC_BONUS + 1 }, (_, i) => ({
  value: String(i),
  label: '+' + i,
}));
const ARMOR_CATEGORY = { leve: 'leve', media: 'média', pesada: 'pesada' } as const;
const abilityOptions = (disabled: (key: string) => boolean): Option[] =>
  ABILITIES.map(([k, n]) => ({ value: k, label: n, disabled: disabled(k) }));

/** Marca de proficiência: nas regras, vem de classe, raça, antecedente e escolhas, não de clique livre. */
function ProfMark({ level, label }: { level: number; label: string }) {
  return (
    <span
      className="prof"
      role="img"
      aria-label={`${label}: ${PROF_LABELS[level]}`}
      title={PROF_LABELS[level]}
    >
      {PROF_SYMBOLS[level]}
    </span>
  );
}

function Identity({ b }: { b: SheetBinding }) {
  const { cls, race, level } = b.build;
  const showSubclass = cls !== undefined && level >= cls.subclassLevel;
  const xp = toNumber(b.sheet.xp);
  const xpLevel = levelForXp(xp);
  return (
    <div className="sh-head">
      <Field b={b} label="Nome do personagem" path="nm" maxLength={80} className="wide" required />
      <div className="sh-group">
        <SelectField
          required
          b={b}
          label="Raça"
          path="rc"
          options={opts(RACES)}
          empty="Escolha a raça"
        />
        {race && race.subraces.length > 0 && (
          <SelectField
            required
            b={b}
            label={race.subraceLabel ?? 'Sub-raça'}
            path="sr"
            options={opts(race.subraces)}
            empty="Escolha a sub-raça"
          />
        )}
        <SelectField
          required
          b={b}
          label="Antecedente"
          path="bg"
          options={opts(BACKGROUNDS)}
          empty="Escolha o antecedente"
        />
        <SelectField
          required
          b={b}
          label="Tendência"
          path="al"
          options={opts(ALIGNMENTS)}
          empty="Escolha a tendência"
        />
      </div>
      <div className="sh-group">
        <SelectField
          required
          b={b}
          label="Classe"
          path="cl"
          options={opts(CLASSES)}
          empty="Escolha a classe"
        />
        {showSubclass && (
          <SelectField
            required
            b={b}
            label="Subclasse"
            path="sb"
            options={opts(cls.subclasses)}
            empty={'Escolha ' + cls.subclassLabel}
          />
        )}
        <SelectField b={b} label="Nível" path="lvl" options={LEVELS} />
        <label className="sf">
          <span>Pontos de experiência</span>
          <input
            type="number"
            min={0}
            value={asText(b.sheet.xp)}
            onChange={(e) => b.set('xp', e.target.value === '' ? '' : Number(e.target.value))}
          />
          {xp > 0 && xpLevel !== level && (
            <small className="ab-note">
              Pela tabela de experiência, este personagem seria nível {xpLevel}.
            </small>
          )}
        </label>
      </div>
    </div>
  );
}

function AbilityBase({ b, k, name }: { b: SheetBinding; k: string; name: string }) {
  const { build } = b;
  if (build.method === 'pb') {
    const current = build.abilities[k as keyof typeof build.abilities].base;
    const options: Option[] = [8, 9, 10, 11, 12, 13, 14, 15].map((v) => ({
      value: String(v),
      label: String(v),
      disabled: pointCost(v) - pointCost(current) > build.pointsLeft,
    }));
    return (
      <select
        aria-label={'Valor base de ' + name}
        data-missing={(build.pointsLeft > 0 && current === 8) || undefined}
        value={String(current)}
        onChange={(e) => b.set('ab.' + k, Number(e.target.value))}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
  if (build.method === 'cl') {
    const rolls = build.classicRolls ?? [];
    const current = getPath(b.sheet, 'da.' + k);
    const available = [
      ...build.classicLeft,
      ...(typeof current === 'number' ? [current] : []),
    ].sort((x, y) => classicTotal(rolls[y]!) - classicTotal(rolls[x]!) || x - y);
    return (
      <select
        aria-label={'Valor base de ' + name}
        data-missing={current === '' || current === undefined || undefined}
        disabled={rolls.length === 0}
        value={asText(current)}
        onChange={(e) => b.set('da.' + k, e.target.value === '' ? '' : Number(e.target.value))}
      >
        <option value="">—</option>
        {available.map((i) => (
          <option key={i} value={i}>
            {classicTotal(rolls[i]!)}
          </option>
        ))}
      </select>
    );
  }
  const current = getPath(b.sheet, 'std.' + k);
  const available = [...build.standardLeft, ...(typeof current === 'number' ? [current] : [])].sort(
    (x, y) => y - x,
  );
  return (
    <select
      aria-label={'Valor base de ' + name}
      data-missing={current === '' || current === undefined || undefined}
      value={asText(current)}
      onChange={(e) => b.set('std.' + k, e.target.value === '' ? '' : Number(e.target.value))}
    >
      <option value="">—</option>
      {available.map((v) => (
        <option key={v} value={v}>
          {v}
        </option>
      ))}
    </select>
  );
}

const METHODS = [
  ['pb', 'Compra de pontos'],
  ['sa', 'Valores padrão'],
  ['cl', 'Clássico (4d6)'],
] as const;

function Attributes({ b }: { b: SheetBinding }) {
  const { build } = b;
  const [rolling, setRolling] = useState(false);
  const classicValues = (build.classicRolls ?? []).map(classicTotal);
  const left = build.classicLeft
    .map((i) => classicTotal(build.classicRolls![i]!))
    .sort((x, y) => y - x);
  return (
    <section className="box">
      <h3>Atributos</h3>
      <label className="sf ab-type">
        <span>Tipo de distribuição</span>
        <select
          name="abm"
          aria-label="Tipo de distribuição"
          value={build.method}
          onChange={(e) => {
            b.set('abm', e.target.value);
            if (e.target.value === 'cl' && !build.classicRolls) setRolling(true);
          }}
        >
          {METHODS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="ab-status">
        <span>{build.method === 'pb' ? 'Pontos restantes' : 'A distribuir'}</span>
        <output className="ab-left">
          {build.method === 'pb'
            ? build.pointsLeft
            : build.method === 'cl'
              ? build.classicRolls
                ? left.length
                  ? left.join(' · ')
                  : 'nenhum'
                : 'role os dados'
              : build.standardLeft.length
                ? build.standardLeft.join(' · ')
                : 'nenhum'}
        </output>
      </label>
      <p className="hint">
        {build.method === 'pb'
          ? 'Cada valor fica entre 8 e 15 antes dos bônus de raça e de nível.'
          : build.method === 'cl'
            ? classicValues.length
              ? 'Escolha em qual atributo vai cada valor rolado (4d6, menor dado descartado).'
              : 'Role 4d6 para cada atributo, descartando o menor dado.'
            : `Atribua ${STANDARD_ARRAY.join(', ')} aos atributos, um valor para cada.`}
      </p>
      {build.method === 'cl' && (
        <button type="button" className="secondary classic-open" onClick={() => setRolling(true)}>
          {build.classicRolls ? 'Ver rolagens' : 'Rolar atributos'}
        </button>
      )}
      <ClassicDialog b={b} open={rolling} onClose={() => setRolling(false)} />
      <div className="abilities">
        {ABILITIES.map(([k, n]) => {
          const a = build.abilities[k];
          const notes = [
            a.racial ? `raça ${formatBonus(a.racial)}` : '',
            a.increase ? `nível ${formatBonus(a.increase)}` : '',
          ].filter(Boolean);
          return (
            <div className="ability" key={k}>
              <span className="ab-name">{n}</span>
              <output className="ab-mod" aria-label={'Modificador de ' + n}>
                {formatBonus(a.mod)}
              </output>
              <label className="ab-base">
                <span>Base</span>
                <AbilityBase b={b} k={k} name={n} />
              </label>
              <div className="ab-foot">
                <span>Total</span>
                <output aria-label={'Valor total de ' + n}>{a.unassigned ? '—' : a.total}</output>
              </div>
              {notes.length > 0 && <small className="ab-note">{notes.join(' · ')}</small>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Increases({ b }: { b: SheetBinding }) {
  const { build } = b;
  if (build.racialChoices === 0 && build.asiLevels.length === 0) return null;
  const exclude = build.race?.asiChoice?.exclude ?? [];
  const picked = (path: string) => asText(getPath(b.sheet, path));
  const racial = Array.from({ length: build.racialChoices }, (_, i) => i);
  return (
    <section className="box">
      <h3>Bônus e aumentos de atributo</h3>
      <div className="pick-grid">
        {racial.map((i) => (
          <SelectField
            required
            key={'rb' + i}
            b={b}
            label={`Bônus racial ${i + 1} (+1)`}
            path={`rb.${i}`}
            empty="—"
            options={abilityOptions(
              (k) =>
                exclude.includes(k as never) ||
                racial.some((j) => j !== i && picked(`rb.${j}`) === k),
            )}
          />
        ))}
        {build.asiLevels.flatMap((l) =>
          ['a', 'b'].map((slot, n) => (
            <SelectField
              required
              key={`asi${l}${slot}`}
              b={b}
              label={`Nível ${l}: ${n === 0 ? 'primeiro' : 'segundo'} +1`}
              path={`asi.${l}.${slot}`}
              empty="—"
              options={abilityOptions(
                (k) =>
                  picked(`asi.${l}.${slot}`) !== k &&
                  build.abilities[k as keyof typeof build.abilities].total >= ABILITY_CAP,
              )}
            />
          )),
        )}
      </div>
      <p className="hint">
        Cada Aumento de Atributo soma 2 pontos: +2 em um atributo ou +1 em dois. Nenhum passa de 20.
      </p>
    </section>
  );
}

function SkillChoices({ b }: { b: SheetBinding }) {
  const c = b.build.skillChoices;
  if (!c.classCount && !c.raceCount && !c.substituteCount && !c.expertiseCount) return null;
  const all = SKILLS.map((_, i) => i);
  const group = (
    prefix: string,
    label: string,
    count: number,
    allowed: (current: unknown) => readonly number[],
  ) =>
    Array.from({ length: count }, (_, i) => {
      const path = `${prefix}.${i}`;
      const current = getPath(b.sheet, path);
      const others = Array.from({ length: count }, (_, j) =>
        getPath(b.sheet, `${prefix}.${j}`),
      ).filter((_, j) => j !== i);
      return (
        <SelectField
          required
          key={path}
          b={b}
          label={`${label} ${i + 1}`}
          path={path}
          empty="—"
          options={allowed(current).map((idx) => ({
            value: String(idx),
            label: SKILLS[idx]![0],
            disabled: others.includes(idx),
          }))}
        />
      );
    });
  return (
    <section className="box">
      <h3>Escolhas de perícias</h3>
      <div className="pick-grid">
        {group('csk', 'Perícia da classe', c.classCount, () => c.classOptions)}
        {group('rsk', 'Perícia racial', c.raceCount, () => all)}
        {group('ssk', 'Perícia substituta', c.substituteCount, (cur) =>
          all.filter((i) => !c.proficient.includes(i) || i === cur),
        )}
        {group('exp', 'Especialização', c.expertiseCount, () => c.proficient)}
      </div>
      <p className="hint">
        Perícias repetidas entre antecedente, raça e classe dão direito a uma substituta.
      </p>
    </section>
  );
}

function Proficiencies({ b }: { b: SheetBinding }) {
  const { cls, race, subrace } = b.build;
  const armor = new Set([...(cls?.armor ?? []), ...(subrace?.armor ?? [])]);
  const armorText = (['leve', 'media', 'pesada', 'escudo'] as const)
    .filter((a) => armor.has(a))
    .map((a) => (a === 'escudo' ? 'escudos' : 'armaduras ' + ARMOR_CATEGORY[a]))
    .join(', ');
  const weapons = [...(cls?.weapons ?? []), ...(race?.weapons ?? []), ...(subrace?.weapons ?? [])]
    .map((w) =>
      w === 'simples'
        ? 'armas simples'
        : w === 'marcial'
          ? 'armas marciais'
          : WEAPONS.find((x) => x.id === w)?.name,
    )
    .filter((w): w is string => Boolean(w));
  return (
    <>
      <p className="hint">
        <strong>Armaduras:</strong> {armorText || 'nenhuma'}.
        <br />
        <strong>Armas:</strong> {[...new Set(weapons)].join(', ') || 'nenhuma'}.
      </p>
      <Area b={b} label="Idiomas e ferramentas" path="prof" rows={5} />
    </>
  );
}

function Defense({ b }: { b: SheetBinding }) {
  const { build } = b;
  const { armor } = build;
  const strengthShort = armor?.strength !== undefined && build.abilities.for.total < armor.strength;
  return (
    <section className="box">
      <h3>Defesa</h3>
      <div className="vitals">
        <div className="sf">
          <span>Classe de armadura</span>
          <output
            className="big"
            aria-label="Classe de armadura"
            data-missing={build.ac === null || undefined}
          >
            {build.ac ?? '—'}
          </output>
        </div>
        <div className="sf">
          <span>Iniciativa</span>
          <output className="big" aria-label="Iniciativa">
            {formatBonus(build.initiative)}
          </output>
        </div>
        <div className="sf">
          <span>Deslocamento</span>
          <output
            className="big"
            aria-label="Deslocamento"
            data-missing={build.speed === '—' || undefined}
          >
            {build.speed}
          </output>
        </div>
      </div>
      <div className="gear">
        <SelectField
          required
          b={b}
          label="Armadura"
          path="ar"
          empty="Escolha a armadura"
          options={[{ value: 'nenhuma', label: 'Sem armadura' }].concat(
            ARMORS.map((a) => ({
              value: a.id,
              label: `${a.name} (${ARMOR_CATEGORY[a.category]}, CA ${a.ac})`,
            })),
          )}
        />
        <SelectField
          b={b}
          label="Bônus mágico da armadura"
          path="arb"
          options={MAGIC_BONUSES}
          disabled={!armor}
        />
        <label className="sf inline">
          <span>Escudo</span>
          <input
            type="checkbox"
            checked={b.sheet.sh === true}
            onChange={(e) => b.set('sh', e.target.checked)}
          />
        </label>
        <SelectField
          b={b}
          label="Bônus mágico do escudo"
          path="shb"
          options={MAGIC_BONUSES}
          disabled={b.sheet.sh !== true}
        />
        {build.fightingStyles.length > 0 && (
          <SelectField
            required
            b={b}
            label="Estilo de luta"
            path="fs"
            empty="Escolha o estilo"
            options={opts(build.fightingStyles)}
          />
        )}
      </div>
      {build.armorUntrained && (
        <p className="hint warn">
          Sem proficiência: desvantagem em testes de Força e Destreza e em ataques, e não pode
          conjurar magias.
        </p>
      )}
      {strengthShort && armor && (
        <p className="hint warn">
          Esta armadura exige Força {armor.strength}: o deslocamento cai 3 m.
        </p>
      )}
      {armor?.stealthDisadvantage && <p className="hint">Desvantagem em testes de Furtividade.</p>}
    </section>
  );
}

function Attacks({ b }: { b: SheetBinding }) {
  const { build } = b;
  const rows = build.attackRows;
  return (
    <>
      <div id="attacks" className="attacks">
        <div className="atk head">
          <span>Arma</span>
          <span>Mágica</span>
          <span>Ataque</span>
          <span>Dano</span>
        </div>
        {build.attacks.map((row, i) => (
          <div className="atk" key={i}>
            <select
              aria-label={'Arma do ataque ' + (i + 1)}
              value={asText(getPath(b.sheet, `at.${i}.w`))}
              onChange={(e) => b.set(`at.${i}.w`, e.target.value)}
            >
              <option value="">—</option>
              {WEAPONS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            <select
              aria-label={'Bônus mágico da arma ' + (i + 1)}
              value={asText(getPath(b.sheet, `at.${i}.m`)) || '0'}
              disabled={!row}
              onChange={(e) => b.set(`at.${i}.m`, Number(e.target.value))}
            >
              {MAGIC_BONUSES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <output
              aria-label={'Bônus de ataque ' + (i + 1)}
              title={row && !row.proficient ? 'Sem proficiência' : undefined}
            >
              {row ? formatBonus(row.bonus) : '—'}
              {row && !row.proficient && '*'}
            </output>
            <output aria-label={'Dano ' + (i + 1)}>{row?.damage ?? '—'}</output>
          </div>
        ))}
      </div>
      {build.attacks.some((r) => r && !r.proficient) && (
        <p className="hint">
          * Sem proficiência com a arma: o bônus de proficiência não entra no ataque.
        </p>
      )}
      {rows < MAX_ATTACK_ROWS && (
        <button type="button" className="secondary" onClick={() => b.set('atN', rows + 1)}>
          + Adicionar ataque
        </button>
      )}
    </>
  );
}

export function MainPage({ b }: { b: SheetBinding }) {
  const { build } = b;
  return (
    <>
      <Identity b={b} />
      <div className="sh-cols">
        <div className="sh-col">
          <Attributes b={b} />
          <Increases b={b} />
          <section className="box">
            <div className="stat-row">
              <label className="sf inline">
                <span>Inspiração</span>
                <input
                  type="checkbox"
                  checked={b.sheet.insp === true}
                  onChange={(e) => b.set('insp', e.target.checked)}
                />
              </label>
              <div className="stat-pair">
                <span>Bônus de proficiência</span>
                <output>{formatBonus(build.proficiency)}</output>
              </div>
            </div>
          </section>
          <section className="box">
            <h3>Salvaguardas</h3>
            <ul className="rows">
              {ABILITIES.map(([k, n]) => (
                <li key={k}>
                  <ProfMark level={build.saveProficient[k] ? 1 : 0} label={'Salvaguarda de ' + n} />
                  <output>{formatBonus(build.saves[k])}</output>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="box">
            <div className="stat-pair">
              <span>Sabedoria passiva (Percepção)</span>
              <output>{build.passivePerception}</output>
            </div>
          </section>
          <section className="box grow">
            <h3>Proficiências</h3>
            <Proficiencies b={b} />
          </section>
        </div>

        <div className="sh-col">
          <Defense b={b} />
          <section className="box">
            <div className="hp">
              <div className="sf">
                <span>Pontos de vida máximos</span>
                <output
                  className="big"
                  aria-label="Pontos de vida máximos"
                  data-missing={build.hpMax === null || undefined}
                >
                  {build.hpMax ?? '—'}
                </output>
              </div>
              <Field
                b={b}
                label="Pontos de vida atuais"
                path="hpc"
                type="number"
                min={0}
                max={build.hpMax ?? 0}
                placeholder={build.hpMax === null ? '' : String(build.hpMax)}
              />
              <Field b={b} label="Pontos de vida temporários" path="hpt" type="number" min={0} />
            </div>
          </section>
          <section className="box">
            <div className="vitals two">
              <div className="sf">
                <span>Dados de vida</span>
                <output
                  className="big"
                  aria-label="Dados de vida"
                  data-missing={build.cls === undefined || undefined}
                >
                  {build.hitDice}
                </output>
              </div>
              <fieldset className="death">
                <legend>Salvaguardas contra a morte</legend>
                <div>
                  <span>Sucessos</span>
                  {[0, 1, 2].map((i) => (
                    <Check key={i} b={b} path={'ds.s' + i} label={'Sucesso ' + (i + 1)} />
                  ))}
                </div>
                <div>
                  <span>Falhas</span>
                  {[0, 1, 2].map((i) => (
                    <Check key={i} b={b} path={'ds.f' + i} label={'Falha ' + (i + 1)} />
                  ))}
                </div>
              </fieldset>
            </div>
          </section>
          <section className="box">
            <h3>Ataques</h3>
            <Attacks b={b} />
          </section>
          <section className="box grow">
            <h3>Equipamento</h3>
            <div className="coins">
              {COINS.map(([k, s, n]) => (
                <label className="coin" key={k}>
                  <span title={n}>{s}</span>
                  <input
                    type="number"
                    min={0}
                    aria-label={'Peças de ' + n.toLowerCase()}
                    value={asText(getPath(b.sheet, 'co.' + k))}
                    onChange={(e) =>
                      b.set('co.' + k, e.target.value === '' ? '' : Number(e.target.value))
                    }
                  />
                </label>
              ))}
            </div>
            <Area b={b} label="Itens e equipamento" path="eq" rows={9} />
          </section>
        </div>

        <div className="sh-col">
          <SkillChoices b={b} />
          <section className="box">
            <h3>Perícias</h3>
            <ul className="rows">
              {SKILLS.map(([n, a], i) => (
                <li key={n}>
                  <ProfMark level={build.skillLevel[i] ?? 0} label={n} />
                  <output>{formatBonus(build.skills[i] ?? 0)}</output>
                  <span>
                    {n} <small>({a.toUpperCase()})</small>
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className="box grow">
            <Area b={b} label="Características e traços" path="ft" rows={8} />
          </section>
        </div>
      </div>
      <div className="sh-notes">
        <section className="box">
          <Area b={b} label="Traços de personalidade" path="pt" rows={4} />
        </section>
        <section className="box">
          <Area b={b} label="Ideais" path="id" rows={4} />
        </section>
        <section className="box">
          <Area b={b} label="Vínculos" path="vn" rows={4} />
        </section>
        <section className="box">
          <Area b={b} label="Defeitos" path="df" rows={4} />
        </section>
      </div>
    </>
  );
}

export function DetailsPage({ b }: { b: SheetBinding }) {
  return (
    <>
      <div className="sh-head">
        <Field
          b={b}
          label="Nome do personagem"
          path="nm"
          maxLength={80}
          className="wide"
          required
        />
        <Field b={b} label="Idade" path="ag" maxLength={20} />
        <Field b={b} label="Altura" path="ht" maxLength={20} />
        <Field b={b} label="Peso" path="wt" maxLength={20} />
        <Field b={b} label="Olhos" path="ey" maxLength={20} />
        {/* No legado a pele usava a chave `sk`, que colidia com as perícias; aqui é `skn`. */}
        <Field b={b} label="Pele" path="skn" maxLength={20} />
        <Field b={b} label="Cabelo" path="hr" maxLength={20} />
      </div>
      <div className="sh-cols two">
        <div className="sh-col">
          <section className="box">
            <Area b={b} label="Aparência do personagem" path="app" rows={10} />
          </section>
          <section className="box">
            <Area b={b} label="História do personagem" path="bio" rows={20} />
          </section>
        </div>
        <div className="sh-col">
          <section className="box">
            <Field b={b} label="Símbolo ou emblema (nome)" path="sym" maxLength={60} />
            <Area b={b} label="Aliados e organizações" path="aly" rows={9} />
          </section>
          <section className="box">
            <Area b={b} label="Características e traços adicionais" path="aft" rows={12} />
          </section>
          <section className="box">
            <Area b={b} label="Tesouro" path="tre" rows={9} />
          </section>
        </div>
      </div>
    </>
  );
}

function SpellLines({
  b,
  circle,
  count,
  full,
}: {
  b: SheetBinding;
  circle: number;
  count: number;
  /** Lista cheia: linhas vazias ficam bloqueadas. */
  full: boolean;
}) {
  const spell = b.build.spell!;
  const book = spell.mode === 'book' && circle > 0;
  const preparedFull = book && countPrepared(b) >= spell.preparedLimit;
  return (
    <ul className="spell-lines">
      {Array.from({ length: count }, (_, i) => {
        const name = asText(getPath(b.sheet, `sp.${circle}.${i}.n`));
        const prepared = getPath(b.sheet, `sp.${circle}.${i}.p`) === true;
        return (
          <li key={i}>
            {book && (
              <input
                type="checkbox"
                aria-label="Preparada"
                checked={prepared}
                disabled={name === '' || (!prepared && preparedFull)}
                onChange={(e) => b.set(`sp.${circle}.${i}.p`, e.target.checked)}
              />
            )}
            <input
              type="text"
              maxLength={60}
              aria-label={`Magia ${i + 1} de ${circle ? 'círculo ' + circle : 'truque'}`}
              disabled={name === '' && full}
              value={name}
              onChange={(e) => b.set(`sp.${circle}.${i}.n`, e.target.value)}
            />
          </li>
        );
      })}
    </ul>
  );
}

const countNames = (b: SheetBinding, circle: number, lines: number) =>
  Array.from({ length: lines }, (_, i) =>
    asText(getPath(b.sheet, `sp.${circle}.${i}.n`)).trim(),
  ).filter(Boolean).length;

function countPrepared(b: SheetBinding): number {
  let n = 0;
  for (const [circle, lines] of Object.entries(SPELL_LINES)) {
    for (let i = 0; i < lines; i++) if (getPath(b.sheet, `sp.${circle}.${i}.p`) === true) n++;
  }
  return n;
}

export function SpellsPage({ b }: { b: SheetBinding }) {
  const { spell } = b.build;
  if (!spell) {
    return (
      <p className="hint">
        {b.build.cls
          ? `${b.build.cls.name} não conjura magias${b.build.cls.caster || b.build.cls.subclasses.some((s) => s.caster) ? ' neste nível' : ''}.`
          : 'Escolha a classe na página Ficha para ver as magias.'}
      </p>
    );
  }
  const cantripNames = countNames(b, 0, CANTRIP_LINES);
  let spellNames = 0;
  for (let c = 1; c <= spell.maxCircle; c++) spellNames += countNames(b, c, SPELL_LINES[c] ?? 0);
  const abilityName = ABILITIES.find(([k]) => k === spell.ability)![1];
  const label = {
    known: 'Magias conhecidas',
    prepared: 'Magias preparadas',
    book: 'Magias no grimório',
  }[spell.mode];
  return (
    <>
      <div className="sh-head">
        <div className="sf wide">
          <span>Classe conjuradora</span>
          <output className="big">{spell.className}</output>
        </div>
        <div className="sf">
          <span>Atributo de conjuração</span>
          <output className="big">{abilityName}</output>
        </div>
        <div className="sf">
          <span>CD de resistência</span>
          <output className="big" aria-label="CD de resistência">
            {spell.dc}
          </output>
        </div>
        <div className="sf">
          <span>Bônus de ataque</span>
          <output className="big" aria-label="Bônus de ataque de magia">
            {formatBonus(spell.attack)}
          </output>
        </div>
      </div>
      <p className="hint">
        {spell.cantrips > 0 && `Truques: ${cantripNames}/${spell.cantrips}. `}
        {spell.spellLimit > 0 && `${label}: ${spellNames}/${spell.spellLimit}. `}
        {spell.mode === 'book' && `Preparadas: ${countPrepared(b)}/${spell.preparedLimit}. `}O
        número de espaços de magia vem da classe e do nível.
      </p>
      <div className="spell-grid">
        {spell.cantrips > 0 && (
          <section className="box spell-level">
            <h3>Truques</h3>
            <SpellLines
              b={b}
              circle={0}
              count={CANTRIP_LINES}
              full={cantripNames >= spell.cantrips}
            />
          </section>
        )}
        {Array.from({ length: spell.maxCircle }, (_, i) => i + 1).map((circle) => {
          const total = spell.slots[circle];
          return (
            <section className="box spell-level" key={circle}>
              <h3>Círculo {circle}</h3>
              {total !== undefined && (
                <div className="slots">
                  <div className="sf">
                    <span>Espaços totais</span>
                    <output className="big" aria-label={`Espaços totais do círculo ${circle}`}>
                      {total}
                    </output>
                  </div>
                  <Field
                    b={b}
                    label="Espaços gastos"
                    path={`sl.${circle}.e`}
                    type="number"
                    min={0}
                    max={total}
                  />
                </div>
              )}
              <SpellLines
                b={b}
                circle={circle}
                count={SPELL_LINES[circle] ?? 0}
                full={spellNames >= spell.spellLimit}
              />
            </section>
          );
        })}
      </div>
    </>
  );
}
