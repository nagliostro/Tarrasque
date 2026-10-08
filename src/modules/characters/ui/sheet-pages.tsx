'use client';

import {
  ABILITIES,
  CANTRIP_LINES,
  COINS,
  MAX_ATTACK_ROWS,
  MIN_ATTACK_ROWS,
  PROF_LABELS,
  PROF_SYMBOLS,
  SKILLS,
  SPELL_LINES,
  derive,
  formatBonus,
  getPath,
  toNumber,
} from '../domain/sheet';
import { Area, Check, Field, asText, type SheetBinding } from './sheet-fields';

function ProfButton({ b, path, label }: { b: SheetBinding; path: string; label: string }) {
  const value = Math.min(2, Math.max(0, toNumber(getPath(b.sheet, path))));
  const max = path.startsWith('sk.') ? 2 : 1;
  return (
    <button
      type="button"
      className="prof"
      aria-label={'Proficiência em ' + label}
      aria-pressed={value > 0}
      title={PROF_LABELS[value]}
      data-state={PROF_LABELS[value]}
      onClick={() => b.set(path, (value + 1) % (max + 1))}
    >
      {PROF_SYMBOLS[value]}
    </button>
  );
}

function Attacks({ b }: { b: SheetBinding }) {
  const rows = Math.min(MAX_ATTACK_ROWS, Math.max(MIN_ATTACK_ROWS, toNumber(b.sheet.atN)));
  return (
    <>
      <div id="attacks" className="attacks">
        <div className="atk head">
          <span>Nome</span>
          <span>Bônus</span>
          <span>Dano/tipo</span>
        </div>
        {Array.from({ length: rows }, (_, i) => (
          <div className="atk" key={i}>
            <input
              maxLength={40}
              aria-label={'Nome do ataque ' + (i + 1)}
              value={asText(getPath(b.sheet, `at.${i}.n`))}
              onChange={(e) => b.set(`at.${i}.n`, e.target.value)}
            />
            <input
              maxLength={8}
              aria-label={'Bônus de ataque ' + (i + 1)}
              value={asText(getPath(b.sheet, `at.${i}.b`))}
              onChange={(e) => b.set(`at.${i}.b`, e.target.value)}
            />
            <input
              maxLength={40}
              aria-label={'Dano e tipo ' + (i + 1)}
              value={asText(getPath(b.sheet, `at.${i}.d`))}
              onChange={(e) => b.set(`at.${i}.d`, e.target.value)}
            />
          </div>
        ))}
      </div>
      {rows < MAX_ATTACK_ROWS && (
        <button type="button" className="secondary" onClick={() => b.set('atN', rows + 1)}>
          + Adicionar ataque
        </button>
      )}
    </>
  );
}

