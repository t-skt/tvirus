import { baseUrl } from '@shared/utils/baseUrl';

/** Render + within-category order comes from this array. Order is the contract. */
export const APP_SLUGS = [
  'cirno-donation', 'gacha-game', 'danmaku-dodge',
  'replay-scoreboard', 'touhou-vote-chart', 'touhou-favorites-chart',
  'introduce-form', 'character-tool',
  'shisensho', 'fortune-slip',
] as const;
export type AppSlug = typeof APP_SLUGS[number];

/**
 * CategoryId is DERIVED from CATEGORIES (F-1). Omitting a category below is a tsc error
 * (TS2322/TS2353/TS2367), not a silent drop. The draft's `readonly Category[]` + separate
 * literal union was proven to exit 0 when a category vanished.
 */
export const CATEGORIES = [
  { id: 'game',      label: '게임' },
  { id: 'chart',     label: '차트·시각화' },   // U+00B7 middle dot, not '/'
  { id: 'generator', label: '생성기' },
  { id: 'puzzle',    label: '퍼즐' },
] as const satisfies readonly { readonly id: string; readonly label: string }[];

export type CategoryId = (typeof CATEGORIES)[number]['id'];
export type Category = (typeof CATEGORIES)[number];

export interface AppEntry {
  readonly slug: AppSlug;
  readonly title: string;
  readonly desc: string;
  /** fallback glyph shown inside the avatar frame when the sprite fails (D6) */
  readonly emoji: string;
  /** per-card accent colour, carried into CSS as --card-accent */
  readonly color: string;
  readonly category: CategoryId;
  /** bare sprite name under public/dot/, no extension (F-7) — e.g. 'cirno' */
  readonly dot: string;
  readonly ready: boolean;
}

/**
 * Record keyed by AppSlug: omitting a slug, or omitting `category`/`dot` on one,
 * fails `tsc --noEmit`. Combined with the derived CategoryId, this is the AC-13 guard.
 */
const RECORDS: Record<AppSlug, Omit<AppEntry, 'slug'>> = {
  'cirno-donation':        { title: '치르노 기부',     desc: '⑨',           emoji: '🧊',  color: '#7ec8e3', category: 'game',      dot: 'cirno',             ready: true },
  'gacha-game':            { title: '동방 가챠',       desc: '캐릭터 뽑기',  emoji: '🎰',  color: '#ff66cc', category: 'game',      dot: 'marisa_kirisame',   ready: true },
  'danmaku-dodge':         { title: '탄막 회피',       desc: '미니 슈팅',    emoji: '🎯',  color: '#9933ff', category: 'game',      dot: 'reimu_hakurei',     ready: true },
  'replay-scoreboard':     { title: '리플레이 점수판', desc: '점수 시각화',  emoji: '📊',  color: '#33cc99', category: 'chart',     dot: 'hieda_no_akyuu',    ready: true },
  'touhou-vote-chart':     { title: '인기투표 차트',   desc: '차트 생성기',  emoji: '📈',  color: '#ff9933', category: 'chart',     dot: 'aya_shameimaru',    ready: true },
  'touhou-favorites-chart':{ title: '동방 즐겨찾기',   desc: '취향 차트',    emoji: '⭐',  color: '#ffcc00', category: 'chart',     dot: 'patchouli_knowledge', ready: true },
  'introduce-form':        { title: '소개 카드',       desc: '카드 생성기',  emoji: '💳',  color: '#cc6699', category: 'generator', dot: 'kosuzu_motoori',    ready: true },
  'character-tool':        { title: '캐릭터 툴',       desc: 'AA 생성기',    emoji: '🛠️', color: '#666699', category: 'generator', dot: 'nitori_kawashiro',  ready: true },
  'shisensho':             { title: '시센쇼',          desc: '마작 퍼즐',    emoji: '🀄',  color: '#cc3333', category: 'puzzle',    dot: 'suika_ibuki',       ready: true },
  'fortune-slip':          { title: '오늘의 신사',     desc: '동방환존신첨', emoji: '🎴',  color: '#ff4444', category: 'puzzle',    dot: 'sanae_kochiya',     ready: true },
};

export const APPS: readonly AppEntry[] =
  APP_SLUGS.map(slug => ({ slug, ...RECORDS[slug] }));

/**
 * Dev-only invariant (F-1 follow-up): once CategoryId is derived, the only realistic failure
 * is a copy-paste slip in the four near-identical filters (e.g. `generator` filtering on
 * `'game'`). Report PER-CATEGORY COUNTS, not an empty "lost" list.
 */
const BY_CATEGORY: Record<CategoryId, readonly AppEntry[]> = {
  game:      APPS.filter(a => a.category === 'game'),
  chart:     APPS.filter(a => a.category === 'chart'),
  generator: APPS.filter(a => a.category === 'generator'),
  puzzle:    APPS.filter(a => a.category === 'puzzle'),
};

if (import.meta.env.DEV) {
  const counts = CATEGORIES.map(c => `${c.id}:${BY_CATEGORY[c.id].length}`).join(' ');
  const total = APPS.reduce((n, a) => n + (BY_CATEGORY[a.category]?.includes(a) ? 1 : 0), 0);
  if (total !== APPS.length) {
    console.error(`[gallery] category partition mismatch (${counts}) — total ${total}/${APPS.length}`);
  }
}

export const appsInCategory = (id: CategoryId): readonly AppEntry[] => BY_CATEGORY[id];

/** F-7: takes AppSlug (not a raw string). The ONLY place that builds an app href. */
export const appHref = (slug: AppSlug) => baseUrl(`apps/${slug}/`);
/** F-7: takes AppEntry; appends .png (house convention). Sprites are served from public/dot/ —
 * NOT shared/assets/dot/, which is an unused mirror (D1). */
export const dotSrc = (app: AppEntry) => baseUrl(`dot/${app.dot}.png`);
