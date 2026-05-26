import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import styles from './styles.module.css';
import './animations.css';
import { baseUrl } from '@shared/utils/baseUrl';

// ===== Constants =====
const TIME_LIMIT = 10; // seconds
const CIRCLED_DIGITS = ['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];

function toCircledNumber(n: number): string {
  return String(n).split('').map((d) => CIRCLED_DIGITS[parseInt(d, 10)]).join('');
}

// ===== Dialogue =====
const CIRNO_LINES: Record<number, string> = {
  0: '이 천재 치르노가 레이무를 도와주겠어!',
  9: '봤지? 이 천재의 모금 실력!',
  19: '⑨+⑨+⑨... 어? 뭐였더라',
  29: '레이무! 감사 인사 안 해?',
  39: '마리사한테도 자랑해야지!',
  49: '신사가 좀 따뜻해진 것 같아!',
  59: '아직도 누르고 있어? ...고마워',
  69: '⑥⑨... 뭔가 이상한 숫자다!',
  79: '거의 다 왔어! 아마도!',
  89: '⑧⑨... ⑨ 앞자리잖아! 기대돼!',
  99: '⑨⑨!! 이 천재의 완벽한 숫자!!!',
};

const REIMU_LINES: Record<number, string> = {
  0: '...',
  9: '어... 고마워?',
  29: '의외로 모이네...',
  59: '치르노... 너 의외로...',
  99: '...내년에도 와',
};

function getLine(lines: Record<number, string>, count: number): string {
  const keys = Object.keys(lines).map(Number).sort((a, b) => a - b);
  let line = lines[keys[0]];
  for (const k of keys) {
    if (count >= k) line = lines[k];
  }
  return line;
}

const CIRNO_LINES_OVER_99 = [
  '이 천재의 모금은 멈추지 않아!',
  '아직도 더 갈 수 있어!',
  '레이무, 신사 수리비 준비해!',
  '마리사보다 더 많이 모았을걸?',
  '하쿠레이 신사 최고 기록 갱신!',
];

function getCirnoLine(count: number): string {
  if (count > 99 && count % 10 === 9) {
    return `${toCircledNumber(count)}회! 아직 끝이 아니야!`;
  }
  if (count > 99) {
    return CIRNO_LINES_OVER_99[Math.floor((count - 100) / 10) % CIRNO_LINES_OVER_99.length];
  }
  return getLine(CIRNO_LINES, count);
}

function getReimuLine(count: number): string {
  if (count > 99) return '...또 왔구나';
  return getLine(REIMU_LINES, count);
}

// ===== Effects — exact copies of toho-vote components =====
type EffectId = 'TH06' | 'TH07' | 'TH08' | 'TH09' | 'TH10' | 'TH11' | 'TH12' | 'TH13' | 'TH14' | 'TH15' | 'TH16' | 'TH17' | 'TH18' | 'TH19' | 'TH20' | 'REIMU' | 'MARISA';

const ALL_EFFECT_IDS: EffectId[] = [
  'TH06', 'TH07', 'TH08', 'TH09', 'TH10', 'TH11', 'TH12',
  'TH13', 'TH14', 'TH15', 'TH16', 'TH17', 'TH18', 'TH19', 'TH20',
  'REIMU', 'MARISA',
];


// ===== Effect Components (exact toho-vote replicas using global CSS) =====

function TH06ScarletMoon() {
  return (
    <>
      <div className="particle castle-silhouette" />
      <div className="particle scarlet-moon-v2" />
    </>
  );
}

function TH07SakuraFan({ isMobile }: { isMobile: boolean }) {
  const particleCount = isMobile ? 30 : 60;
  const sakuraParticles = useMemo(() =>
    Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + 'vw',
      top: (Math.random() * -30) + 'vh',
      delay: (Math.random() * 0.5) + 's',
      drift: (Math.random() * 40 - 20) + 'vw'
    })), [particleCount]);
  return (
    <>
      <div className="particle th07-fan"><div className="th07-fan-ribs" /></div>
      {sakuraParticles.map(p => (
        <div key={p.id} className="particle sakura-v3"
          style={{ width: '20px', height: '20px', left: p.left, top: p.top, animationDelay: p.delay, '--drift': p.drift } as React.CSSProperties} />
      ))}
    </>
  );
}

