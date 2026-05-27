import React, { useState, useRef, useCallback, useEffect } from 'react';
import styles from './styles.module.css';
import type { PlacedCharacter, PlacedText } from './types';
import { games } from './data/games';

const CharacterTool: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [placedCharacters, setPlacedCharacters] = useState<PlacedCharacter[]>([]);
  const [placedTexts, setPlacedTexts] = useState<PlacedText[]>([]);
  const [textInput, setTextInput] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#000000');
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeTarget, setResizeTarget] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const measureCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const measureTextSize = useCallback((text: string, fontSize: number) => {
    if (!measureCanvasRef.current) {
      measureCanvasRef.current = document.createElement('canvas');
    }
    const ctx = measureCanvasRef.current.getContext('2d');
    if (!ctx) {
      return {
        width: Math.ceil(text.length * fontSize * 0.6) + 16,
        height: Math.ceil(fontSize * 1.2) + 8,
      };
    }
    const fontFamily = getComputedStyle(document.body).fontFamily || 'sans-serif';
    ctx.font = `${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    const width = Math.ceil(metrics.width) + 16;
    const height = Math.ceil(fontSize * 1.2) + 8;
    return { width, height };
  }, []);

  const getCanvasSize = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return { width: 0, height: 0 };
    const rect = el.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }, []);

  const clamp = useCallback((value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value));
  }, []);

  const MIN_SIZE = 50;
  const RESIZE_SENSITIVITY = 0.5;

  const currentGame = games.find((game) => game.id === selectedGame);

  const handleGameChange = (gameId: string) => {
    setSelectedGame(gameId);
    setSelectedCharacter('');
  };

  const handleCharacterChange = (characterId: string) => {
    setSelectedCharacter(characterId);
  };

  const addCharacterToCanvas = () => {
    if (!selectedCharacter || !currentGame) return;
    const character = currentGame.characters.find((c) => c.id === selectedCharacter);
    if (!character) return;
    const newPlacedCharacter: PlacedCharacter = {
      id: `${character.id}_${Date.now()}`,
      character,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      isSelected: false,
      isResizing: false,
      resizeHandle: null,
    };
    setPlacedCharacters((prev) => [...prev, newPlacedCharacter]);
  };

  const removeCharacter = (id: string) => {
    setPlacedCharacters((prev) => prev.filter((char) => char.id !== id));
  };

  const addText = useCallback(() => {
    if (!textInput.trim()) return;
    const fontSize = 64;
    const { width: textWidth, height: textHeight } = measureTextSize(textInput, fontSize);
    const newText: PlacedText = {
      id: `text_${Date.now()}`,
      text: textInput,
      x: 50,
      y: 50,
      width: textWidth,
      height: textHeight,
      fontSize,
      color: textColor,
      isSelected: false,
      isResizing: false,
      resizeHandle: null,
    };
    setPlacedTexts((prev) => [...prev, newText]);
    setTextInput('');
  }, [textInput, textColor, measureTextSize]);

  const removeText = (id: string) => {
    setPlacedTexts((prev) => prev.filter((text) => text.id !== id));
  };

  const handleTextClick = (textId: string) => {
    setPlacedTexts((prev) =>
      prev.map((text) => ({ ...text, isSelected: text.id === textId, resizeHandle: null }))
    );
    setPlacedCharacters((prev) =>
      prev.map((char) => ({ ...char, isSelected: false, resizeHandle: null }))
    );
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, characterId: string) => {
      const character = placedCharacters.find((c) => c.id === characterId);
      if (!character) return;
      setIsDragging(true);
      setDragTarget(characterId);
      setDragOffset({ x: e.clientX - character.x, y: e.clientY - character.y });
      setPlacedCharacters((prev) =>
        prev.map((c) => ({ ...c, isSelected: c.id === characterId, resizeHandle: null }))
      );
      setPlacedTexts((prev) =>
        prev.map((text) => ({ ...text, isSelected: false, resizeHandle: null }))
      );
    },
    [placedCharacters]
  );

  const handleTextMouseDown = useCallback(
    (e: React.MouseEvent, textId: string) => {
      const text = placedTexts.find((t) => t.id === textId);
      if (!text) return;
      setIsDragging(true);
      setDragTarget(textId);
      setDragOffset({ x: e.clientX - text.x, y: e.clientY - text.y });
      handleTextClick(textId);
    },
    [placedTexts]
  );

  const handleTextResizeStart = useCallback(
    (e: React.MouseEvent, textId: string, handle: string) => {
      e.stopPropagation();
      const text = placedTexts.find((t) => t.id === textId);
      if (!text) return;
      setIsResizing(true);
      setResizeTarget(textId);
      setResizeStart({ x: e.clientX, y: e.clientY, width: text.width, height: text.height });
      setPlacedTexts((prev) =>
        prev.map((t) => ({
          ...t,
          isSelected: t.id === textId,
          resizeHandle: t.id === textId ? handle : null,
        }))
      );
      setPlacedCharacters((prev) =>
        prev.map((char) => ({ ...char, isSelected: false, resizeHandle: null }))
      );
    },
    [placedTexts]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragTarget(null);
    setIsResizing(false);
    setResizeTarget(null);
    setIsPanning(false);
    setPlacedCharacters((prev) => prev.map((char) => ({ ...char, resizeHandle: null })));
    setPlacedTexts((prev) => prev.map((text) => ({ ...text, resizeHandle: null })));
  }, []);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, characterId: string, handle: string) => {
      e.stopPropagation();
      const character = placedCharacters.find((c) => c.id === characterId);
      if (!character) return;
      setIsResizing(true);
      setResizeTarget(characterId);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: character.width,
        height: character.height,
      });
      setPlacedCharacters((prev) =>
        prev.map((c) => ({
          ...c,
          isSelected: c.id === characterId,
          resizeHandle: c.id === characterId ? handle : null,
        }))
      );
    },
    [placedCharacters]
  );

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (
      e.target === e.currentTarget ||
      e.target === canvasRef.current ||
      (e.target as HTMLElement).classList.contains(styles.canvas) ||
      (e.target as HTMLElement).classList.contains(styles.canvasContent)
    ) {
      setPlacedCharacters((prev) =>
        prev.map((char) => ({ ...char, isSelected: false, resizeHandle: null }))
      );
      setPlacedTexts((prev) =>
        prev.map((text) => ({ ...text, isSelected: false, resizeHandle: null }))
      );
    }
  }, []);

  const bringToFront = useCallback((id: string) => {
    setPlacedCharacters((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.push(item);
      return next;
    });
    setPlacedTexts((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.push(item);
      return next;
    });
  }, []);

  const sendToBack = useCallback((id: string) => {
    setPlacedCharacters((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.unshift(item);
      return next;
    });
    setPlacedTexts((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.unshift(item);
      return next;
    });
  }, []);

  const bringForward = useCallback((id: string) => {
    setPlacedCharacters((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
    setPlacedTexts((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  const sendBackward = useCallback((id: string) => {
    setPlacedCharacters((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1 || idx === 0) return prev;
      const next = [...prev];
      [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
      return next;
    });
    setPlacedTexts((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx === -1 || idx === 0) return prev;
      const next = [...prev];
      [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
      return next;
    });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isResizing && resizeTarget) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        if (resizeTarget.startsWith('text_')) {
          setPlacedTexts((prev) =>
            prev.map((text) => {
              if (text.id !== resizeTarget) return text;
              let newFontSize = text.fontSize;
              let newX = text.x;
              let newY = text.y;

              if (text.resizeHandle?.includes('e')) newFontSize = Math.max(32, text.fontSize + deltaX * 0.5);
              if (text.resizeHandle?.includes('w')) {
                newFontSize = Math.max(32, text.fontSize - deltaX * 0.5);
                newX = text.x + (text.fontSize - newFontSize) * 0.3;
              }
              if (text.resizeHandle?.includes('s')) newFontSize = Math.max(32, text.fontSize + deltaY * 0.5);
              if (text.resizeHandle?.includes('n')) {
                newFontSize = Math.max(32, text.fontSize - deltaY * 0.5);
                newY = text.y + (text.fontSize - newFontSize) * 0.3;
              }

              const { width: newWidth, height: newHeight } = measureTextSize(text.text, newFontSize);
              const { width: cw, height: ch } = getCanvasSize();
              newX = clamp(newX, 0, Math.max(0, cw - newWidth));
              newY = clamp(newY, 0, Math.max(0, ch - newHeight));

              return { ...text, x: newX, y: newY, width: newWidth, height: newHeight, fontSize: newFontSize };
            })
          );
        } else {
          setPlacedCharacters((prev) =>
            prev.map((char) => {
              if (char.id !== resizeTarget) return char;
              const ratio = char.aspectRatio || resizeStart.width / Math.max(1, resizeStart.height);
              let newWidth = resizeStart.width;
              let newHeight = resizeStart.height;
              let newX = char.x;
              let newY = char.y;
              const { width: cw, height: ch } = getCanvasSize();
              const isCorner = ['nw', 'ne', 'sw', 'se'].includes(char.resizeHandle || '');

              if (isCorner) {
                const dx = (char.resizeHandle?.includes('w') ? -deltaX : deltaX) * RESIZE_SENSITIVITY;
                const dy = (char.resizeHandle?.includes('n') ? -deltaY : deltaY) * RESIZE_SENSITIVITY;
                const dominant = Math.abs(dx) > Math.abs(dy) ? dx : dy;
                const widthChange = char.resizeHandle?.includes('w') ? -dominant : dominant;
                newWidth = Math.max(MIN_SIZE, resizeStart.width + widthChange);
                newHeight = Math.max(MIN_SIZE, Math.round(newWidth / ratio));
                if (char.resizeHandle?.includes('w')) newX = char.x + (resizeStart.width - newWidth);
                if (char.resizeHandle?.includes('n')) newY = char.y + (resizeStart.height - newHeight);
              } else {
                if (char.resizeHandle?.includes('e')) newWidth = Math.max(MIN_SIZE, resizeStart.width + deltaX * RESIZE_SENSITIVITY);
                if (char.resizeHandle?.includes('w')) {
                  newWidth = Math.max(MIN_SIZE, resizeStart.width - deltaX * RESIZE_SENSITIVITY);
                  newX = char.x + (resizeStart.width - newWidth);
                }
                if (char.resizeHandle?.includes('s')) newHeight = Math.max(MIN_SIZE, resizeStart.height + deltaY * RESIZE_SENSITIVITY);
                if (char.resizeHandle?.includes('n')) {
                  newHeight = Math.max(MIN_SIZE, resizeStart.height - deltaY * RESIZE_SENSITIVITY);
                  newY = char.y + (resizeStart.height - newHeight);
                }
              }

              newX = clamp(newX, 0, Math.max(0, cw - newWidth));
              newY = clamp(newY, 0, Math.max(0, ch - newHeight));
              newWidth = clamp(newWidth, MIN_SIZE, cw - newX);
              newHeight = clamp(newHeight, MIN_SIZE, ch - newY);

              return { ...char, x: newX, y: newY, width: newWidth, height: newHeight };
            })
          );
        }
      } else if (isDragging && dragTarget) {
        if (dragTarget.startsWith('text_')) {
          setPlacedTexts((prev) =>
            prev.map((text) => {
              if (text.id !== dragTarget) return text;
              const { width: cw, height: ch } = getCanvasSize();
              const nextX = e.clientX - dragOffset.x;
              const nextY = e.clientY - dragOffset.y;
              return {
                ...text,
                x: clamp(nextX, 0, Math.max(0, cw - text.width)),
                y: clamp(nextY, 0, Math.max(0, ch - text.height)),
              };
            })
          );
        } else {
          setPlacedCharacters((prev) =>
            prev.map((char) => {
              if (char.id !== dragTarget) return char;
              const { width: cw, height: ch } = getCanvasSize();
              const nextX = e.clientX - dragOffset.x;
              const nextY = e.clientY - dragOffset.y;
              return {
                ...char,
                x: clamp(nextX, 0, Math.max(0, cw - char.width)),
                y: clamp(nextY, 0, Math.max(0, ch - char.height)),
              };
            })
          );
        }
      } else if (isPanning) {
        const deltaX = e.clientX - panStart.x;
        const deltaY = e.clientY - panStart.y;
        setPlacedCharacters((prev) => prev.map((char) => ({ ...char, x: char.x + deltaX, y: char.y + deltaY })));
        setPlacedTexts((prev) => prev.map((text) => ({ ...text, x: text.x + deltaX, y: text.y + deltaY })));
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    },
    [isDragging, dragTarget, dragOffset, isResizing, resizeTarget, resizeStart, isPanning, panStart, measureTextSize, getCanvasSize, clamp]
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.1, Math.min(3, prev * delta)));
  }, []);

  const downloadCanvasAsPNG = () => {
    const root = canvasRef.current;
    if (!root) return;

    import('html2canvas').then((html2canvas) => {
      const gridEl = root as HTMLElement;
      const prevBgImage = gridEl.style.backgroundImage;
      const prevBgSize = gridEl.style.backgroundSize;
      const prevBg = gridEl.style.background;
      gridEl.classList.add(styles.noGrid);
      gridEl.style.backgroundImage = 'none';
      gridEl.style.backgroundSize = 'auto';
      gridEl.style.background = 'none';

      const prevSelectedChars = placedCharacters.filter((c) => c.isSelected).map((c) => c.id);
      const prevSelectedTexts = placedTexts.filter((t) => t.isSelected).map((t) => t.id);
      setPlacedCharacters((prev) => prev.map((c) => ({ ...c, isSelected: false })));
      setPlacedTexts((prev) => prev.map((t) => ({ ...t, isSelected: false })));

      setTimeout(() => {
        html2canvas
          .default(root, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            ignoreElements: (el) => {
              const cls = (el as HTMLElement).classList;
              if (!cls) return false;
              return (
                cls.contains(styles.resizeHandle) ||
                cls.contains(styles.removeButton) ||
                cls.contains(styles.layerControls)
              );
            },
          })
          .then((canvas) => {
            gridEl.classList.remove(styles.noGrid);
            gridEl.style.backgroundImage = prevBgImage;
            gridEl.style.backgroundSize = prevBgSize;
            gridEl.style.background = prevBg;

            if (prevSelectedChars.length > 0)
              setPlacedCharacters((prev) =>
                prev.map((c) => ({ ...c, isSelected: prevSelectedChars.includes(c.id) }))
              );
            if (prevSelectedTexts.length > 0)
              setPlacedTexts((prev) =>
                prev.map((t) => ({ ...t, isSelected: prevSelectedTexts.includes(t.id) }))
              );

            canvas.toBlob((blob) => {
              if (!blob) return;
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'character-canvas.png';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }, 'image/png');
          })
          .catch((err) => {
            gridEl.classList.remove(styles.noGrid);
            gridEl.style.backgroundImage = prevBgImage;
            gridEl.style.backgroundSize = prevBgSize;
            gridEl.style.background = prevBg;
            setPlacedCharacters((prev) =>
              prev.map((c) => ({ ...c, isSelected: prevSelectedChars.includes(c.id) }))
            );
            setPlacedTexts((prev) =>
              prev.map((t) => ({ ...t, isSelected: prevSelectedTexts.includes(t.id) }))
            );
            console.error('PNG 캡처 실패', err);
            alert('이미지 생성에 실패했습니다.');
          });
      }, 150);
    }).catch((error) => {
      console.error('html2canvas 로드 실패:', error);
      alert('이미지 다운로드에 실패했습니다.');
    });
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedChar = placedCharacters.find((char) => char.isSelected);
        if (selectedChar) { removeCharacter(selectedChar.id); return; }
        const selectedText = placedTexts.find((text) => text.isSelected);
        if (selectedText) { removeText(selectedText.id); return; }
      }
    },
    [placedCharacters, placedTexts]
  );

  useEffect(() => {
    if (selectedCharacter) {
      addCharacterToCanvas();
      setSelectedCharacter('');
    }
  }, [selectedCharacter]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('keydown', handleKeyDown); };
  }, [handleKeyDown]);

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.selectGroup}>
          <label htmlFor="game-select">게임 선택:</label>
          <select
            id="game-select"
            value={selectedGame}
            onChange={(e) => handleGameChange(e.target.value)}
            className={styles.select}
          >
            <option value="">게임을 선택하세요</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>{game.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.selectGroup}>
          <label htmlFor="character-select">캐릭터 선택:</label>
          <select
            id="character-select"
            value={selectedCharacter}
            onChange={(e) => handleCharacterChange(e.target.value)}
            className={styles.select}
            disabled={!selectedGame}
          >
            <option value="">캐릭터를 선택하세요</option>
            {currentGame?.characters.map((character) => (
              <option key={character.id} value={character.id}>{character.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.textControls}>
          <div className={styles.textInputGroup}>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="텍스트를 입력하세요"
              className={styles.textInput}
              onKeyPress={(e) => e.key === 'Enter' && addText()}
            />
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className={styles.colorPicker}
              title="텍스트 색상 선택"
            />
            <button onClick={addText} className={styles.addTextButton}>
              텍스트 추가
            </button>
          </div>
        </div>

        <button onClick={downloadCanvasAsPNG} className={styles.downloadButton}>
          PNG 다운로드
        </button>
      </div>

      <div className={styles.canvasContainer}>
        <div
          ref={canvasRef}
          className={styles.canvas}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
        >
          <div
            className={styles.canvasContent}
            style={{ transform: `scale(${zoom})` }}
            onClick={handleCanvasClick}
          >
            {placedCharacters.map((character) => (
              <div
                key={character.id}
                className={`${styles.placedCharacter} ${character.isSelected ? styles.selected : ''}`}
                style={{ left: character.x, top: character.y, width: character.width, height: character.height }}
                onMouseDown={(e) => handleMouseDown(e, character.id)}
              >
                <img
                  src={character.character.image}
                  alt={character.character.name}
                  className={styles.characterImage}
                  onLoad={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    const naturalW = img.naturalWidth;
                    const naturalH = img.naturalHeight;
                    const ratio = naturalW && naturalH ? naturalW / naturalH : undefined;
                    const { width: cw, height: ch } = getCanvasSize();
                    let initW = naturalW || character.width;
                    let initH = naturalH || character.height;
                    if (cw > 0 && ch > 0 && naturalW && naturalH) {
                      const maxW = Math.max(50, cw - 20);
                      const maxH = Math.max(50, ch - 20);
                      const scale = Math.min(1, Math.min(maxW / naturalW, maxH / naturalH));
                      initW = Math.floor(naturalW * scale);
                      initH = Math.floor(naturalH * scale);
                    }
                    setPlacedCharacters((prev) =>
                      prev.map((c) => {
                        if (c.id !== character.id) return c;
                        if (c.initializedFromNatural) return c;
                        return {
                          ...c,
                          width: initW,
                          height: initH,
                          naturalWidth: naturalW,
                          naturalHeight: naturalH,
                          aspectRatio: ratio,
                          initializedFromNatural: true,
                        } as PlacedCharacter;
                      })
                    );
                    e.currentTarget.style.display = 'block';
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallbackText = document.createElement('div');
                      fallbackText.className = styles.fallbackText;
                      fallbackText.textContent = character.character.name;
                      parent.appendChild(fallbackText);
                    }
                  }}
                />

                {character.isSelected && (
                  <>
                    <button className={styles.removeButton} onClick={() => removeCharacter(character.id)} title="삭제">
                      ×
                    </button>
                    <div className={styles.layerControls}>
                      <button className={styles.layerButton} onClick={() => bringToFront(character.id)} title="맨 앞으로">⬆️</button>
                      <button className={styles.layerButton} onClick={() => bringForward(character.id)} title="앞으로">⬆</button>
                      <button className={styles.layerButton} onClick={() => sendBackward(character.id)} title="뒤로">⬇</button>
                      <button className={styles.layerButton} onClick={() => sendToBack(character.id)} title="맨 뒤로">⬇️</button>
                    </div>
                  </>
                )}

                {character.isSelected && (
                  <>
                    <div className={`${styles.resizeHandle} ${styles.resizeHandleNw}`} onMouseDown={(e) => handleResizeStart(e, character.id, 'nw')} />
                    <div className={`${styles.resizeHandle} ${styles.resizeHandleNe}`} onMouseDown={(e) => handleResizeStart(e, character.id, 'ne')} />
                    <div className={`${styles.resizeHandle} ${styles.resizeHandleSw}`} onMouseDown={(e) => handleResizeStart(e, character.id, 'sw')} />
                    <div className={`${styles.resizeHandle} ${styles.resizeHandleSe}`} onMouseDown={(e) => handleResizeStart(e, character.id, 'se')} />
                    <div className={`${styles.resizeHandle} ${styles.resizeHandleN}`} onMouseDown={(e) => handleResizeStart(e, character.id, 'n')} />
                    <div className={`${styles.resizeHandle} ${styles.resizeHandleS}`} onMouseDown={(e) => handleResizeStart(e, character.id, 's')} />
                    <div className={`${styles.resizeHandle} ${styles.resizeHandleE}`} onMouseDown={(e) => handleResizeStart(e, character.id, 'e')} />
                    <div className={`${styles.resizeHandle} ${styles.resizeHandleW}`} onMouseDown={(e) => handleResizeStart(e, character.id, 'w')} />
                  </>
                )}
              </div>
            ))}

            {placedTexts.map((text) => (
              <div
                key={text.id}
                className={`${styles.placedText} ${text.isSelected ? styles.selected : ''}`}
                style={{ left: text.x, top: text.y, width: text.width, height: text.height }}
                onMouseDown={(e) => handleTextMouseDown(e, text.id)}
              >
                <div className={styles.textContent} style={{ fontSize: text.fontSize, color: text.color }}>
                  {text.text}
                </div>

                {text.isSelected && (
                  <>
                    <button className={styles.removeButton} onClick={() => removeText(text.id)} title="삭제">×</button>
                    <div className={`${styles.resizeHandle} ${styles.resizeHandleNw}`} onMouseDown={(e) => handleTextResizeStart(e, text.id, 'nw')} />
                    <div className={`${styles.resizeHandle} ${styles.resizeHandleNe}`} onMouseDown={(e) => handleTextResizeStart(e, text.id, 'ne')} />
                    <div className={`${styles.resizeHandle} ${styles.resizeHandleSw}`} onMouseDown={(e) => handleTextResizeStart(e, text.id, 'sw')} />
                    <div className={`${styles.resizeHandle} ${styles.resizeHandleSe}`} onMouseDown={(e) => handleTextResizeStart(e, text.id, 'se')} />
                    <div className={`${styles.resizeHandle} ${styles.resizeHandleN}`} onMouseDown={(e) => handleTextResizeStart(e, text.id, 'n')} />
                    <div className={`${styles.resizeHandle} ${styles.resizeHandleS}`} onMouseDown={(e) => handleTextResizeStart(e, text.id, 's')} />
                    <div className={`${styles.resizeHandle} ${styles.resizeHandleE}`} onMouseDown={(e) => handleTextResizeStart(e, text.id, 'e')} />
                    <div className={`${styles.resizeHandle} ${styles.resizeHandleW}`} onMouseDown={(e) => handleTextResizeStart(e, text.id, 'w')} />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return <CharacterTool />;
}
