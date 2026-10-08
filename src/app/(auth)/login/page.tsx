import type { Metadata } from 'next';
import { AuthForm } from '@/modules/identity';

export const metadata: Metadata = { title: 'Entrar' };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