function TH08BambooMoon({ isMobile }: { isMobile: boolean }) {
  const stalks = useMemo(() => {
    const left = Array.from({ length: isMobile ? 2 : 4 }).map((_, i) => ({
      id: `l-${i}`, left: (Math.random() * 20) + 'vw', delay: (Math.random() * 1) + 's'
    }));
    const right = Array.from({ length: isMobile ? 2 : 4 }).map((_, i) => ({
      id: `r-${i}`, left: (80 + Math.random() * 20) + 'vw', delay: (Math.random() * 1) + 's'
    }));
    return [...left, ...right];
  }, [isMobile]);
  return (
    <>
      {stalks.map(s => (
        <div key={s.id} className="particle bamboo-stalk" style={{ left: s.left, animationDelay: s.delay }}>
          {Array.from({ length: 6 }).map((_, j) => (
            <div key={j} className="bamboo-leaf" style={{
              top: (10 + j * 15) + '%', left: j % 2 === 0 ? '30px' : '-50px',
              transform: j % 2 === 0 ? 'rotate(15deg)' : 'rotate(165deg)'
            }} />
          ))}
        </div>
      ))}
      <div className="particle round-moon" />
    </>
  );
}

function TH09Higanbana({ isMobile }: { isMobile: boolean }) {
  const flowerCount = isMobile ? 6 : 12;
  const flowers = useMemo(() => Array.from({ length: flowerCount }).map((_, i) => ({
    id: i, left: (Math.random() * 80 + 10) + 'vw', top: (Math.random() * 80 + 10) + 'vh', delay: (Math.random() * 0.6) + 's'
  })), [flowerCount]);
  return (
    <>
      {flowers.map(f => (
        <div key={f.id} className="particle higanbana-flower" style={{ left: f.left, top: f.top, animationDelay: f.delay }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="higanbana-petal" style={{ transform: `rotate(${i * 45}deg) translate(-10px, -10px)` }} />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="higanbana-stamen" style={{ transform: `rotate(${i * 30 + 15}deg)` }} />
          ))}
        </div>
      ))}
    </>
  );
}

function TH10AutumnRing({ isMobile }: { isMobile: boolean }) {
  const leafCount = isMobile ? 30 : 60;
  const leaves = useMemo(() => Array.from({ length: leafCount }).map((_, i) => ({
    id: i, left: Math.random() * 100 + 'vw', top: (Math.random() * -30) + 'vh',
    delay: (Math.random() * 0.5) + 's', drift: (Math.random() * 40 - 20) + 'vw'
  })), [leafCount]);
  const shidePositions = [
    { left: '15%', top: '80%' }, { left: '85%', top: '80%' },
    { left: '50%', top: '95%' }, { left: '15%', top: '20%' }, { left: '85%', top: '20%' }
  ];
  return (
    <>
      <div className="particle th10-ring-container">
        <div className="th10-rope-ring" />
        {shidePositions.map((pos, i) => (
          <div key={i} className="th10-shide" style={{ left: pos.left, top: pos.top, animationDelay: (Math.random() * 0.5) + 's' }}>
            {Array.from({ length: 4 }).map((_, k) => (<div key={k} className="shide-seg" />))}
          </div>
        ))}
      </div>
      {leaves.map(l => (
        <div key={l.id} className="particle autumn-v3"
          style={{ width: '20px', height: '20px', left: l.left, top: l.top, animationDelay: l.delay, '--drift': l.drift } as React.CSSProperties} />
      ))}
    </>
  );
}

