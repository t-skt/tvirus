import { baseUrl } from '@shared/utils/baseUrl';

const apps = [
  { slug: 'cirno-donation', title: '치르노 기부', desc: '⑨', emoji: '🧊', color: '#7ec8e3', ready: true },
  { slug: 'gacha-game', title: '동방 가챠', desc: '캐릭터 뽑기', emoji: '🎰', color: '#ff66cc', ready: true },
  { slug: 'danmaku-dodge', title: '탄막 회피', desc: '미니 슈팅', emoji: '🎯', color: '#9933ff', ready: true },
  { slug: 'replay-scoreboard', title: '리플레이 점수판', desc: '점수 시각화', emoji: '📊', color: '#33cc99', ready: true },
  { slug: 'touhou-vote-chart', title: '인기투표 차트', desc: '차트 생성기', emoji: '📈', color: '#ff9933', ready: true },
  { slug: 'introduce-form', title: '소개 카드', desc: '카드 생성기', emoji: '💳', color: '#cc6699', ready: true },
  { slug: 'character-tool', title: '캐릭터 툴', desc: 'AA 생성기', emoji: '🛠️', color: '#666699', ready: true },
  { slug: 'shisensho', title: '시센쇼', desc: '마작 퍼즐', emoji: '🀄', color: '#cc3333', ready: true },
  { slug: 'touhou-favorites-chart', title: '동방 즐겨찾기', desc: '취향 차트', emoji: '⭐', color: '#ffcc00', ready: true },
];

export default function App() {
  return (
    <main style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>tvirus</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>동방 인터랙티브 장난감 모음.</p>
      <ul className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', listStyle: 'none', padding: 0 }}>
        {apps.map(a => (
          <li key={a.slug} style={{ borderLeft: `4px solid ${a.color}`, padding: '1rem', background: '#fafafa', borderRadius: 8, opacity: a.ready ? 1 : 0.5 }}>
            <a href={a.ready ? baseUrl(`apps/${a.slug}/`) : '#'} aria-disabled={!a.ready} style={{ textDecoration: 'none', color: 'inherit', display: 'block', pointerEvents: a.ready ? 'auto' : 'none' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: 6 }}>{a.emoji}</span>
              <h2 style={{ fontSize: '1.1rem', margin: '0 0 4px 0' }}>{a.title}{!a.ready && ' (준비 중)'}</h2>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#777' }}>{a.desc}</p>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
