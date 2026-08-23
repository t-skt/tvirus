import { type Category, appsInCategory } from '../apps';
import { AppCard } from './AppCard';
import styles from '../gallery.module.css';

interface CategorySectionProps { category: Category; }

export function CategorySection({ category }: CategorySectionProps) {
  const apps = appsInCategory(category.id);
  if (apps.length === 0) return null;   // E4: no orphan heading
  return (
    <section className={styles.section} aria-labelledby={`cat-${category.id}`}>
      <div className={styles.sectionHead}>
        <h2 id={`cat-${category.id}`} className={styles.sectionTitle}>{category.label}</h2>
        <span className={styles.sectionCount}>{apps.length}개</span>
      </div>
      <ul className={styles.grid}>
        {apps.map(app => <AppCard key={app.slug} app={app} />)}
      </ul>
    </section>
  );
}
