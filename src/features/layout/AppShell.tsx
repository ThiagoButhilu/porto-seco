'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import type { UserRole } from '@/domain/entities';
import { useSessionStore } from '@/features/auth/sessionStore';
import { SubmissionsDrawer } from '@/features/endorsement/components/SubmissionsDrawer';
import { useSubmissionNotifications } from '@/features/endorsement/hooks/useSubmissionNotifications';
import { useActiveSubmissions } from '@/features/endorsement/store/submissionsStore';
import { Button, Icon, type IconName } from '@/shared/ui';
import { Brand } from './Brand';
import styles from './AppShell.module.scss';

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/endorsements', label: 'Averbação', icon: 'fileUp' },
  { href: '/documents', label: 'Consulta de documentos', icon: 'search' },
];

const ROLE_LABEL: Record<UserRole, string> = {
  OPERATOR: 'Operador',
  BROKER: 'Despachante',
  ADMIN: 'Administrador',
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSessionStore((state) => state.user);
  const signOut = useSessionStore((state) => state.signOut);
  const activeCount = useActiveSubmissions();
  const [menuOpen, setMenuOpen] = useState(false);
  const [submissionsOpen, setSubmissionsOpen] = useState(false);

  useSubmissionNotifications();

  useEffect(() => setMenuOpen(false), [pathname]);

  const handleSignOut = () => {
    signOut();
    router.replace('/login');
  };

  const initials = (user?.name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={styles.shell}>
      <a href="#content" className={styles.skipLink}>
        Pular para o conteúdo
      </a>

      <aside className={clsx(styles.sidebar, menuOpen && styles.sidebarOpen)} aria-label="Menu principal">
        <div className={styles.sidebarHeader}>
          <Brand inverse />
        </div>
        <nav className={styles.nav}>
          <span className={styles.navLabel}>Módulo de documentos</span>
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(styles.navItem, active && styles.navItemActive)}
                aria-current={active ? 'page' : undefined}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          <span className={styles.avatar} aria-hidden>
            {initials}
          </span>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name}</span>
            <span className={styles.userRole}>{user && ROLE_LABEL[user.role]}</span>
          </div>
          <button type="button" className={styles.logout} onClick={handleSignOut} aria-label="Sair">
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>

      {menuOpen && <div className={styles.overlay} onClick={() => setMenuOpen(false)} aria-hidden />}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.menuButton}>
            <Button
              variant="ghost"
              icon="menu"
              iconOnly
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            />
          </span>
          <div className={styles.mobileBrand}>
            <Brand compact />
          </div>
          <div className={styles.topbarActions}>
            <button
              type="button"
              className={clsx(styles.submissionsButton, activeCount > 0 && styles.submissionsButtonActive)}
              onClick={() => setSubmissionsOpen(true)}
              aria-haspopup="dialog"
            >
              <Icon name="layers" size={18} />
              <span className={styles.submissionsLabel}>Envios</span>
              {activeCount > 0 && (
                <span className={styles.submissionsCount} aria-label={`${activeCount} em andamento`}>
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <main id="content" className={styles.content}>
          {children}
        </main>
      </div>

      <SubmissionsDrawer open={submissionsOpen} onClose={() => setSubmissionsOpen(false)} />
    </div>
  );
}
