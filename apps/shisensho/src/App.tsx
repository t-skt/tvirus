import React, { useState, useEffect, useCallback, useRef } from "react";
import { baseUrl } from "@shared/utils/baseUrl";
import styles from "./styles.module.css";
import {
  CHARACTER_DOC_MAP,
  DIFF_CONFIG,
  type Difficulty,
  type GameState,
  type PathPoint,
  type Tile,
  countRemaining,
  findAllPairs,
  findPath,
  makeInitialState,
  removeTiles,
  shuffleRemaining,
  spriteColor,
  spriteDisplayName,
  TILE_SIZE_MAX,
  TILE_SIZE_MIN,
  TILE_GAP,
  SPRITE_RATIO,
} from "./game";
import {
  ensureAudioCtx,
  launchConfetti,
  sfxClear,
  sfxMatch,
  sfxSelect,
} from "./effects";

// ─── Component ───────────────────────────────────────────────────────────────

export default function Shisensho(): React.ReactElement {
  const dotBaseUrl = baseUrl("dot/");

  const [screen, setScreen] = useState<"menu" | "game">("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [gs, setGs] = useState<GameState | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [soundOn, setSoundOn] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Measure container width for responsive tile sizing
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Start/restart game
  const startGame = useCallback((diff: Difficulty) => {
    // Initialize AudioContext on user gesture (game start)
    ensureAudioCtx();
    if (timerRef.current) clearInterval(timerRef.current);
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    setDifficulty(diff);
    const state = makeInitialState(diff);
    setGs(state);
    setScreen("game");
  }, []);

  // Timer effect
  useEffect(() => {
    if (!gs || !gs.running || gs.won) return;
    timerRef.current = setInterval(() => {
      setGs((prev) => (prev ? { ...prev, elapsed: prev.elapsed + 1 } : prev));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gs?.running, gs?.won, gs?.gameId, screen]);

  // Clear hint after 2 seconds of inactivity
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTileClick = useCallback((r: number, c: number) => {
    setGs((prev) => {
      if (!prev || prev.won || prev.noMoves) return prev;
      const tile = prev.grid[r][c];
      if (!tile || tile.removed) return prev;

      // Clear hint
      const newState = { ...prev, hintPair: null, lastAction: null };

      if (!newState.selected) {
        return { ...newState, selected: { r, c }, lastAction: "select" as const };
      }

      const sel = newState.selected;

      if (sel.r === r && sel.c === c) {
        return { ...newState, selected: null, lastAction: "select" as const };
      }

      const selTile = newState.grid[sel.r][sel.c];
      if (!selTile || selTile.removed) {
        return { ...newState, selected: { r, c }, lastAction: "select" as const };
      }

      if (selTile.sprite !== tile.sprite) {
        return { ...newState, selected: { r, c }, lastAction: "select" as const };
      }

      const path = findPath(
        newState.grid,
        newState.rows,
        newState.cols,
        sel.r,
        sel.c,
        r,
        c,
      );
      if (!path) {
        return { ...newState, selected: { r, c }, lastAction: "select" as const };
      }

      // Valid match!
      const newGrid = removeTiles(newState.grid, sel, { r, c });
      const remaining = countRemaining(newGrid, newState.rows, newState.cols);
      const won = remaining === 0;
      const pairs = won
        ? []
        : findAllPairs(newGrid, newState.rows, newState.cols);
      const noMoves = !won && pairs.length === 0;
      const animPathCounter = newState.animPathCounter + 1;

      return {
        ...newState,
        grid: newGrid,
        selected: null,
        animPath: { points: path, id: animPathCounter },
        animPathCounter,
        won,
        noMoves,
        running: !won,
        lastAction: won ? "clear" as const : "match" as const,
      };
    });

    // Clear animPath after 600ms
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    animTimerRef.current = setTimeout(() => {
      setGs((prev) => (prev ? { ...prev, animPath: null } : prev));
    }, 600);
  }, []);

  // Sound effect: react to lastAction changes
  useEffect(() => {
    if (!gs || !gs.lastAction) return;
    if (soundOn) {
      if (gs.lastAction === "select") sfxSelect();
      else if (gs.lastAction === "match") sfxMatch();
      else if (gs.lastAction === "clear") sfxClear();
    }
    if (gs.lastAction === "clear") {
      launchConfetti(document.body);
    }
  }, [gs?.lastAction, gs?.animPathCounter, soundOn]);

  const handleHint = useCallback(() => {
    setGs((prev) => {
      if (!prev || prev.hintsLeft <= 0 || prev.won) return prev;
      const pairs = findAllPairs(prev.grid, prev.rows, prev.cols);
      if (pairs.length === 0) return prev;
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      hintTimerRef.current = setTimeout(() => {
        setGs((p) => (p ? { ...p, hintPair: null } : p));
      }, 3000);
      return {
        ...prev,
        hintPair: pair,
        hintsLeft: prev.hintsLeft - 1,
        selected: null,
      };
    });
  }, []);

  const handleShuffle = useCallback(() => {
    setGs((prev) => {
      if (!prev || prev.shufflesLeft <= 0 || prev.won) return prev;
      let newGrid = shuffleRemaining(prev.grid, prev.rows, prev.cols);
      let attempts = 0;
      while (
        findAllPairs(newGrid, prev.rows, prev.cols).length === 0 &&
        attempts < 20
      ) {
        newGrid = shuffleRemaining(prev.grid, prev.rows, prev.cols);
        attempts++;
      }
      return {
        ...prev,
        grid: newGrid,
        shufflesLeft: prev.shufflesLeft - 1,
        selected: null,
        hintPair: null,
        noMoves: false,
        animPath: null,
      };
    });
  }, []);

  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ─── Styles ───────────────────────────────────────────────────────────────

  const FG = "#222";
  const FG_MUTED = "#666";
  const FG_DIM = "#999";
  const SURFACE_100 = "#f0f0f0";
  const SURFACE_200 = "#e0e0e0";
  const SURFACE_300 = "#c0c0c0";
  const SURFACE_400 = "#a0a0a0";
  const OVERLAY_BG = "#1a1a2e";

  const inlineStyles = {
    wrapper: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      fontFamily: "'Noto Sans KR', sans-serif",
      padding: "16px 8px",
      minHeight: "60vh",
      userSelect: "none" as const,
    },
    title: {
      fontSize: "1.6rem",
      fontWeight: 700,
      marginBottom: "8px",
      letterSpacing: "0.05em",
      color: FG,
    },
    subtitle: {
      fontSize: "0.85rem",
      color: FG_MUTED,
      marginBottom: "24px",
      textAlign: "center" as const,
    },
    diffRow: {
      display: "flex",
      gap: "8px",
      marginBottom: "32px",
      flexWrap: "wrap" as const,
      justifyContent: "center",
    },
    diffBtn: (active: boolean, color: string) => ({
      padding: "8px 16px",
      borderRadius: "8px",
      border: `2px solid ${color}`,
      background: active ? color : "transparent",
      color: active ? "#fff" : color,
      fontSize: "0.9rem",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.15s",
    }),
    startBtn: {
      padding: "12px 40px",
      borderRadius: "10px",
      background: "#c0392b",
      color: "#fff",
      fontSize: "1.1rem",
      fontWeight: 700,
      border: "none",
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(192,57,43,0.4)",
    },
    // Game header
    gameHeader: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap" as const,
      justifyContent: "center",
      marginBottom: "12px",
      width: "100%",
    },
    stat: {
      fontSize: "0.9rem",
      color: FG,
      background: SURFACE_100,
      padding: "4px 12px",
      borderRadius: "6px",
    },
    btn: (disabled: boolean) => ({
      padding: "6px 16px",
      borderRadius: "6px",
      border: `1px solid ${SURFACE_300}`,
      background: disabled ? SURFACE_200 : SURFACE_100,
      color: disabled ? SURFACE_400 : FG,
      fontSize: "0.85rem",
      fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
    }),
    // Grid
    gridWrapper: {
      overflowX: "auto" as const,
      maxWidth: "100%",
      position: "relative" as const,
    },
    // Credit
    credit: {
      marginTop: "20px",
      fontSize: "0.78rem",
      color: FG_DIM,
    },
  };

  const DIFF_COLORS: Record<Difficulty, string> = {
    easy: "#27ae60",
    normal: "#2980b9",
    hard: "#c0392b",
    lunatic: "#8e44ad",
  };

  // ─── Menu screen ──────────────────────────────────────────────────────────

  if (screen === "menu") {
    return (
      <div ref={containerRef} style={inlineStyles.wrapper}>
        <div style={inlineStyles.title}>동방 사천성</div>
        <div style={inlineStyles.subtitle}>
          동방 캐릭터 도트로 즐기는 사천성 퍼즐
          <br />
          같은 캐릭터 2개를 선택해 연결하세요 (최대 2번 꺾기)
        </div>
        <div style={inlineStyles.diffRow}>
          {(["easy", "normal", "hard", "lunatic"] as Difficulty[]).map((d) => (
            <button
              key={d}
              style={inlineStyles.diffBtn(difficulty === d, DIFF_COLORS[d])}
              onClick={() => setDifficulty(d)}
            >
              {DIFF_CONFIG[d].label}
            </button>
          ))}
        </div>
        <div
          style={{
            marginBottom: "12px",
            fontSize: "0.85rem",
            color: FG_MUTED,
          }}
        >
          {DIFF_CONFIG[difficulty].cols}열 × {DIFF_CONFIG[difficulty].rows}행
          &nbsp;·&nbsp;
          {(DIFF_CONFIG[difficulty].cols * DIFF_CONFIG[difficulty].rows) / 2}쌍
        </div>
        <button style={inlineStyles.startBtn} onClick={() => startGame(difficulty)}>
          게임 시작
        </button>
        <div style={inlineStyles.credit}>도트 이미지: Majstek</div>
      </div>
    );
  }

  // ─── Game screen ──────────────────────────────────────────────────────────

  if (!gs) return <div />;

  const remaining = countRemaining(gs.grid, gs.rows, gs.cols);

  // Dynamic tile size based on container width
  const availableWidth = containerWidth > 0 ? containerWidth - 16 : 600; // 16px padding
  const maxTileFromWidth = Math.floor(
    (availableWidth - (gs.cols - 1) * TILE_GAP) / gs.cols,
  );
  const tileSize = Math.max(
    TILE_SIZE_MIN,
    Math.min(TILE_SIZE_MAX, maxTileFromWidth),
  );
  const spriteSize = Math.round(tileSize * SPRITE_RATIO);

  const gap = TILE_GAP;
  const gridPxW = gs.cols * tileSize + (gs.cols - 1) * gap;
  const gridPxH = gs.rows * tileSize + (gs.rows - 1) * gap;

  // Compute pixel center for a cell (for path drawing)
  const cellCenter = (r: number, c: number) => ({
    x: c * (tileSize + gap) + tileSize / 2,
    y: r * (tileSize + gap) + tileSize / 2,
  });

  // Clamp border cells for path visualization
  const clampedCenter = (r: number, c: number) => {
    const clampedR = Math.max(0, Math.min(r, gs.rows - 1));
    const clampedC = Math.max(0, Math.min(c, gs.cols - 1));
    let { x, y } = cellCenter(clampedR, clampedC);
    if (r < 0) y = -gap;
    if (r >= gs.rows) y = gridPxH + gap;
    if (c < 0) x = -gap;
    if (c >= gs.cols) x = gridPxW + gap;
    return { x, y };
  };

  const pathToSvgPoints = (points: PathPoint[]): string => {
    return points
      .map((p) => {
        const { x, y } = clampedCenter(p.r, p.c);
        return `${x},${y}`;
      })
      .join(" ");
  };

  // Hint set for quick lookup
  const hintSet = new Set<string>();
  if (gs.hintPair) {
    const [a, b] = gs.hintPair;
    hintSet.add(`${a.r},${a.c}`);
    hintSet.add(`${b.r},${b.c}`);
  }

  return (
    <div ref={containerRef} style={inlineStyles.wrapper}>
      <div style={inlineStyles.title}>동방 사천성</div>

      {/* Header — Row 1: stats */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          marginBottom: "8px",
        }}
      >
        <span style={inlineStyles.stat}>📋 {DIFF_CONFIG[difficulty].label}</span>
        <span style={inlineStyles.stat}>⏱ {formatTime(gs.elapsed)}</span>
        <span style={inlineStyles.stat}>🀄 {remaining}</span>
      </div>
      {/* Header — Row 2: buttons */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap" as const,
          justifyContent: "center",
          marginBottom: "12px",
        }}
      >
        <button
          style={inlineStyles.btn(gs.hintsLeft <= 0 || gs.won)}
          disabled={gs.hintsLeft <= 0 || gs.won}
          onClick={handleHint}
        >
          힌트 ({gs.hintsLeft})
        </button>
        <button
          style={inlineStyles.btn(gs.shufflesLeft <= 0 || gs.won)}
          disabled={gs.shufflesLeft <= 0 || gs.won}
          onClick={handleShuffle}
        >
          섞기 ({gs.shufflesLeft})
        </button>
        <button style={inlineStyles.btn(false)} onClick={() => startGame(difficulty)}>
          재시작
        </button>
        <button style={inlineStyles.btn(false)} onClick={() => setScreen("menu")}>
          메뉴
        </button>
        <button style={inlineStyles.btn(false)} onClick={() => setSoundOn((v) => !v)}>
          {soundOn ? "🔊" : "🔇"}
        </button>
      </div>

      {/* Grid */}
      <div style={inlineStyles.gridWrapper}>
        <div
          style={{
            position: "relative",
            width: gridPxW,
            height: gridPxH,
            flexShrink: 0,
          }}
        >
          {/* SVG path overlay */}
          {gs.animPath && (
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: gridPxW,
                height: gridPxH,
                pointerEvents: "none",
                zIndex: 10,
                overflow: "visible",
              }}
            >
              <polyline
                points={pathToSvgPoints(gs.animPath.points)}
                fill="none"
                stroke="#FFD700"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.9}
                className={styles.fadePath}
              />
            </svg>
          )}

          {/* Tiles */}
          {gs.grid.map((row, r) =>
            row.map((tile, c) => {
              if (!tile || tile.removed) return null;
              const isSelected = gs.selected?.r === r && gs.selected?.c === c;
              const isHint = hintSet.has(`${r},${c}`);
              const x = c * (tileSize + gap);
              const y = r * (tileSize + gap);

              return (
                <div
                  key={tile.id}
                  onClick={() => handleTileClick(r, c)}
                  className={isHint ? styles.blinkHint : undefined}
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    width: tileSize,
                    height: tileSize,
                    borderRadius: 6,
                    border: isSelected
                      ? "3px solid #FFD700"
                      : isHint
                        ? "3px solid #2ecc71"
                        : `2px solid ${spriteColor(tile.sprite).border}`,
                    background: isSelected
                      ? "rgba(255, 215, 0, 0.25)"
                      : isHint
                        ? "rgba(46, 204, 113, 0.2)"
                        : spriteColor(tile.sprite).bg,
                    boxShadow: isSelected
                      ? "0 0 10px 2px rgba(255,215,0,0.5)"
                      : isHint
                        ? "0 0 10px 2px rgba(46,204,113,0.4)"
                        : "0 2px 5px rgba(0,0,0,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "border 0.1s, box-shadow 0.1s",
                    zIndex: isSelected ? 2 : 1,
                    boxSizing: "border-box",
                  }}
                >
                  <img
                    src={`${dotBaseUrl}${tile.sprite}.png`}
                    alt={tile.sprite}
                    style={{
                      width: spriteSize,
                      height: spriteSize,
                      imageRendering: "pixelated",
                      display: "block",
                      pointerEvents: "none",
                    }}
                    draggable={false}
                  />
                </div>
              );
            }),
          )}
        </div>
      </div>

      {/* Character roster */}
      {(() => {
        const uniqueSprites = Array.from(
          new Set(
            gs.grid
              .flat()
              .filter((t): t is Tile => t !== null && !t.removed)
              .map((t) => t.sprite),
          ),
        ).sort();
        if (uniqueSprites.length === 0) return null;
        return (
          <div
            style={{
              marginTop: "12px",
              textAlign: "center",
              maxWidth: gridPxW,
              width: "100%",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                color: FG_DIM,
                marginBottom: "4px",
              }}
            >
              등장 캐릭터
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              {uniqueSprites.map((sprite) => {
                const docPath = CHARACTER_DOC_MAP[sprite];
                const label = sprite.replace(/_/g, " ");
                const img = (
                  <img
                    key={sprite}
                    src={`${dotBaseUrl}${sprite}.png`}
                    alt={label}
                    title={label}
                    style={{
                      width: 24,
                      height: 24,
                      imageRendering: "pixelated",
                      display: "block",
                    }}
                    draggable={false}
                  />
                );
                if (docPath) {
                  return (
                    <a
                      key={sprite}
                      href={docPath}
                      title={label}
                      style={{ lineHeight: 0 }}
                    >
                      {img}
                    </a>
                  );
                }
                return img;
              })}
            </div>
          </div>
        );
      })()}

      {/* Overlays */}
      {gs.won && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: OVERLAY_BG,
              borderRadius: 16,
              padding: "40px 56px",
              textAlign: "center",
              boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>🎉</div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: 8,
                color: "#FFD700",
              }}
            >
              클리어!
            </div>
            <div
              style={{
                fontSize: "1rem",
                marginBottom: 24,
                color: "#fff",
              }}
            >
              난이도: {DIFF_CONFIG[difficulty].label} · 클리어 시간: {formatTime(gs.elapsed)}
            </div>
            {/* Acquired characters */}
            <div
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#ccc",
                marginBottom: 8,
              }}
            >
              획득한 캐릭터 ({Array.from(new Set(gs.grid.flat().filter((t): t is Tile => t !== null).map((t) => t.sprite))).length})
            </div>
            <div
              style={{
                maxHeight: "180px",
                overflowY: "auto",
                marginBottom: 20,
                padding: "0 8px",
              }}
            >
              {Array.from(
                new Set(
                  gs.grid
                    .flat()
                    .filter((t): t is Tile => t !== null)
                    .map((t) => t.sprite),
                ),
              )
                .sort()
                .map((sprite) => {
                  const docPath = CHARACTER_DOC_MAP[sprite];
                  const name = spriteDisplayName(sprite);
                  return (
                    <div
                      key={sprite}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "3px 0",
                      }}
                    >
                      <img
                        src={`${dotBaseUrl}${sprite}.png`}
                        alt={sprite}
                        style={{
                          width: 24,
                          height: 24,
                          imageRendering: "pixelated",
                        }}
                      />
                      {docPath ? (
                        <a
                          href={docPath}
                          style={{
                            color: spriteColor(sprite).border,
                            textDecoration: "none",
                            fontSize: "0.8rem",
                          }}
                        >
                          {name}
                        </a>
                      ) : (
                        <span style={{ fontSize: "0.8rem", color: "#fff" }}>
                          {name}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                style={{ ...inlineStyles.startBtn, padding: "10px 28px" }}
                onClick={() => startGame(difficulty)}
              >
                다시 플레이
              </button>
              <button
                style={{
                  ...inlineStyles.startBtn,
                  padding: "10px 28px",
                  background: "#2980b9",
                }}
                onClick={() => setScreen("menu")}
              >
                메뉴로
              </button>
            </div>
          </div>
        </div>
      )}

      {gs.noMoves && !gs.won && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: OVERLAY_BG,
              borderRadius: 16,
              padding: "36px 48px",
              textAlign: "center",
              boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>😵</div>
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                marginBottom: 8,
                color: "#fff",
              }}
            >
              가능한 수가 없습니다
            </div>
            <div
              style={{
                fontSize: "0.9rem",
                marginBottom: 24,
                color: "#ccc",
              }}
            >
              섞기를 사용하거나 새 게임을 시작하세요
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              {gs.shufflesLeft > 0 && (
                <button
                  style={{
                    ...inlineStyles.startBtn,
                    padding: "10px 24px",
                    background: "#27ae60",
                  }}
                  onClick={() => {
                    handleShuffle();
                  }}
                >
                  섞기 ({gs.shufflesLeft})
                </button>
              )}
              <button
                style={{ ...inlineStyles.startBtn, padding: "10px 24px" }}
                onClick={() => startGame(difficulty)}
              >
                새 게임
              </button>
              <button
                style={{
                  ...inlineStyles.startBtn,
                  padding: "10px 24px",
                  background: "#2980b9",
                }}
                onClick={() => setScreen("menu")}
              >
                메뉴로
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={inlineStyles.credit}>도트 이미지: Majstek</div>
    </div>
  );
}
