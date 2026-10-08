import { redirect } from 'next/navigation';
import { DEFAULT_SLUG } from '@/modules/shared';

export default function Home() {
  redirect(`/${DEFAULT_SLUG}`);
}
