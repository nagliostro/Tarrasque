'use client';

import type { InputHTMLAttributes } from 'react';
import { getPath, type Build, type Sheet } from '../domain/sheet';

/** Acesso à ficha para as páginas: leitura por caminho e gravação (dispara o salvamento automático). */
export interface SheetBinding {
  sheet: Sheet;
  /** A ficha resolvida pelas regras do jogo: valores derivados, opções válidas e pendências. */
  build: Build;
  set: (path: string, value: unknown) => void;
}

const asText = (v: unknown) => (v === undefined || v === null ? '' : String(v));

type InputExtras = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'maxLength' | 'min' | 'max' | 'placeholder'
>;

interface FieldProps extends InputExtras {
  b: SheetBinding;
  label: string;
  path: string;
  type?: 'text' | 'number';
  className?: string;
  /** Obrigatório: vazio, ganha o contorno de pendência. */
  required?: boolean;
}

export function Field({
  b,
  label,
  path,
  type = 'text',
  className = '',
  required,
  ...extras
}: FieldProps) {
  const missing = required === true && asText(getPath(b.sheet, path)).trim() === '';
  return (
    <label className={'sf ' + className}>
      <span>{label}</span>
      <input
        {...extras}
        type={type}
        aria-invalid={missing || undefined}
        data-missing={missing || undefined}
        value={asText(getPath(b.sheet, path))}
        onChange={(e) =>
          b.set(
            path,
            type === 'number'
              ? e.target.value === ''
                ? ''
                : Number(e.target.value)
              : e.target.value,
          )
        }
      />
    </label>
  );
}

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  b: SheetBinding;
  label: string;
  path: string;
  options: readonly Option[];
  /** Texto da opção vazia; sem ele a opção vazia não aparece. */
  empty?: string;
  className?: string;
  disabled?: boolean;
  /** Obrigatório: vazio, ganha o contorno de pendência. */
  required?: boolean;
}

/** Lista fechada: o valor gravado é sempre uma das opções (ou vazio). */
export function SelectField({
  b,
  label,
  path,
  options,
  empty,
  className = '',
  disabled,
  required,
}: SelectProps) {
  const missing = required === true && asText(getPath(b.sheet, path)) === '';
  return (
    <label className={'sf ' + className}>
      <span>{label}</span>
      <select
        name={path}
        aria-label={label}
        aria-invalid={missing || undefined}
        data-missing={missing || undefined}
        value={asText(getPath(b.sheet, path))}
        disabled={disabled}
        onChange={(e) => b.set(path, e.target.value)}
      >
        {empty !== undefined && <option value="">{empty}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Area({
  b,
  label,
  path,
  rows,
}: {
  b: SheetBinding;
  label: string;
  path: string;
  rows: number;
}) {
  return (
    <label className="sf">
      <span>{label}</span>
      <textarea
        rows={rows}
        maxLength={6000}
        value={asText(getPath(b.sheet, path))}
        onChange={(e) => b.set(path, e.target.value)}
      />
    </label>
  );
}

export function Check({ b, path, label }: { b: SheetBinding; path: string; label: string }) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={getPath(b.sheet, path) === true}
      onChange={(e) => b.set(path, e.target.checked)}
    />
  );
}

export { asText };
