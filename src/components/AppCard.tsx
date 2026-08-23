import { useState, type CSSProperties } from 'react';
import { type AppEntry, appHref, dotSrc } from '../apps';
import styles from '../gallery.module.css';

interface AppCardProps { app: AppEntry; }

export function AppCard({ app }: AppCardProps) {
  const [spriteFailed, setSpriteFailed] = useState(false);
  const liClass = app.ready ? styles.card : `${styles.card} ${styles.cardDisabled}`;
  const liStyle = { '--card-accent': app.color } as CSSProperties;
  const avatar = (
    <span className={styles.avatar} aria-hidden="true">
      {spriteFailed
        ? app.emoji
        : <img className={styles.avatarImg} src={dotSrc(app)} alt=""
               width={48} height={48} draggable={false}
               onError={() => setSpriteFailed(true)} />}
    </span>
  );
  const body = (
    <>
      {avatar}
      <h3 className={styles.cardTitle}>{app.title}{!app.ready && ' (준비 중)'}</h3>
      <p className={styles.cardDesc}>{app.desc}</p>
    </>
  );
  return (
    <li className={liClass} style={liStyle}>
      {app.ready
        ? <a className={styles.cardLink} href={appHref(app.slug)}>{body}</a>
        : <div className={styles.cardLink}>{body}</div>}
    </li>
  );
}