function TH11NuclearFlame({ isMobile }: { isMobile: boolean }) {
  const flameCount = isMobile ? 15 : 30;
  const colors = ['#ff3d00', '#ff9100', '#ffeb3b'];
  const flames = useMemo(() => Array.from({ length: flameCount }).map((_, i) => ({
    id: i, width: (Math.random() * 40 + 30) + 'px', height: (Math.random() * 40 + 30) + 'px',
    left: Math.random() * 100 + 'vw', background: colors[Math.floor(Math.random() * colors.length)],
    delay: (Math.random() * 0.5) + 's', duration: (Math.random() * 0.5 + 0.8) + 's'
  })), [flameCount]);
  return (
    <>
      {flames.map(f => (
        <div key={f.id} className="particle nuclear-flame-v6"
          style={{ width: f.width, height: f.height, left: f.left, background: f.background, animationDelay: f.delay, animationDuration: f.duration }} />
      ))}
      <div className="particle danger-sign-v2">{'☢'} DANGER</div>
    </>
  );
}

function TH12RainbowUFO({ isMobile }: { isMobile: boolean }) {
  const ufoCount = isMobile ? 8 : 15;
  const colors = ['red', 'green', 'blue'];
  const ufos = useMemo(() => Array.from({ length: ufoCount }).map((_, i) => ({
    id: i, background: colors[i % 3], left: Math.random() * 100 + 'vw', top: Math.random() * 100 + 'vh'
  })), [ufoCount]);
  return (
    <>
      <div className="particle rainbow-circle" style={{ width: '180px', height: '180px', left: '50%', top: '50%' }} />
      {ufos.map(u => (
        <div key={u.id} className="particle ufo-mini" style={{ background: u.background, left: u.left, top: u.top }} />
      ))}
    </>
  );
}

function TH13SpiritDesires({ isMobile }: { isMobile: boolean }) {
  const spiritCount = isMobile ? 20 : 40;
  const spirits = useMemo(() => Array.from({ length: spiritCount }).map((_, i) => ({
    id: i, left: Math.random() * 100 + 'vw', top: Math.random() * 100 + 'vh'
  })), [spiritCount]);
  return (
    <>
      {spirits.map(s => (
        <div key={s.id} className="particle spirit-v2" style={{ width: '35px', height: '35px', left: s.left, top: s.top }} />
      ))}
    </>
  );
}

function TH14BorderCard() {
  return (
    <div className="card-container">
      <div className="card-face" />
      <div className="card-face card-back" />
    </div>
  );
}

function TH15SpaceRain({ isMobile }: { isMobile: boolean }) {
  const particleCount = isMobile ? 40 : 80;
  const rainDrops = useMemo(() => Array.from({ length: particleCount }).map((_, i) => ({
    id: i, left: Math.random() * 100 + 'vw', top: Math.random() * -40 + 'vh', delay: (Math.random() * 0.8) + 's'
  })), [particleCount]);
  return (
    <>
      {rainDrops.map(r => (
        <div key={r.id} className="particle space-rain-v7" style={{ left: r.left, top: r.top, animationDelay: r.delay }} />
      ))}
    </>
  );
}

function TH16SeasonalWindows({ isMobile }: { isMobile: boolean }) {
  const windowCount = isMobile ? 6 : 12;
  const windows = useMemo(() => {
    const seasons = [{ class: 'th16-spring' }, { class: 'th16-summer' }, { class: 'th16-autumn' }, { class: 'th16-winter' }];
    return Array.from({ length: windowCount }).map((_, i) => ({
      id: i, season: seasons[Math.floor(Math.random() * seasons.length)],
      left: (Math.random() * 80 + 5) + 'vw', top: (Math.random() * 65 + 10) + 'vh', delay: (Math.random() * 0.8) + 's'
    }));
  }, [windowCount]);
  return (
    <>
      {windows.map(w => (
        <div key={w.id} className="th16-window-container particle" style={{ left: w.left, top: w.top }}>
          <div className="th16-window-scene" />
          <div className={`th16-panel th16-panel-left ${w.season.class}`} style={{ animationDelay: w.delay }} />
          <div className={`th16-panel th16-panel-right ${w.season.class}`} style={{ animationDelay: w.delay }} />
        </div>
      ))}
    </>
  );
}

