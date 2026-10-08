import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/modules/identity';
import { Icon, Sprite } from '@/modules/shared';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getCurrentUser()) redirect('/');

  return (
    <>
      <Sprite />
      <div className="auth">
        <main className="auth-form-side">{children}</main>
        <aside className="auth-cover" aria-hidden="true">
          <div className="auth-cover-brand">
            <Icon name="tarrasque" />
            <span>Tarrasque.</span>
          </div>
          <p className="auth-cover-quote">Toda grande história começa com uma rolagem.</p>
        </aside>
      </div>
    </>
  );
}
