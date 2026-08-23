import { CATEGORIES } from './apps';
import { CategorySection } from './components/CategorySection';
import styles from './gallery.module.css';

export default function App() {
  return (
    <main className={styles.page}>
      <header>
        <h1 className={styles.title}>tvirus <span className={styles.titleAccent}>허브</span></h1>
        <p className={styles.subtitle}>동방 인터랙티브 앱 모음 — 통합 갤러리</p>
      </header>
      {CATEGORIES.map(c => (
        <CategorySection key={c.id} category={c} />
      ))}
    </main>
  );
}
