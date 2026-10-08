'use client';

import type { InputHTMLAttributes } from 'react';
import { getPath, type Sheet } from '../domain/sheet';

/** Acesso à ficha para as páginas: leitura por caminho e gravação (dispara o salvamento automático). */
export interface SheetBinding {
  sheet: Sheet;
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
}

export function Field({ b, label, path, type = 'text', className = '', ...extras }: FieldProps) {
  return (
    <label className={'sf ' + className}>
      <span>{label}</span>
      <input
        {...extras}
        type={type}
        value={asText(getPath(b.sheet, path))}
        onChange={(e) =>
          b.set(path, type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)
        }
      />
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
