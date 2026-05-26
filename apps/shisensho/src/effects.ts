// ─── Sound effects (Web Audio API) ──────────────────────────────────────────

let audioCtx: AudioContext | null = null;

export function ensureAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function playTone(freq: number, duration: number, vol = 0.3, type: OscillatorType = "sine") {
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // ignore audio errors
  }
}

export function sfxSelect() {
  playTone(600, 0.08, 0.1, "square");
}

export function sfxMatch() {
  playTone(523, 0.12, 0.12);
  setTimeout(() => playTone(659, 0.12, 0.12), 80);
  setTimeout(() => playTone(784, 0.15, 0.12), 160);
}

export function sfxClear() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.25, 0.15), i * 120);
  });
  setTimeout(() => {
    playTone(1047, 0.4, 0.18);
    playTone(784, 0.4, 0.1);
  }, notes.length * 120);
}

// ─── Confetti ───────────────────────────────────────────────────────────────

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotSpeed: number;
  life: number;
}

export function launchConfetti(container: HTMLElement) {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "1001";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  container.appendChild(canvas);

  const ctx2d = canvas.getContext("2d");
  if (!ctx2d) return;

  const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FF69B4", "#DDA0DD", "#98D8C8"];
  const particles: ConfettiParticle[] = [];

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 15 - 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      life: 1,
    });
  }

  let frame = 0;
  const maxFrames = 120;

  function animate() {
    if (frame >= maxFrames) {
      canvas.remove();
      return;
    }
    ctx2d!.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity
      p.rotation += p.rotSpeed;
      p.life = Math.max(0, 1 - frame / maxFrames);

      ctx2d!.save();
      ctx2d!.translate(p.x, p.y);
      ctx2d!.rotate(p.rotation);
      ctx2d!.globalAlpha = p.life;
      ctx2d!.fillStyle = p.color;
      ctx2d!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx2d!.restore();
    }

    frame++;
    requestAnimationFrame(animate);
  }
  animate();
}
