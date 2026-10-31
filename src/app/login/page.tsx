import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { Brand } from '@/features/layout/Brand';
import styles from './page.module.scss';

export const metadata: Metadata = { title: 'Entrar' };

const DESTAQUES = [
  { titulo: 'Averbação em paralelo', texto: 'Envie várias DTAs sem esperar o processamento anterior.' },
  { titulo: 'DI e DUIMP', texto: 'Fluxo único para o modelo atual e o novo Portal Único.' },
  { titulo: 'Rastreabilidade', texto: 'Consulte e baixe os arquivos enviados a qualquer momento.' },
];

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <aside className={styles.hero}>
        <Brand inverse />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Recinto alfandegado</p>
          <h1 className={styles.heroTitle}>
            Averbação de documentos de importação, do trânsito ao desembaraço.
          </h1>
          <ul className={styles.highlights}>
            {DESTAQUES.map((item) => (
              <li key={item.titulo}>
                <strong>{item.titulo}</strong>
                <span>{item.texto}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className={styles.footnote}>DTA · DI · DUIMP</p>
      </aside>

      <section className={styles.panel}>
        <div className={styles.card}>
          <div className={styles.mobileBrand}>
            <Brand />
          </div>
          <header className={styles.header}>
            <h2 className={styles.title}>Acesse sua conta</h2>
            <p className={styles.subtitle}>Entre com seu e-mail corporativo para continuar.</p>
          </header>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
