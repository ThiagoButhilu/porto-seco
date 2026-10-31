import clsx from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.scss';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'article' | 'div';
  padding?: 'none' | 'md' | 'lg';
}

export function Card({ as: Tag = 'section', padding = 'lg', className, ...props }: CardProps) {
  return <Tag className={clsx(styles.card, styles[`padding-${padding}`], className)} {...props} />;
}

interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  titleAs?: 'h2' | 'h3';
}

export function CardHeader({
  title,
  description,
  eyebrow,
  actions,
  titleAs: Title = 'h2',
}: CardHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerText}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <Title className={styles.title}>{title}</Title>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