export function MainPage({ b }: { b: SheetBinding }) {
  const d = derive(b.sheet);
  return (
    <>
      <div className="sh-head">
        <Field b={b} label="Nome do personagem" path="nm" maxLength={80} className="wide" />
        <Field b={b} label="Classe" path="cl" maxLength={40} />
        <Field b={b} label="Nível" path="lvl" type="number" min={1} max={20} />
        <Field b={b} label="Antecedente" path="bg" maxLength={40} />
        <Field b={b} label="Nome do jogador" path="pl" maxLength={40} />
        <Field b={b} label="Raça" path="rc" maxLength={40} />
        <Field b={b} label="Tendência" path="al" maxLength={40} />
        <Field b={b} label="Pontos de experiência" path="xp" type="number" min={0} />
      </div>
      <div className="sh-cols">
        <div className="sh-col">
          <section className="box">
            <h3>Atributos</h3>
            <div className="abilities">
              {ABILITIES.map(([k, n]) => (
                <div className="ability" key={k}>
                  <span className="ab-name">{n}</span>
                  <output className="ab-mod" aria-label={'Modificador de ' + n}>
                    {formatBonus(d.mods[k])}
                  </output>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    aria-label={'Valor de ' + n}
                    value={asText(getPath(b.sheet, 'ab.' + k))}
                    onChange={(e) => b.set('ab.' + k, e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
          </section>
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
                <output>{formatBonus(d.proficiency)}</output>
              </div>
            </div>
          </section>
          <section className="box">
            <h3>Salvaguardas</h3>
            <ul className="rows">
              {ABILITIES.map(([k, n]) => (
                <li key={k}>
                  <ProfButton b={b} path={'sv.' + k} label={'salvaguarda de ' + n} />
                  <output>{formatBonus(d.saves[k])}</output>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="box">
            <h3>Perícias</h3>
            <ul className="rows">
              {SKILLS.map(([n, a], i) => (
                <li key={n}>
                  <ProfButton b={b} path={'sk.' + i} label={n} />
                  <output>{formatBonus(d.skills[i] ?? 0)}</output>
                  <span>
                    {n} <small>({a.toUpperCase()})</small>
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className="box">
            <div className="stat-pair">
              <span>Sabedoria passiva (Percepção)</span>
              <output>{d.passivePerception}</output>
            </div>
          </section>
          <section className="box">
            <Area b={b} label="Outras proficiências e idiomas" path="prof" rows={7} />
          </section>
        </div>

        <div className="sh-col">
          <section className="box">
            <div className="vitals">
              <Field b={b} label="Classe de armadura" path="ca" type="number" />
              <div className="sf">
                <span>Iniciativa</span>
                <output className="big">{formatBonus(d.initiative)}</output>
              </div>
              <Field b={b} label="Deslocamento" path="spd" maxLength={20} />
            </div>
          </section>
          <section className="box">
            <div className="hp">
              <Field b={b} label="Pontos de vida máximos" path="hpm" type="number" min={0} />
              <Field b={b} label="Pontos de vida atuais" path="hpc" type="number" />
              <Field b={b} label="Pontos de vida temporários" path="hpt" type="number" min={0} />
            </div>
          </section>
          <section className="box">
            <div className="vitals two">
              <Field b={b} label="Dados de vida" path="hd" maxLength={30} placeholder="Ex.: 5d8" />
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
            <h3>Ataques e conjuração</h3>
            <Attacks b={b} />
          </section>
          <section className="box">
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
                    onChange={(e) => b.set('co.' + k, e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </label>
              ))}
            </div>
            <Area b={b} label="Itens e equipamento" path="eq" rows={9} />
          </section>
        </div>

        <div className="sh-col">
          <section className="box">
            <Area b={b} label="Traços de personalidade" path="pt" rows={3} />
          </section>
          <section className="box">
            <Area b={b} label="Ideais" path="id" rows={3} />
          </section>
          <section className="box">
            <Area b={b} label="Vínculos" path="vn" rows={3} />
          </section>
          <section className="box">
            <Area b={b} label="Defeitos" path="df" rows={3} />
          </section>
          <section className="box">
            <Area b={b} label="Características e traços" path="ft" rows={18} />
          </section>
        </div>
      </div>
    </>
  );
}

export function DetailsPage({ b }: { b: SheetBinding }) {
  return (
    <>
      <div className="sh-head">
        <Field b={b} label="Nome do personagem" path="nm" maxLength={80} className="wide" />
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

function SpellLines({ b, level, count }: { b: SheetBinding; level: number; count: number }) {
  return (
    <ul className="spell-lines">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          {level > 0 && <Check b={b} path={`sp.${level}.${i}.p`} label="Preparada" />}
          <input
            type="text"
            maxLength={60}
            aria-label={`Magia ${i + 1} de ${level ? 'nível ' + level : 'truque'}`}
            value={asText(getPath(b.sheet, `sp.${level}.${i}.n`))}
            onChange={(e) => b.set(`sp.${level}.${i}.n`, e.target.value)}
          />
        </li>
      ))}
    </ul>
  );
}

export function SpellsPage({ b }: { b: SheetBinding }) {
  const d = derive(b.sheet);
  return (
    <>
      <div className="sh-head">
        <Field b={b} label="Classe conjuradora" path="sc" maxLength={40} className="wide" />
        <label className="sf">
          <span>Atributo de conjuração</span>
          <select value={asText(b.sheet.sa)} onChange={(e) => b.set('sa', e.target.value)}>
            <option value="">—</option>
            <option value="int">Inteligência</option>
            <option value="sab">Sabedoria</option>
            <option value="car">Carisma</option>
          </select>
        </label>
        <div className="sf">
          <span>CD de resistência</span>
          <output className="big">{d.spellDc ?? '—'}</output>
        </div>
        <div className="sf">
          <span>Bônus de ataque</span>
          <output className="big">{d.spellAttack === null ? '—' : formatBonus(d.spellAttack)}</output>
        </div>
      </div>
      <p className="hint">Marque a caixa à esquerda de cada magia para indicá-la como preparada.</p>
      <div className="spell-grid">
        <section className="box spell-level">
          <h3>Truques</h3>
          <SpellLines b={b} level={0} count={CANTRIP_LINES} />
        </section>
        {Object.entries(SPELL_LINES).map(([lvl, count]) => (
          <section className="box spell-level" key={lvl}>
            <h3>Nível {lvl}</h3>
            <div className="slots">
              <Field b={b} label="Espaços totais" path={`sl.${lvl}.t`} type="number" min={0} max={9} />
              <Field b={b} label="Espaços gastos" path={`sl.${lvl}.e`} type="number" min={0} max={9} />
            </div>
            <SpellLines b={b} level={Number(lvl)} count={count} />
          </section>
        ))}
      </div>
    </>
  );
}
