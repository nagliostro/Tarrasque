'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { DEFAULT_SLUG, NAV_GROUPS, findSection } from '../sections';
import { THEMES, initials, parseTheme, type ThemeName } from '../theme';
import { Dialog } from './dialog';
import { MotionSwitch } from './motion-switch';
import { Icon } from './icon';
import { ToastProvider, useToast } from './toast';

const MOBILE_QUERY = '(max-width:768px)';

function subscribeMobile(onChange: () => void) {
  const media = matchMedia(MOBILE_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function useIsMobile() {
  return useSyncExternalStore(
    subscribeMobile,
    () => matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

function paintTheme(name: ThemeName) {
  document.documentElement.dataset.theme = name;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEMES[name].bg);
}

/** Operações de servidor injetadas pela rota (o módulo shared não conhece identity). */
export interface ShellActions {
  savePreferences: (input: { theme?: ThemeName; sidebarCollapsed?: boolean }) => Promise<unknown>;
  saveDisplayName: (name: string) => Promise<{ ok: boolean; name: string }>;
  signOut: () => Promise<void>;
}

interface ShellProps {
  initialTheme: ThemeName;
  initialCollapsed: boolean;
  initialProfile: string;
  actions: ShellActions;
  children: React.ReactNode;
}

export function AppShell(props: ShellProps) {
  return (
    <ToastProvider>
      <Shell {...props} />
    </ToastProvider>
  );
}

type DialogKind = 'settings' | 'profile' | null;

function Shell({ initialTheme, initialCollapsed, initialProfile, actions, children }: ShellProps) {
  const pathname = usePathname();
  const notify = useToast();
  const mobile = useIsMobile();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeName>(initialTheme);
  const [profile, setProfile] = useState(initialProfile);
  const [dialog, setDialog] = useState<DialogKind>(null);

  const slug = pathname.split('/')[1] || DEFAULT_SLUG;
  const section = findSection(slug);
  const drawerOpen = mobile && mobileOpen;
  const expanded = mobile ? drawerOpen : !collapsed;
  const label = expanded ? 'Recolher sidebar' : 'Expandir sidebar';

  const closeNav = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobile) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !dialog) {
        closeNav();
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobile, dialog, closeNav]);

  function toggle() {
    if (mobile) {
      setMobileOpen(!drawerOpen);
      return;
    }
    const next = !collapsed;
    setCollapsed(next);
    actions.savePreferences({ sidebarCollapsed: next }).catch(() => {
      setCollapsed(!next);
      notify('Não foi possível salvar a preferência.');
    });
  }

  // O tema salvo na conta prevalece sobre o cookie (ex.: cookie apagado ou outro dispositivo).
  useEffect(() => {
    if (document.documentElement.dataset.theme !== initialTheme) paintTheme(initialTheme);
  }, [initialTheme]);

  async function applyTheme(next: ThemeName) {
    const previous = theme;
    paintTheme(next);
    setTheme(next);
    try {
      await actions.savePreferences({ theme: next });
      notify('Configurações salvas.');
    } catch {
      paintTheme(previous);
      setTheme(previous);
      notify('Não foi possível salvar as configurações.');
    }
  }

  async function applyProfile(name: string) {
    try {
      const result = await actions.saveDisplayName(name);
      setProfile(result.name);
      notify('Perfil atualizado.');
    } catch {
      notify('Não foi possível atualizar o perfil.');
    }
  }

  return (
    <>
      <button
        className="backdrop"
        aria-label="Fechar navegação"
        hidden={!(mobile && expanded)}
        onClick={() => {
          closeNav();
          toggleRef.current?.focus();
        }}
      />
      <aside
        className={`sidebar${!mobile && collapsed ? ' collapsed' : ''}${drawerOpen ? ' mobile-open' : ''}`}
        id="sidebar"
        aria-label="Navegação principal"
        inert={mobile && !expanded}
      >
        <div className="brand">
          <Icon name="tarrasque" />
          <span>
            Tarrasque<span className="brand-dot">.</span>
          </span>
        </div>
        <div className="nav-label">ESPAÇO DE AVENTURA</div>
        <nav aria-label="Áreas do Tarrasque">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} style={{ display: 'contents' }}>
              <p className="nav-group">{group.label}</p>
              {group.slugs.map((itemSlug) => {
                const item = findSection(itemSlug)!;
                const active = itemSlug === slug;
                return (
                  <Link
                    key={itemSlug}
                    href={`/${itemSlug}`}
                    className={`nav-item${active ? ' active' : ''}`}
                    title={item.title}
                    onClick={closeNav}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon name={item.icon} />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Icon name="dice" />
            <span>
              Toda grande história
              <br />
              começa com uma rolagem.
            </span>
          </div>
          <div className="user-row">
            <button
              className="profile"
              title="Perfil do usuário"
              onClick={() => setDialog('profile')}
            >
              <span className="avatar">{initials(profile)}</span>
              <span className="user-text">
                <strong>{profile}</strong>
                <small>Pronto para a próxima sessão</small>
              </span>
            </button>
            <button
              className="icon-button"
              title="Configurações"
              aria-label="Configurações"
              onClick={() => setDialog('settings')}
            >
              <Icon name="gear" />
            </button>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            ref={toggleRef}
            className="icon-button"
            aria-label={label}
            aria-controls="sidebar"
            aria-expanded={expanded}
            title={label}
            onClick={toggle}
          >
            <Icon name="panel" />
          </button>
          <div className="breadcrumb">
            Meu espaço <span>/</span> <strong>{section?.title ?? ''}</strong>
          </div>
          <MotionSwitch />
        </header>
        <main id="main">
          {children}
          <footer>
            <span>
              <Icon name="tarrasque" /> TARRASQUE <span className="version">/ v.01</span>
            </span>
            <span>O próximo capítulo é seu.</span>
          </footer>
        </main>
      </div>

      <Dialog
        open={dialog === 'settings'}
        title="Configurações"
        onClose={() => setDialog(null)}
        onSubmit={(data) => {
          void applyTheme(parseTheme(String(data.get('theme'))));
          setDialog(null);
        }}
      >
        <label>
          Tema
          <select name="theme" defaultValue={theme}>
            {(Object.keys(THEMES) as ThemeName[]).map((key) => (
              <option key={key} value={key}>
                {THEMES[key].label}
              </option>
            ))}
          </select>
        </label>
      </Dialog>

      <Dialog
        open={dialog === 'profile'}
        title="Seu perfil"
        onClose={() => setDialog(null)}
        onSubmit={(data) => {
          void applyProfile(String(data.get('name')));
          setDialog(null);
        }}
        footerStart={
          <button type="button" className="secondary danger" onClick={() => void actions.signOut()}>
            Sair da conta
          </button>
        }
      >
        <label>
          Nome de exibição
          <input name="name" maxLength={32} defaultValue={profile} autoComplete="nickname" />
        </label>
      </Dialog>
    </>
  );
}
