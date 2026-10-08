import {
  requireUser,
  saveDisplayNameAction,
  savePreferencesAction,
  signOutAction,
} from '@/modules/identity';
import { AppShell, Sprite } from '@/modules/shared';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <Sprite />
      <AppShell
        initialTheme={user.theme}
        initialCollapsed={user.sidebarCollapsed}
        initialProfile={user.displayName}
        actions={{
          savePreferences: savePreferencesAction,
          saveDisplayName: saveDisplayNameAction,
          signOut: signOutAction,
        }}
      >
        {children}
      </AppShell>
    </>
  );
}
