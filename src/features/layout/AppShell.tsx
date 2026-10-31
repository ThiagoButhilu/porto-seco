'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useSessionStore } from '@/features/auth/sessionStore';
import { EnviosDrawer } from '@/features/averbacao/components/EnviosDrawer';
import { useEnviosNotificacoes } from '@/features/averbacao/hooks/useEnviosNotificacoes';
import { useEnviosAtivos } from '@/features/averbacao/store/enviosStore';
import { Button, Icon, type IconName } from '@/shared/ui';
import { Brand } from './Brand';
import styles from './AppShell.module.scss';

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/averbacao', label: 'Averbação', icon: 'fileUp' },
  { href: '/documentos', label: 'Consulta de documentos', icon: 'search' },
];

const PERFIL_LABEL = { OPERADOR: 'Operador', DESPACHANTE: 'Despachante', ADMINISTRADOR: 'Administrador' };

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const usuario = useSessionStore((state) => state.usuario);
  const sair = useSessionStore((state) => state.sair);
  const ativos = useEnviosAtivos();
  const [menuAberto, setMenuAberto] = useState(false);
  const [enviosAbertos, setEnviosAbertos] = useState(false);

  useEnviosNotificacoes();

  useEffect(() => setMenuAberto(false), [pathname]);

  const handleSair = () => {
    sair();
    router.replace('/login');
  };

  const iniciais = (usuario?.nome ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={styles.shell}>
      <a href="#conteudo" className={styles.skipLink}>
        Pular para o conteúdo
      </a>

      <aside className={clsx(styles.sidebar, menuAberto && styles.sidebarOpen)} aria-label="Menu principal">
        <div className={styles.sidebarHeader}>
          <Brand inverse />
        </div>
        <nav className={styles.nav}>
          <span className={styles.navLabel}>Módulo de documentos</span>
          {NAV.map((item) => {
            const ativo = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(styles.navItem, ativo && styles.navItemActive)}
                aria-current={ativo ? 'page' : undefined}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          <span className={styles.avatar} aria-hidden>
            {iniciais}
          </span>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{usuario?.nome}</span>
            <span className={styles.userRole}>{usuario && PERFIL_LABEL[usuario.perfil]}</span>
          </div>
          <button type="button" className={styles.logout} onClick={handleSair} aria-label="Sair">
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>

      {menuAberto && <div className={styles.overlay} onClick={() => setMenuAberto(false)} aria-hidden />}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.menuButton}>
            <Button
              variant="ghost"
              icon="menu"
              iconOnly
              aria-label="Abrir menu"
              aria-expanded={menuAberto}
              onClick={() => setMenuAberto(true)}
            />
          </span>
          <div className={styles.mobileBrand}>
            <Brand compact />
          </div>
          <div className={styles.topbarActions}>
            <button
              type="button"
              className={clsx(styles.enviosButton, ativos > 0 && styles.enviosButtonActive)}
              onClick={() => setEnviosAbertos(true)}
              aria-haspopup="dialog"
            >
              <Icon name="layers" size={18} />
              <span className={styles.enviosLabel}>Envios</span>
              {ativos > 0 && (
                <span className={styles.enviosCount} aria-label={`${ativos} em andamento`}>
                  {ativos}
                </span>
              )}
            </button>
          </div>
        </header>

        <main id="conteudo" className={styles.content}>
          {children}
        </main>
      </div>

      <EnviosDrawer open={enviosAbertos} onClose={() => setEnviosAbertos(false)} />
    </div>
  );
}