function TH17BeastSpirits({ isMobile }: { isMobile: boolean }) {
  const spiritCount = isMobile ? 9 : 21;
  const beasts = useMemo(() => {
    const types = [{ icon: '🦦', color: '#4caf50' }, { icon: '🦅', color: '#9c27b0' }, { icon: '🐺', color: '#f44336' }];
    return Array.from({ length: spiritCount }).map((_, i) => ({
      id: i, beast: types[i % 3],
      durX: (Math.random() * 3 + 2).toFixed(2), delX: -(Math.random() * 5).toFixed(2),
      durY: (Math.random() * 3 + 2).toFixed(2), delY: -(Math.random() * 5).toFixed(2)
    }));
  }, [spiritCount]);
  return (
    <>
      {beasts.map(b => (
        <div key={b.id} className="particle beast-bounce-x"
          style={{ animation: `bX ${b.durX}s linear infinite alternate`, animationDelay: `${b.delX}s` }}>
          <div className="beast-bounce-y"
            style={{ background: b.beast.color, boxShadow: `0 0 20px ${b.beast.color}, inset 0 0 10px rgba(255,255,255,0.5)`,
              animation: `bY ${b.durY}s linear infinite alternate`, animationDelay: `${b.delY}s` }}>
            {b.beast.icon}
          </div>
        </div>
      ))}
    </>
  );
}

function TH18CardRain({ isMobile }: { isMobile: boolean }) {
  const particleCount = isMobile ? 20 : 45;
  const cards = useMemo(() => Array.from({ length: particleCount }).map((_, i) => ({
    id: i, left: Math.random() * 100 + 'vw', top: Math.random() * -20 + 'vh', delay: (Math.random() * 0.6) + 's'
  })), [particleCount]);
  return (
    <>
      {cards.map(c => (
        <div key={c.id} className="particle ability-card-mini" style={{ left: c.left, top: c.top, animationDelay: c.delay }} />
      ))}
    </>
  );
}

function TH19SkullArrows({ isMobile }: { isMobile: boolean }) {
  const arrowCount = isMobile ? 12 : 25;
  const arrows = useMemo(() => Array.from({ length: arrowCount }).map((_, i) => ({
    id: i, posX: Math.random() * 100, targetY: (600 + Math.random() * 200) + 'px', delay: (Math.random() * 0.8) + 's'
  })), [arrowCount]);
  return (
    <>
      {arrows.map(a => (
        <div key={a.id} className="skull-arrow-v8"
          style={{ '--posX': a.posX + 'vw', '--targetY': a.targetY,
            animation: `arrow-drop-v8 0.4s ease-in forwards, arrow-tremble-v8 0.8s 0.4s forwards`, animationDelay: a.delay } as React.CSSProperties}>
          <div className="arrow-shaft-v8" />
          <div className="arrow-head-v8">{'💀'}</div>
        </div>
      ))}
    </>
  );
}

function TH20Pyramid({ isMobile }: { isMobile: boolean }) {
  const pyramidCount = isMobile ? 6 : 12;
  const colors = ['red', 'blue', 'yellow', 'green'];
  const smallPyramids = useMemo(() => Array.from({ length: pyramidCount }).map((_, i) => ({
    id: i, color: colors[i % 4], left: Math.random() * 100 + 'vw', top: Math.random() * 100 + 'vh', delay: (Math.random() * 0.5) + 's'
  })), [pyramidCount]);
  return (
    <>
      <div className="particle pyramid-large" />
      {smallPyramids.map(p => (
        <div key={p.id} className="particle pyramid-small" style={{ borderBottomColor: p.color, left: p.left, top: p.top, animationDelay: p.delay }} />
      ))}
    </>
  );
}

function ReimuYinYang() {
  return (
    <div className="yin-yang-container">
      <div className="yin-yang-orb">
        <div className="yin-yang-dot-black" />
        <div className="yin-yang-dot-white" />
      </div>
    </div>
  );
}

function MarisaStars({ isMobile }: { isMobile: boolean }) {
  const starCount = isMobile ? 15 : 30;
  const stars = useMemo(() => Array.from({ length: starCount }).map((_, i) => {
    const angle = (Math.random() * 360) * (Math.PI / 180);
    const dist = 300 + Math.random() * 500;
    return { id: i, tx: (Math.cos(angle) * dist) + 'px', ty: (Math.sin(angle) * dist) + 'px',
      color: `hsl(${Math.random() * 360}, 70%, 70%)`, delay: (Math.random() * 0.3) + 's' };
  }), [starCount]);
  return (
    <>
      {stars.map(s => (
        <div key={s.id} className="particle rainbow-star"
          style={{ left: '50%', top: '50%', color: s.color, '--tx': s.tx, '--ty': s.ty, animationDelay: s.delay } as React.CSSProperties}>
          {'★'}
        </div>
      ))}
    </>
  );
}

