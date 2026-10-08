'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signInAction, signUpAction, type FormState } from '../application/actions';

const COPY = {
  login: {
    title: 'Entrar',
    subtitle: 'Continue de onde parou na última sessão.',
    submit: 'Entrar',
    pending: 'Entrando…',
    switchText: 'Ainda não tem conta?',
    switchLink: 'Criar conta',
    switchHref: '/register',
  },
  register: {
    title: 'Criar conta',
    subtitle: 'Guarde seus personagens e campanhas em um só lugar.',
    submit: 'Criar conta',
    pending: 'Criando…',
    switchText: 'Já tem conta?',
    switchLink: 'Entrar',
    switchHref: '/login',
  },
} as const;

const initial: FormState = {};

function Field({
  name,
  label,
  type = 'text',
  autoComplete,
  maxLength,
  minLength,
  defaultValue,
  invalid,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete: string;
  maxLength?: number;
  minLength?: number;
  defaultValue?: string;
  invalid?: boolean;
}) {
  return (
    <div className="field">
      <input
        id={`field-${name}`}
        name={name}
        type={type}
        placeholder=" "
        autoComplete={autoComplete}
        maxLength={maxLength}
        minLength={minLength}
        defaultValue={defaultValue}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? 'auth-error' : undefined}
        required
      />
      <label htmlFor={`field-${name}`}>{label}</label>
    </div>
  );
}

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const copy = COPY[mode];
  const [state, formAction, pending] = useActionState(
    mode === 'login' ? signInAction : signUpAction,
    initial,
  );

  return (
    <div className="auth-card">
      <p className="eyebrow">TARRASQUE</p>
      <h1>
        {copy.title}
        <span>.</span>
      </h1>
      <p className="subtitle">{copy.subtitle}</p>

      <form action={formAction} className="auth-form">
        {mode === 'register' && (
          <Field
            name="name"
            label="Nome"
            autoComplete="name"
            maxLength={32}
            defaultValue={state.values?.name}
            invalid={!!state.error}
          />
        )}
        <Field
          name="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          defaultValue={state.values?.email}
          invalid={!!state.error}
        />
        <Field
          name="password"
          label="Senha"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          maxLength={128}
          minLength={mode === 'register' ? 8 : undefined}
          invalid={!!state.error}
        />
        {state.error && (
          <p className="auth-error" id="auth-error" role="alert">
            {state.error}
          </p>
        )}
        <button type="submit" className="primary auth-submit" disabled={pending}>
          {pending ? copy.pending : copy.submit}
        </button>
      </form>

      <p className="auth-switch">
        {copy.switchText} <Link href={copy.switchHref}>{copy.switchLink}</Link>
      </p>
    </div>
  );
}