function EffectRenderer({ effectId, isMobile }: { effectId: EffectId; isMobile: boolean }) {
  switch (effectId) {
    case 'TH06': return <TH06ScarletMoon />;
    case 'TH07': return <TH07SakuraFan isMobile={isMobile} />;
    case 'TH08': return <TH08BambooMoon isMobile={isMobile} />;
    case 'TH09': return <TH09Higanbana isMobile={isMobile} />;
    case 'TH10': return <TH10AutumnRing isMobile={isMobile} />;
    case 'TH11': return <TH11NuclearFlame isMobile={isMobile} />;
    case 'TH12': return <TH12RainbowUFO isMobile={isMobile} />;
    case 'TH13': return <TH13SpiritDesires isMobile={isMobile} />;
    case 'TH14': return <TH14BorderCard />;
    case 'TH15': return <TH15SpaceRain isMobile={isMobile} />;
    case 'TH16': return <TH16SeasonalWindows isMobile={isMobile} />;
    case 'TH17': return <TH17BeastSpirits isMobile={isMobile} />;
    case 'TH18': return <TH18CardRain isMobile={isMobile} />;
    case 'TH19': return <TH19SkullArrows isMobile={isMobile} />;
    case 'TH20': return <TH20Pyramid isMobile={isMobile} />;
    case 'REIMU': return <ReimuYinYang />;
    case 'MARISA': return <MarisaStars isMobile={isMobile} />;
    default: return null;
  }
}

// ===== Fool Events =====
type FoolType = 'baka' | 'marisa' | 'dodge' | 'freeze' | 'error' | 'flip' | 'tax' | 'double' | 'shinmyoumaru' | 'yuyuko' | 'bunshin' | 'tenshi' | 'suwako';

const FOOL_EVENTS: FoolType[] = [
  'baka', 'marisa', 'dodge', 'freeze', 'shinmyoumaru',
  'error', 'flip', 'tax', 'double', 'yuyuko',
  'bunshin', 'tenshi', 'suwako',
];

const FOOL_MESSAGES: Record<FoolType, { cirno: string; reimu: string }> = {
  baka: { cirno: '⑨+⑨=①⑧... 아 맞다 ⑨⑨!', reimu: '...바보' },
  marisa: { cirno: '잖기만 해봐 마리사!', reimu: '마리사가 빌려갔다...' },
  dodge: { cirno: '잠깐 기다려!', reimu: '...버튼이 도망갔다' },
  freeze: { cirno: '실수로 얼려버렸어...', reimu: '...얼음요정' },
  error: { cirno: '어?! 뭐가 고장났어!', reimu: '만우절이잖아' },
  flip: { cirno: '세상이 빙글빙글!', reimu: '...어지러워' },
  tax: { cirno: '에에?! 세금?!', reimu: '신사 유지비 10%입니다' },
  double: { cirno: '봤지? 두 배로 넣을 수 있어!', reimu: '...그냥 두 번 넣은 거잖아' },
  shinmyoumaru: { cirno: '버튼이... 어디 갔어?!', reimu: '...신뮨마루의 장난' },
  yuyuko: { cirno: '버튼이 성불했어?!', reimu: '...유유코의 장난' },
  bunshin: { cirno: '어느 게 진짜야?!', reimu: '분신술...' },
  tenshi: { cirno: '지진이다아아!', reimu: '...텔시의 장난' },
  suwako: { cirno: '개구리가 얼굴에?!', reimu: '...스와코의 장난' },
};

function pickFoolForMilestone(): FoolType {
  return FOOL_EVENTS[Math.floor(Math.random() * FOOL_EVENTS.length)];
}

// ===== Main Component =====
type GameState = 'ready' | 'playing' | 'finished';

export default function CirnoDonation() {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [bouncing, setBouncing] = useState(false);
  const [coins, setCoins] = useState<{ id: number; x: number }[]>([]);
  const [activeEffect, setActiveEffect] = useState<EffectId | null>(null);
  const [bestRecord, setBestRecord] = useState(0);
  const [retryCooldown, setRetryCooldown] = useState(0);
  // Fool states
  const [foolMessage, setFoolMessage] = useState<{ cirno: string; reimu: string } | null>(null);
  const [frozen, setFrozen] = useState(false);
  const [dodging, setDodging] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [fakeError, setFakeError] = useState(false);
  const [shrunk, setShrunk] = useState(false);
  const [yuyuko, setYuyuko] = useState(false);
  const [bunshin, setBunshin] = useState(false);
  const [quake, setQuake] = useState(false);
  const [frogs, setFrogs] = useState<{ id: number; x: number; y: number }[]>([]);
  const [foolCount, setFoolCount] = useState(0);
  const coinIdRef = useRef(0);
  const effectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;

  // Load best record
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cirno-donation-best');
      if (saved) setBestRecord(parseInt(saved, 10));
    } catch { /* ignore */ }
  }, []);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setGameState('finished');
          return 0;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState]);

  // Save best on finish + start retry cooldown + trigger series effect
  useEffect(() => {
    if (gameState !== 'finished') return;
    if (count > bestRecord) {
      setBestRecord(count);
      try { localStorage.setItem('cirno-donation-best', String(count)); } catch { /* ignore */ }
    }
    // Show a random series effect on finish
    const finishEffect = ALL_EFFECT_IDS[Math.floor(Math.random() * ALL_EFFECT_IDS.length)];
    setActiveEffect(finishEffect);
    if (effectTimerRef.current) clearTimeout(effectTimerRef.current);
    effectTimerRef.current = setTimeout(() => {
      setActiveEffect(null);
      effectTimerRef.current = null;
    }, 3000);

    setRetryCooldown(3);
    const cd = setInterval(() => {
      setRetryCooldown((prev) => {
        if (prev <= 1) { clearInterval(cd); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(cd);
  }, [gameState, count, bestRecord]);

  const showFoolMessage = useCallback((type: FoolType) => {
    setFoolMessage(FOOL_MESSAGES[type]);
    setTimeout(() => setFoolMessage(null), 1500);
  }, []);

  const startGame = useCallback(() => {
    setGameState('playing');
    setCount(0);
    setTimeLeft(TIME_LIMIT);
    setActiveEffect(null);
    setCoins([]);
    setFoolMessage(null);
    setFrozen(false);
    setDodging(false);
    setFlipped(false);
    setFakeError(false);
    setShrunk(false);
    setYuyuko(false);
    setBunshin(false);
    setQuake(false);
    setFrogs([]);
    setFoolCount(0);
  }, []);

  const triggerFool = useCallback((fool: FoolType) => {
    showFoolMessage(fool);
    switch (fool) {
      case 'baka':
        setBouncing(true);
        setTimeout(() => setBouncing(false), 100);
        return true; // blocks increment
      case 'marisa':
        setCount((prev) => Math.max(0, prev - 3));
        return false;
      case 'dodge':
        setDodging(true);
        setTimeout(() => setDodging(false), 800);
        return true;
      case 'freeze':
        setFrozen(true);
        setTimeout(() => setFrozen(false), 1200);
        return true;
      case 'error':
        setFakeError(true);
        setTimeout(() => setFakeError(false), 1500);
        return true;
      case 'flip':
        setFlipped(true);
        setTimeout(() => setFlipped(false), 2000);
        return false; // disorienting but click goes through
      case 'tax':
        setCount((prev) => Math.max(0, Math.floor(prev * 0.9)));
        setBouncing(true);
        setTimeout(() => setBouncing(false), 100);
        return true;
      case 'double':
        return false; // handled as increment=2
      case 'shinmyoumaru':
        setShrunk(true);
        setTimeout(() => setShrunk(false), 3000);
        return false;
      case 'yuyuko':
        setYuyuko(true);
        setTimeout(() => setYuyuko(false), 2000);
        return true;
      case 'bunshin':
        setBunshin(true);
        setTimeout(() => setBunshin(false), 2500);
        return false; // real button still works
      case 'tenshi':
        setQuake(true);
        setTimeout(() => setQuake(false), 2000);
        return false;
      case 'suwako':
        setFrogs(Array.from({ length: 5 }, (_, i) => ({
          id: i, x: Math.random() * 60 + 20, y: Math.random() * 40 + 30,
        })));
        return true; // blocked until frogs cleared
    }
  }, [showFoolMessage]);

  const handleDonate = useCallback(() => {
    if (gameState !== 'playing' || frozen) return;

    const newCount = count + 1;
    let increment = 1;

    // Every 9 clicks (900엔), trigger a fool event
    if (newCount % 9 === 0) {
      setFoolCount((prev) => prev + 1);
      const fool = pickFoolForMilestone();

      if (fool === 'double') {
        increment = 2;
        showFoolMessage('double');
      } else {
        const blocked = triggerFool(fool);
        if (blocked) return;
      }
    }

    const finalCount = Math.max(0, count + increment);
    setCount(finalCount);

    setBouncing(true);
    setTimeout(() => setBouncing(false), 100);

    const coinId = coinIdRef.current++;
    const coinX = 40 + Math.random() * 20;
    setCoins((prev) => [...prev.slice(-5), { id: coinId, x: coinX }]);
    setTimeout(() => { setCoins((prev) => prev.filter((c) => c.id !== coinId)); }, 600);
  }, [count, gameState, frozen, foolCount, showFoolMessage, triggerFool]);

  const amount = count * 100;
  const timerPercent = (timeLeft / TIME_LIMIT) * 100;
  const isUrgent = timeLeft <= 3;

  return (
    <div className={`${styles.container} ${flipped ? styles.flipped : ''} ${quake ? styles.quake : ''}`}>
      {/* Shrine */}
      <div className={styles.shrine}>
        <div className={styles.shrineRoof} />
        <div className={styles.shrineRoofEdge} />
        <div className={styles.shrineBody} />
        <div className={styles.shrinePillarLeft} />
        <div className={styles.shrinePillarRight} />
        <div className={styles.donationBox}>
          <div className={styles.donationBoxSlot} />
          <div className={styles.donationBoxGrid} />
        </div>
      </div>

      {/* Coin animation */}
      <div className={styles.coinContainer}>
        {coins.map((c) => (
          <div key={c.id} className={styles.coin} style={{ left: `${c.x}%`, top: '40%' }} />
        ))}
      </div>

      {/* Characters */}
      <div className={styles.characters}>
        <div className={styles.characterSlot}>
          <div className={`${styles.speechBubble} ${styles.speechCirno}`}>{foolMessage ? foolMessage.cirno : getCirnoLine(count)}</div>
          <img className={styles.characterImg} src={baseUrl('dot/cirno.png')} alt="치르노" />
          <span className={styles.characterName}>{'치르노'}</span>
        </div>
        <div className={styles.characterSlot}>
          <div className={`${styles.speechBubble} ${styles.speechReimu}`}>{foolMessage ? foolMessage.reimu : getReimuLine(count)}</div>
          <img className={styles.characterImg} src={baseUrl('dot/reimu_hakurei.png')} alt="레이무" />
          <span className={styles.characterName}>{'레이무'}</span>
        </div>
      </div>

      {gameState === 'ready' && (
        <>
          <div className={styles.amountDisplay}>
            <div className={styles.amountLabel}>{'시간 제한: '}{TIME_LIMIT}{'초'}</div>
            <div className={styles.amountValue}>{'①⓪⓪엔'}</div>
            <div className={styles.clickCount}>{'제한 시간 안에 최대한 많이 클릭하세요!'}</div>
          </div>
          <button className={styles.donateButton} onClick={startGame}>
            {'모금 시작!'}
          </button>
          {bestRecord > 0 && (
            <div className={styles.bestRecord}>{'최고 기록: '}{toCircledNumber(bestRecord * 100)}{'엔 ('}{bestRecord}{'회)'}</div>
          )}
        </>
      )}

      {gameState === 'playing' && (
        <>
          {/* Timer */}
          <div className={styles.timerBar}>
            <div className={`${styles.timerFill} ${isUrgent ? styles.timerFillUrgent : ''}`}
              style={{ width: `${timerPercent}%` }} />
          </div>
          <div className={`${styles.timerText} ${isUrgent ? styles.timerTextUrgent : ''}`}>
            {timeLeft.toFixed(1)}{'초'}
          </div>

          {/* Amount */}
          <div className={styles.amountDisplay}>
            <div className={styles.amountLabel}>{'현재 모금액'}</div>
            <div className={`${styles.amountValue} ${bouncing ? styles.amountBounce : ''}`}>
              {toCircledNumber(amount)}{'엔'}
            </div>
            <div className={styles.clickCount}>{'클릭 횟수: '}{count}{'회'}</div>
          </div>

          {/* Button area */}
          <div className={styles.buttonArea}>
            <button
              className={`${styles.donateButton} ${dodging ? styles.buttonDodge : ''} ${frozen ? styles.buttonFrozen : ''} ${shrunk ? styles.buttonShrunk : ''} ${yuyuko ? styles.buttonYuyuko : ''}`}
              onClick={handleDonate}
              disabled={frozen || frogs.length > 0}
            >
              {frozen ? '❄️ 얼음!' : '①⓪⓪엔 기부하기!'}
            </button>
            {/* Bunshin (fake buttons) */}
            {bunshin && [1, 2, 3].map((i) => (
              <button
                key={i}
                className={`${styles.donateButton} ${styles.fakeButton}`}
                style={{ transform: `translate(${(i - 2) * 120}px, ${(i % 2 === 0 ? -1 : 1) * 40}px)` }}
                onClick={() => { setCount((prev) => Math.max(0, prev - 1)); }}
              >
                {'①⓪⓪엔 기부하기!'}
              </button>
            ))}
            {/* Suwako frogs */}
            {frogs.map((f) => (
              <div
                key={f.id}
                className={styles.frog}
                style={{ left: `${f.x}%`, top: `${f.y}%` }}
                onClick={() => setFrogs((prev) => prev.filter((p) => p.id !== f.id))}
              >
                {'🐸'}
              </div>
            ))}
          </div>
        </>
      )}

      {gameState === 'finished' && (
        <div className={styles.resultScreen}>
          <div className={styles.resultTitle}>{'모금 완료!'}</div>
          <div className={styles.resultAmount}>{toCircledNumber(amount)}{'엔'}</div>
          <div className={styles.resultClicks}>{count}{'회 클릭 · '}{TIME_LIMIT}{'초'}</div>
          <button
            className={`${styles.retryButton} ${retryCooldown > 0 ? styles.donateButtonDisabled : ''}`}
            onClick={startGame}
            disabled={retryCooldown > 0}
          >
            {retryCooldown > 0 ? `${retryCooldown}...` : '다시 모금하기!'}
          </button>
          {bestRecord > 0 && (
            <div className={styles.bestRecord}>
              {'최고 기록: '}{toCircledNumber(bestRecord * 100)}{'엔 ('}{bestRecord}{'회)'}
            </div>
          )}
        </div>
      )}

      {/* Effect overlay (original toho-vote) */}
      {activeEffect && (
        <div className="fx-overlay">
          <EffectRenderer effectId={activeEffect} isMobile={isMobile} />
          <div className={styles.milestoneBanner}>
            <div className={styles.bannerInner}>
              <div className={styles.bannerText}>{toCircledNumber(amount)}{'엔 달성!'}</div>
              <div className={styles.bannerSpeaker}>{'치르노'}</div>
              <div className={styles.bannerSub}>{getCirnoLine(count)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Fake error overlay */}
      {fakeError && (
        <div className={styles.fakeErrorOverlay}>
          <div className={styles.fakeErrorBox}>
            <div className={styles.fakeErrorTitle}>{'ERROR'}</div>
            <div className={styles.fakeErrorMsg}>{'하쿠레이 신사 서버 다운'}</div>
            <div className={styles.fakeErrorApril}>{'만우절!'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
