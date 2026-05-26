import React, { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { baseUrl } from "@shared/utils/baseUrl";
import styles from "./styles.module.css";

import {
  MAX_SELECTED_BY_KIND,
  PNG_HEIGHT,
  PNG_SCALE,
  PNG_WIDTH,
  PORTRAIT_STORAGE_VERSION,
  SEASON_PRESETS,
  type CharacterImageCandidate,
  type FavoriteItem,
  type FavoriteKind,
  type PortraitState,
  type PortraitStorage,
  type SeasonId,
  type WorkEntity,
} from "./types";
import { useTouhouDataset } from "./data";
import {
  clamp,
  clamp01,
  computeCrop,
  loadPortraitStorage,
  useElementSize,
  useImageNaturalSize,
  waitForImages,
} from "./portrait";
import {
  csvOrderOf,
  displayJaLine,
  displayKoLine,
  displayWorkJaTitle,
  displayWorkKoTitle,
  displayWorkLabel,
  displayWorkPrimaryName,
  downloadBlob,
  escapeCsvField,
  formatDateYYYYMMDD,
  normalizeKey,
} from "./display";

const PORTRAIT_STORAGE_KEY = "touhou_favorites_portraits_v1";

function resolveStaticUrl(u: string): string {
  if (!u) return "";
  if (/^https?:\/\//.test(u)) return u;
  // Strip leading slash; baseUrl prepends the configured base.
  return baseUrl(u.startsWith("/") ? u.slice(1) : u);
}

export default function App(): React.JSX.Element {
  const { dataset, characterImagesIndex, ready: dataReady, error: dataError } = useTouhouDataset();

  const worksById = useMemo(() => {
    const m = new Map<string, WorkEntity>();
    for (const w of dataset.works) m.set(w.id, w);
    return m;
  }, [dataset.works]);

  const workCsvOrderById = useMemo(() => {
    const m = new Map<string, number>();
    const consider = (workId: string | null, sourceLine: number | null) => {
      if (!workId) return;
      const order = csvOrderOf(sourceLine);
      const prev = m.get(workId);
      if (prev == null || order < prev) m.set(workId, order);
    };

    for (const c of dataset.characters) consider(c.source_work_id, c.source?.line ?? null);
    for (const t of dataset.tracks) consider(t.source_work_id, t.source?.line ?? null);
    for (const w of dataset.works) consider(w.id, w.source?.line ?? null);

    return m;
  }, [dataset.characters, dataset.tracks, dataset.works]);

  const allItems = useMemo(() => {
    const items: FavoriteItem[] = [];

    const workNamesOf = (workId: string | null) => {
      if (!workId) return { ko: "", ja: "", en: "" };
      const w = worksById.get(workId);
      if (!w) return { ko: "", ja: "", en: "" };
      return { ko: w.name_ko || "", ja: w.name_ja || "", en: w.name_en || "" };
    };

    for (const c of dataset.characters) {
      const sourceFile = c.source?.file || "data/touhou_list_v2.csv";
      const sourceLine = c.source?.line ?? null;
      const workNames = workNamesOf(c.source_work_id);
      const rawSearch = [
        c.id,
        c.name_ko,
        c.name_ja,
        c.name_en,
        workNames.ko,
        workNames.ja,
        workNames.en,
        ...c.search,
      ];
      items.push({
        kind: "character",
        id: c.id,
        name_ko: c.name_ko,
        name_ja: c.name_ja,
        name_en: c.name_en,
        source_work_id: c.source_work_id,
        source_work_name_ko: workNames.ko,
        source_work_name_ja: workNames.ja,
        source_work_name_en: workNames.en,
        source_file: sourceFile,
        source_line: sourceLine,
        csv_order: csvOrderOf(sourceLine),
        search_key: normalizeKey(rawSearch.filter(Boolean).join(" ")),
      });
    }

    for (const t of dataset.tracks) {
      const sourceFile = t.source?.file || "data/touhou_list_v2.csv";
      const sourceLine = t.source?.line ?? null;
      const workNames = workNamesOf(t.source_work_id);
      const rawSearch = [
        t.id,
        t.name_ko,
        t.name_ja,
        t.name_en,
        workNames.ko,
        workNames.ja,
        workNames.en,
        ...t.search,
      ];
      items.push({
        kind: "track",
        id: t.id,
        name_ko: t.name_ko,
        name_ja: t.name_ja,
        name_en: t.name_en,
        source_work_id: t.source_work_id,
        source_work_name_ko: workNames.ko,
        source_work_name_ja: workNames.ja,
        source_work_name_en: workNames.en,
        source_file: sourceFile,
        source_line: sourceLine,
        csv_order: csvOrderOf(sourceLine),
        search_key: normalizeKey(rawSearch.filter(Boolean).join(" ")),
      });
    }

    for (const w of dataset.works) {
      if (w.type === "music" && w.name_ko === "기타/오리지널") continue;
      const sourceFile = w.source?.file || "data/touhou_list_v2.csv";
      const sourceLine = w.source?.line ?? null;
      const rawSearch = [w.id, w.name_ko, w.name_ja, w.name_en, w.work_section_ja, ...w.search];
      items.push({
        kind: "work",
        id: w.id,
        name_ko: w.name_ko,
        name_ja: w.name_ja,
        name_en: w.name_en,
        source_work_id: null,
        source_work_name_ko: "",
        source_work_name_ja: "",
        source_work_name_en: "",
        source_file: sourceFile,
        source_line: sourceLine,
        csv_order: workCsvOrderById.get(w.id) ?? csvOrderOf(sourceLine),
        search_key: normalizeKey(rawSearch.filter(Boolean).join(" ")),
      });
    }

    const kindRank = (k: FavoriteKind) => (k === "character" ? 10 : k === "track" ? 20 : 30);
    items.sort((a, b) => {
      const kr = kindRank(a.kind) - kindRank(b.kind);
      if (kr !== 0) return kr;
      if (a.csv_order !== b.csv_order) return a.csv_order - b.csv_order;
      return a.id.localeCompare(b.id);
    });

    return items;
  }, [dataset.characters, dataset.tracks, dataset.works, worksById, workCsvOrderById]);

  const itemByKindAndId = useMemo(() => {
    const byKind: Record<FavoriteKind, Map<string, FavoriteItem>> = {
      character: new Map(),
      track: new Map(),
      work: new Map(),
    };
    for (const it of allItems) byKind[it.kind].set(it.id, it);
    return byKind;
  }, [allItems]);

  const [seasonId, setSeasonId] = useState<SeasonId>(SEASON_PRESETS[0]?.id || "spring");
  const season = useMemo(() => {
    return SEASON_PRESETS.find((s) => s.id === seasonId) || SEASON_PRESETS[0];
  }, [seasonId]);

  const viewVars = useMemo(() => {
    return {
      "--tw-bg": season.colors.bg,
      "--tw-surface": season.colors.surface,
      "--tw-ink": season.colors.ink,
      "--tw-muted": season.colors.muted,
      "--tw-border": season.colors.border,
      "--tw-accent-a": season.colors.accentA,
      "--tw-accent-b": season.colors.accentB,
      "--tw-accent-a-soft": season.colors.accentASoft,
      "--tw-accent-b-soft": season.colors.accentBSoft,
      "--tw-season-overlay-top": season.overlayTop,
      "--tw-season-overlay-bottom": season.overlayBottom,
      "--tw-png-background": season.colors.pngBackground,
    } as React.CSSProperties;
  }, [season]);

  const [activeKind, setActiveKind] = useState<FavoriteKind>("character");
  const [query, setQuery] = useState<string>("");

  const [selected, setSelected] = useState<Record<FavoriteKind, string[]>>({
    character: [],
    track: [],
    work: [],
  });

  useEffect(() => {
    setSelected((prev) => {
      const next: Record<FavoriteKind, string[]> = {
        character: prev.character.filter((id) => itemByKindAndId.character.has(id)),
        track: prev.track.filter((id) => itemByKindAndId.track.has(id)),
        work: prev.work.filter((id) => itemByKindAndId.work.has(id)),
      };
      const same =
        next.character.length === prev.character.length &&
        next.track.length === prev.track.length &&
        next.work.length === prev.work.length;
      return same ? prev : next;
    });
  }, [itemByKindAndId]);

  const [limitMessage, setLimitMessage] = useState<string>("");

  const [portraitByCharacterId, setPortraitByCharacterId] = useState<
    Record<string, PortraitState>
  >(() => loadPortraitStorage().items);

  const [isPortraitEditorOpen, setIsPortraitEditorOpen] = useState<boolean>(false);
  const [portraitEditingCharacterId, setPortraitEditingCharacterId] = useState<string | null>(
    null
  );
  const [portraitDraftImageUrl, setPortraitDraftImageUrl] = useState<string>("");
  const [portraitDraftZoom, setPortraitDraftZoom] = useState<number>(1);
  const [portraitDraftPosX, setPortraitDraftPosX] = useState<number>(0.5);
  const [portraitDraftPosY, setPortraitDraftPosY] = useState<number>(0.2);
  const [portraitDraftComment, setPortraitDraftComment] = useState<string>("");
  const portraitDragRef = useRef<{
    startClientX: number;
    startClientY: number;
    startPosX: number;
    startPosY: number;
    maxShiftX: number;
    maxShiftY: number;
  } | null>(null);

  const portraitViewportRef = useRef<HTMLDivElement>(null);
  const portraitViewportSize = useElementSize(portraitViewportRef, isPortraitEditorOpen);

  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const previewCardRef = useRef<HTMLDivElement>(null);
  const [isPngPreparing, setIsPngPreparing] = useState<boolean>(false);
  const [pngBlobUrl, setPngBlobUrl] = useState<string>("");

  useEffect(() => {
    if (!isPreviewOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPortraitEditorOpen) setIsPreviewOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPreviewOpen, isPortraitEditorOpen]);

  useEffect(() => {
    if (!isPortraitEditorOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsPortraitEditorOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPortraitEditorOpen]);

  useEffect(() => {
    if (!limitMessage) return;
    const t = window.setTimeout(() => setLimitMessage(""), 2400);
    return () => window.clearTimeout(t);
  }, [limitMessage]);

  useEffect(() => {
    const next: Record<FavoriteKind, string[]> = {
      character: selected.character.slice(0, MAX_SELECTED_BY_KIND.character),
      track: selected.track.slice(0, MAX_SELECTED_BY_KIND.track),
      work: selected.work.slice(0, MAX_SELECTED_BY_KIND.work),
    };
    const same =
      next.character.length === selected.character.length &&
      next.track.length === selected.track.length &&
      next.work.length === selected.work.length;
    if (same) return;
    setSelected(next);
  }, [selected]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: PortraitStorage = {
      version: PORTRAIT_STORAGE_VERSION,
      items: portraitByCharacterId,
    };
    try {
      window.localStorage.setItem(PORTRAIT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [portraitByCharacterId]);

  const queryKey = normalizeKey(query);

  const activeResults = useMemo(() => {
    const base = allItems.filter((it) => it.kind === activeKind);
    const filtered = !queryKey ? base : base.filter((it) => it.search_key.includes(queryKey));
    return filtered;
  }, [activeKind, allItems, queryKey]);

  const toggleSelected = (kind: FavoriteKind, id: string) => {
    setSelected((prev) => {
      const current = prev[kind];
      const exists = current.includes(id);
      const limit = MAX_SELECTED_BY_KIND[kind];
      if (!exists && current.length >= limit) {
        const label = kind === "character" ? "캐릭터" : kind === "track" ? "OST" : "작품";
        setLimitMessage(`${label}는 최대 ${limit}개까지 선택할 수 있습니다.`);
        return prev;
      }
      return {
        ...prev,
        [kind]: exists ? current.filter((x) => x !== id) : [...current, id],
      };
    });
  };

  const moveSelected = (kind: FavoriteKind, index: number, delta: -1 | 1) => {
    setSelected((prev) => {
      const current = prev[kind];
      const nextIndex = index + delta;
      if (index < 0 || index >= current.length) return prev;
      if (nextIndex < 0 || nextIndex >= current.length) return prev;
      const next = [...current];
      const tmp = next[index];
      next[index] = next[nextIndex];
      next[nextIndex] = tmp;
      return { ...prev, [kind]: next };
    });
  };

  const clearKind = (kind: FavoriteKind) => {
    setSelected((prev) => ({ ...prev, [kind]: [] }));
  };

  const clearAll = () => {
    setSelected({ character: [], track: [], work: [] });
  };

  const selectedItemsByKind = useMemo(() => {
    const pick = (kind: FavoriteKind) =>
      selected[kind]
        .filter((id, idx, arr) => arr.indexOf(id) === idx)
        .map((id) => itemByKindAndId[kind].get(id) || null)
        .filter((x): x is FavoriteItem => x != null);

    return {
      character: pick("character"),
      track: pick("track"),
      work: pick("work"),
    };
  }, [itemByKindAndId, selected]);

  const rankOf = (kind: FavoriteKind, id: string): number => {
    const idx = selected[kind].indexOf(id);
    return idx >= 0 ? idx + 1 : 0;
  };

  const isRank1 = (kind: FavoriteKind, id: string): boolean => selected[kind][0] === id;

  const chipLabel = (it: FavoriteItem): string => {
    const primary = displayKoLine(it);
    const ja = displayJaLine(it, primary);
    if (it.kind === "track" || it.kind === "character") {
      const w = displayWorkLabel(
        it.source_work_name_ko,
        it.source_work_name_ja,
        it.source_work_name_en
      );
      const base = ja ? `${primary} / ${ja}` : primary;
      return w ? `${base} · ${w}` : base;
    }
    return ja ? `${primary} / ${ja}` : primary;
  };

  const topCharacter = selectedItemsByKind.character[0] || null;
  const topCharacterCandidates = topCharacter ? characterImagesIndex[topCharacter.id] || [] : [];
  const savedPortrait = topCharacter ? portraitByCharacterId[topCharacter.id] || null : null;

  const portraitEffective = useMemo(() => {
    if (!topCharacter) return null;
    const fallbackUrl = topCharacterCandidates[0]?.url || "";
    const imageUrl = savedPortrait?.imageUrl || fallbackUrl;
    if (!imageUrl) return null;
    return {
      characterId: topCharacter.id,
      imageUrl,
      zoom: savedPortrait?.zoom ?? 1,
      posX: savedPortrait?.posX ?? 0.5,
      posY: savedPortrait?.posY ?? 0.2,
      comment: savedPortrait?.comment ?? "",
    };
  }, [savedPortrait, topCharacter, topCharacterCandidates]);

  const portraitDraftResolvedUrl =
    isPortraitEditorOpen && portraitDraftImageUrl ? resolveStaticUrl(portraitDraftImageUrl) : "";
  const portraitEffectiveResolvedUrl = portraitEffective?.imageUrl
    ? resolveStaticUrl(portraitEffective.imageUrl)
    : "";

  const portraitDraftNatural = useImageNaturalSize(
    isPortraitEditorOpen ? portraitDraftResolvedUrl : null
  );
  const portraitDisplayNatural = useImageNaturalSize(
    portraitEffectiveResolvedUrl ? portraitEffectiveResolvedUrl : null
  );

  const previewPortraitViewportRef = useRef<HTMLDivElement>(null);
  const previewPortraitViewportSize = useElementSize(previewPortraitViewportRef, isPreviewOpen);

  useEffect(() => {
    return () => {
      if (pngBlobUrl) URL.revokeObjectURL(pngBlobUrl);
    };
  }, [pngBlobUrl]);

  useEffect(() => {
    if (!isPreviewOpen) {
      setIsPngPreparing(false);
      setPngBlobUrl("");
      return;
    }

    let cancelled = false;
    setIsPngPreparing(true);
    setPngBlobUrl("");

    (async () => {
      if (!previewCardRef.current) return;

      const fonts = (document as unknown as { fonts?: { ready?: Promise<unknown> } }).fonts;
      if (fonts?.ready) await fonts.ready;

      await new Promise((r) => window.setTimeout(r, 120));
      if (!previewCardRef.current) return;
      await waitForImages(previewCardRef.current);

      const canvas = await html2canvas(previewCardRef.current, {
        scale: PNG_SCALE,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: season.colors.pngBackground,
        width: PNG_WIDTH,
        height: PNG_HEIGHT,
        scrollX: 0,
        scrollY: 0,
        windowWidth: PNG_WIDTH,
        windowHeight: PNG_HEIGHT,
        onclone: (clonedDoc) => {
          const cloneCard = clonedDoc.querySelector('[data-card-root="true"]');
          if (cloneCard instanceof HTMLElement) {
            cloneCard.setAttribute("data-exporting", "1");
          }
        },
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );
      if (!blob || cancelled) return;

      const url = URL.createObjectURL(blob);
      setPngBlobUrl(url);
    })()
      .catch((e) => {
        console.error("PNG render failed", e);
      })
      .finally(() => {
        if (!cancelled) setIsPngPreparing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    isPreviewOpen,
    portraitEffective?.comment,
    portraitEffective?.imageUrl,
    portraitEffective?.posX,
    portraitEffective?.posY,
    portraitEffective?.zoom,
    season.colors.pngBackground,
    seasonId,
    selected,
  ]);

  const openPortraitEditor = () => {
    if (!topCharacter) return;
    const fallbackUrl = topCharacterCandidates[0]?.url || "";
    const imageUrl = savedPortrait?.imageUrl || fallbackUrl;
    if (!imageUrl) {
      setLimitMessage("이 캐릭터는 연결된 이미지가 없습니다.");
      return;
    }

    setPortraitEditingCharacterId(topCharacter.id);
    setPortraitDraftImageUrl(imageUrl);
    setPortraitDraftZoom(savedPortrait?.zoom ?? 1);
    setPortraitDraftPosX(savedPortrait?.posX ?? 0.5);
    setPortraitDraftPosY(savedPortrait?.posY ?? 0.2);
    setPortraitDraftComment(savedPortrait?.comment ?? "");
    setIsPortraitEditorOpen(true);
  };

  const savePortraitDraft = () => {
    const id = portraitEditingCharacterId;
    if (!id) return;
    const next: PortraitState = {
      imageUrl: portraitDraftImageUrl,
      zoom: clamp(portraitDraftZoom, 1, 3),
      posX: clamp01(portraitDraftPosX),
      posY: clamp01(portraitDraftPosY),
      comment: portraitDraftComment,
      updatedAt: new Date().toISOString(),
    };
    setPortraitByCharacterId((prev) => ({ ...prev, [id]: next }));
    setIsPortraitEditorOpen(false);
  };

  const downloadJson = () => {
    const generatedAt = new Date().toISOString();
    const out: Record<string, unknown> = {
      meta: {
        title: "동방프로젝트 최애표",
        generated_at: generatedAt,
        dataset_source: dataset.meta?.source || "data/touhou_list_v2.csv",
        dataset_generated_at: dataset.meta?.generated_at || null,
      },
      settings: {
        seasonId,
      },
      portrait: portraitEffective
        ? {
            character_id: portraitEffective.characterId,
            image_url: portraitEffective.imageUrl,
            crop: {
              zoom: portraitEffective.zoom,
              pos_x: portraitEffective.posX,
              pos_y: portraitEffective.posY,
            },
            comment: portraitEffective.comment,
          }
        : null,
      selections: {
        characters: selectedItemsByKind.character.map((it) => ({
          kind: it.kind,
          rank: rankOf("character", it.id),
          id: it.id,
          name_ko: it.name_ko,
          name_ja: it.name_ja,
          name_en: it.name_en,
          source_work_id: it.source_work_id,
          source: { file: it.source_file, line: it.source_line },
        })),
        tracks: selectedItemsByKind.track.map((it) => ({
          kind: it.kind,
          rank: rankOf("track", it.id),
          id: it.id,
          name_ko: it.name_ko,
          name_ja: it.name_ja,
          name_en: it.name_en,
          source_work_id: it.source_work_id,
          source_work_name_ko: it.source_work_name_ko,
          source_work_name_ja: it.source_work_name_ja,
          source_work_name_en: it.source_work_name_en,
          source: { file: it.source_file, line: it.source_line },
        })),
        works: selectedItemsByKind.work.map((it) => ({
          kind: it.kind,
          rank: rankOf("work", it.id),
          id: it.id,
          name_ko: it.name_ko,
          name_ja: it.name_ja,
          name_en: it.name_en,
          source_work_id: it.source_work_id,
          source: { file: it.source_file, line: it.source_line },
        })),
      },
    };

    const blob = new Blob([JSON.stringify(out, null, 2) + "\n"], {
      type: "application/json;charset=utf-8",
    });
    downloadBlob(`touhou_favorites_${formatDateYYYYMMDD(new Date())}.json`, blob);
  };

  const downloadCsv = () => {
    const header = [
      "kind",
      "rank",
      "id",
      "name_ko",
      "name_ja",
      "name_en",
      "source_work_id",
      "source_work_name_ko",
      "source_work_name_ja",
      "source_work_name_en",
      "source_file",
      "source_line",
    ];

    const rows: string[][] = [];
    const pushKind = (kind: FavoriteKind) => {
      for (const it of selectedItemsByKind[kind]) {
        const rank = String(rankOf(kind, it.id) || "");
        rows.push([
          it.kind,
          rank,
          it.id,
          it.name_ko,
          it.name_ja,
          it.name_en,
          it.source_work_id || "",
          it.source_work_name_ko,
          it.source_work_name_ja,
          it.source_work_name_en,
          it.source_file,
          it.source_line == null ? "" : String(it.source_line),
        ]);
      }
    };

    pushKind("character");
    pushKind("track");
    pushKind("work");

    const csv =
      "﻿" +
      [header, ...rows].map((r) => r.map((v) => escapeCsvField(v)).join(",")).join("\n") +
      "\n";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    downloadBlob(`touhou_favorites_${formatDateYYYYMMDD(new Date())}.csv`, blob);
  };

  const downloadPngFromPreview = () => {
    if (!pngBlobUrl) {
      setLimitMessage(isPngPreparing ? "PNG 준비중입니다..." : "PNG를 준비하지 못했습니다.");
      return;
    }

    const link = document.createElement("a");
    link.href = pngBlobUrl;
    link.download = `touhou_favorites_${formatDateYYYYMMDD(new Date())}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const counts = {
    character: selected.character.length,
    track: selected.track.length,
    work: selected.work.length,
  };

  const portraitEditingCandidates = portraitEditingCharacterId
    ? characterImagesIndex[portraitEditingCharacterId] || []
    : [];
  const portraitEditingCharacter = portraitEditingCharacterId
    ? itemByKindAndId.character.get(portraitEditingCharacterId) || null
    : null;

  if (!dataReady) {
    return (
      <div className={styles.container} style={viewVars} data-season={seasonId}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>동방프로젝트 최애표</h2>
            <div className={styles.subtitle}>데이터 로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className={styles.container} style={viewVars} data-season={seasonId}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>동방프로젝트 최애표</h2>
            <div className={styles.subtitle}>데이터 로딩 실패: {dataError}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} style={viewVars} data-season={seasonId}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>동방프로젝트 최애표</h2>
          <div className={styles.subtitle}>
            캐릭터 / OST / 작품 최애를 골라서 PNG + 데이터로 저장
          </div>
        </div>
      </div>

      <section className={styles.controlsSection}>
        <div className={styles.controlCard}>
          <div className={styles.controlHeading}>시즌</div>
          <div className={styles.controlDescription}>
            시즌 프리셋이 곧 최종 테마입니다. 한 가지만 선택하세요.
          </div>
          <div className={styles.seasonChips}>
            {SEASON_PRESETS.map((preset) => (
              <button
                type="button"
                key={preset.id}
                className={`${styles.seasonChip} ${
                  preset.id === seasonId ? styles.seasonChipActive : ""
                }`}
                onClick={() => setSeasonId(preset.id)}
              >
                <span
                  className={styles.seasonSwatch}
                  style={{
                    background: `linear-gradient(90deg, ${preset.overlayTop}, ${preset.overlayBottom})`,
                  }}
                />
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.layout}>
        <div className={styles.panel}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${activeKind === "character" ? styles.tabActive : ""}`}
              onClick={() => setActiveKind("character")}
            >
              캐릭터 <span className={styles.tabCount}>{counts.character}</span>
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeKind === "track" ? styles.tabActive : ""}`}
              onClick={() => setActiveKind("track")}
            >
              OST <span className={styles.tabCount}>{counts.track}</span>
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeKind === "work" ? styles.tabActive : ""}`}
              onClick={() => setActiveKind("work")}
            >
              작품 <span className={styles.tabCount}>{counts.work}</span>
            </button>
          </div>

          <div className={styles.searchRow}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.searchInput}
              placeholder="검색 (한국어/일본어/영어)"
              type="text"
            />
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setQuery("")}
              disabled={!query}
            >
              검색 초기화
            </button>
          </div>

          <div className={styles.resultsHeader}>
            <div className={styles.resultsMeta}>
              결과 {activeResults.length}
              {queryKey ? " (상위 250개)" : ""}
            </div>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => clearKind(activeKind)}
              disabled={selected[activeKind].length === 0}
            >
              이 탭 전체 해제
            </button>
          </div>

          {limitMessage ? <div className={styles.inlineNotice}>{limitMessage}</div> : null}

          <div className={styles.resultsList}>
            {activeResults.map((it) => {
              const checked = selected[it.kind].includes(it.id);
              const atLimit =
                !checked && selected[it.kind].length >= MAX_SELECTED_BY_KIND[it.kind];
              const primary = it.kind === "work" ? displayWorkKoTitle(it) : displayKoLine(it);
              const jaLine =
                it.kind === "work" ? displayWorkJaTitle(it) : displayJaLine(it, primary);
              const workLabel = displayWorkLabel(
                it.source_work_name_ko,
                it.source_work_name_ja,
                it.source_work_name_en
              );

              const secondary = jaLine;
              const tertiary = it.kind === "track" || it.kind === "character" ? workLabel : "";

              const rank = rankOf(it.kind, it.id);
              const crown = rank === 1;
              return (
                <label
                  key={`${it.kind}:${it.id}`}
                  className={`${styles.resultRow} ${crown ? styles.resultRowStar : ""} ${
                    atLimit ? styles.resultRowDisabled : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={atLimit}
                    onChange={() => toggleSelected(it.kind, it.id)}
                    className={styles.checkbox}
                  />
                  <span className={styles.resultText}>
                    <span className={styles.resultPrimary}>
                      <span className={styles.resultPrimaryText}>{primary}</span>
                      {rank ? (
                        <span
                          className={`${styles.rankBadge} ${styles.rankBadgeList} ${
                            crown ? styles.rankBadgeStar : ""
                          }`}
                        >
                          {crown ? "👑 #1" : `#${rank}`}
                        </span>
                      ) : null}
                    </span>
                    {secondary ? (
                      <span className={styles.resultSecondary}>{secondary}</span>
                    ) : null}
                    {tertiary ? (
                      <span className={styles.resultTertiary}>{tertiary}</span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.selectedHeader}>
            <h3 className={styles.selectedTitle}>선택됨</h3>
            <button
              type="button"
              className={styles.dangerButton}
              onClick={clearAll}
              disabled={
                selected.character.length + selected.track.length + selected.work.length === 0
              }
            >
              전체 초기화
            </button>
          </div>

          <div className={styles.portraitPanel}>
            <div className={styles.portraitPanelHeader}>
              <div className={styles.portraitPanelTitle}>Portrait (캐릭터 #1)</div>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={openPortraitEditor}
                disabled={!topCharacter}
              >
                편집
              </button>
            </div>
            {topCharacter ? (
              <div className={styles.portraitPanelBody}>
                <div className={styles.portraitPanelPreview}>
                  {portraitEffective ? (
                    <div className={styles.portraitThumb}>
                      <div className={styles.portraitViewportSmall}>
                        <img
                          src={portraitEffectiveResolvedUrl}
                          alt={displayKoLine(topCharacter)}
                          className={styles.portraitImg}
                          draggable={false}
                          style={(() => {
                            const vw = 84;
                            const vh = 84;
                            if (!portraitDisplayNatural.ready) return {};
                            const crop = computeCrop(
                              portraitDisplayNatural.width,
                              portraitDisplayNatural.height,
                              vw,
                              vh,
                              portraitEffective.zoom,
                              portraitEffective.posX,
                              portraitEffective.posY
                            );
                            return {
                              width: `${crop.width}px`,
                              height: `${crop.height}px`,
                              transform: `translate(${crop.translateX}px, ${crop.translateY}px)` as const,
                            };
                          })()}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={styles.portraitThumbEmpty}>no image</div>
                  )}
                </div>
                <div className={styles.portraitPanelMeta}>
                  <div className={styles.portraitCharacterName}>{displayKoLine(topCharacter)}</div>
                  <div className={styles.portraitCommentPreview}>
                    {portraitEffective?.comment ? portraitEffective.comment : "(comment empty)"}
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.portraitPanelEmpty}>캐릭터를 먼저 1명 이상 선택하세요.</div>
            )}
          </div>

          <div className={styles.selectedSections}>
            {(
              [
                { kind: "character" as const, label: "캐릭터" },
                { kind: "track" as const, label: "OST" },
                { kind: "work" as const, label: "작품" },
              ] as const
            ).map(({ kind, label }) => (
              <div key={kind} className={styles.selectedSection}>
                <div className={styles.selectedSectionHeader}>
                  <div className={styles.selectedSectionLabel}>
                    {label}{" "}
                    <span className={styles.selectedCount}>{selected[kind].length}</span>
                    <span className={styles.selectedCountMax}>/ {MAX_SELECTED_BY_KIND[kind]}</span>
                  </div>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => clearKind(kind)}
                    disabled={selected[kind].length === 0}
                  >
                    비우기
                  </button>
                </div>
                <div className={styles.selectedList}>
                  {selectedItemsByKind[kind].length === 0 ? (
                    <div className={styles.selectedEmpty}>아직 없음</div>
                  ) : (
                    selectedItemsByKind[kind].map((it) => (
                      <div
                        key={it.id}
                        className={`${styles.selectedChip} ${
                          isRank1(kind, it.id) ? styles.selectedChipStar : ""
                        }`}
                      >
                        {(() => {
                          const rank = rankOf(kind, it.id);
                          const isTop = rank === 1;
                          const isBottom = rank === selected[kind].length;
                          return (
                            <>
                              <span
                                className={`${styles.rankBadge} ${styles.rankBadgeChip} ${
                                  isTop ? styles.rankBadgeStar : ""
                                }`}
                              >
                                {isTop ? "👑 #1" : `#${rank}`}
                              </span>
                              {kind === "track" ? (
                                <div className={styles.selectedChipTextBlock}>
                                  <div className={styles.selectedChipLinePrimary}>
                                    {displayKoLine(it)}
                                  </div>
                                  {displayJaLine(it, displayKoLine(it)) ? (
                                    <div className={styles.selectedChipLineSecondary}>
                                      {displayJaLine(it, displayKoLine(it))}
                                    </div>
                                  ) : null}
                                  {displayWorkPrimaryName(
                                    it.source_work_name_ko,
                                    it.source_work_name_ja,
                                    it.source_work_name_en
                                  ) ? (
                                    <div className={styles.selectedChipLineMeta}>
                                      {displayWorkPrimaryName(
                                        it.source_work_name_ko,
                                        it.source_work_name_ja,
                                        it.source_work_name_en
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                              ) : kind === "work" ? (
                                <div className={styles.selectedChipTextBlock}>
                                  <div className={styles.selectedChipLinePrimary}>
                                    {displayWorkKoTitle(it)}
                                  </div>
                                  {displayWorkJaTitle(it) ? (
                                    <div className={styles.selectedChipLineSecondary}>
                                      {displayWorkJaTitle(it)}
                                    </div>
                                  ) : null}
                                </div>
                              ) : (
                                <span className={styles.selectedChipTextSingle}>
                                  {chipLabel(it)}
                                </span>
                              )}
                              <div
                                className={styles.orderButtons}
                                role="group"
                                aria-label="순서 변경"
                              >
                                <button
                                  type="button"
                                  className={styles.orderButton}
                                  onClick={() => moveSelected(kind, rank - 1, -1)}
                                  disabled={isTop}
                                  aria-label={`move-${kind}-${rank}-up`}
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  className={styles.orderButton}
                                  onClick={() => moveSelected(kind, rank - 1, 1)}
                                  disabled={isBottom}
                                  aria-label={`move-${kind}-${rank}-down`}
                                >
                                  ↓
                                </button>
                              </div>
                              <button
                                type="button"
                                className={styles.chipRemove}
                                onClick={() => toggleSelected(kind, it.id)}
                                title="삭제"
                              >
                                ×
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.exportBar}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => setIsPreviewOpen(true)}
            >
              Preview
            </button>
            <button type="button" className={styles.secondaryButton} onClick={downloadJson}>
              JSON
            </button>
            <button type="button" className={styles.secondaryButton} onClick={downloadCsv}>
              CSV
            </button>
          </div>
        </div>
      </div>

      {isPreviewOpen ? (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setIsPreviewOpen(false);
          }}
        >
          <div className={styles.modalDialog} role="dialog" aria-modal="true">
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>Preview</div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setIsPreviewOpen(false)}
                aria-label="close-preview"
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.previewStage}>
                <div ref={previewCardRef} className={styles.card} data-card-root="true">
                  <div className={styles.cardTop}>
                    <div>
                      <div className={styles.cardTitle}>동방프로젝트 최애표</div>
                      <div className={styles.cardDate}>{formatDateYYYYMMDD(new Date())}</div>
                    </div>
                    <div className={styles.cardBadge}>Touhou / Favorites</div>
                  </div>

                  <div className={styles.cardGrid2x2}>
                    <div className={styles.cardCol}>
                      <div className={styles.cardColHeader}>
                        <div className={styles.cardColTitle}>1. Portrait</div>
                        <div className={styles.cardColCount}>
                          {selectedItemsByKind.character.length ? 1 : 0}
                        </div>
                      </div>
                      {topCharacter ? (
                        <div className={styles.cardPortraitRow}>
                          <div
                            ref={previewPortraitViewportRef}
                            className={styles.cardPortraitViewport}
                          >
                            {portraitEffective ? (
                              <img
                                src={portraitEffectiveResolvedUrl}
                                alt={displayKoLine(topCharacter)}
                                className={styles.portraitImg}
                                draggable={false}
                                style={(() => {
                                  const vw = previewPortraitViewportSize.width || 240;
                                  const vh = previewPortraitViewportSize.height || 240;
                                  if (!portraitDisplayNatural.ready) return {};
                                  const crop = computeCrop(
                                    portraitDisplayNatural.width,
                                    portraitDisplayNatural.height,
                                    vw,
                                    vh,
                                    portraitEffective.zoom,
                                    portraitEffective.posX,
                                    portraitEffective.posY
                                  );
                                  return {
                                    width: `${crop.width}px`,
                                    height: `${crop.height}px`,
                                    transform: `translate(${crop.translateX}px, ${crop.translateY}px)` as const,
                                  };
                                })()}
                              />
                            ) : (
                              <div className={styles.cardPortraitEmpty}>no image</div>
                            )}
                          </div>
                          <div className={styles.cardPortraitMeta}>
                            <div className={styles.cardPortraitName}>
                              {displayKoLine(topCharacter)}
                            </div>
                            <div className={styles.cardPortraitComment}>
                              {portraitEffective?.comment || "(comment empty)"}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.cardEmpty}>—</div>
                      )}
                    </div>

                    <div className={styles.cardCol}>
                      <div className={styles.cardColHeader}>
                        <div className={styles.cardColTitle}>2. 캐릭터</div>
                        <div className={styles.cardColCount}>
                          {selectedItemsByKind.character.length}
                        </div>
                      </div>
                      <div className={styles.cardList}>
                        {selectedItemsByKind.character.length <= 1 ? (
                          <div className={styles.cardEmpty}>—</div>
                        ) : (
                          selectedItemsByKind.character.slice(1).map((it) => {
                            const primaryKo = displayKoLine(it);
                            const ja = displayJaLine(it, primaryKo);
                            const meta = displayWorkLabel(
                              it.source_work_name_ko,
                              it.source_work_name_ja,
                              it.source_work_name_en
                            );
                            const rank = rankOf("character", it.id);
                            return (
                              <div key={it.id} className={styles.cardItem}>
                                <div className={styles.cardItemPrimary}>
                                  <span className={styles.cardRankPill}>{`#${rank}`}</span>
                                  {primaryKo}
                                </div>
                                {ja ? <div className={styles.cardItemSecondary}>{ja}</div> : null}
                                {meta ? <div className={styles.cardItemMeta}>{meta}</div> : null}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div className={styles.cardCol}>
                      <div className={styles.cardColHeader}>
                        <div className={styles.cardColTitle}>3. OST</div>
                        <div className={styles.cardColCount}>{selectedItemsByKind.track.length}</div>
                      </div>
                      <div className={styles.cardList}>
                        {selectedItemsByKind.track.length === 0 ? (
                          <div className={styles.cardEmpty}>—</div>
                        ) : (
                          selectedItemsByKind.track.map((it) => {
                            const primaryKo = displayKoLine(it);
                            const ja = displayJaLine(it, primaryKo);
                            const meta = displayWorkLabel(
                              it.source_work_name_ko,
                              it.source_work_name_ja,
                              it.source_work_name_en
                            );
                            const rank = rankOf("track", it.id);
                            return (
                              <div key={it.id} className={styles.cardItem}>
                                <div className={styles.cardItemPrimary}>
                                  <span className={styles.cardRankPill}>{`#${rank}`}</span>
                                  {primaryKo}
                                </div>
                                {ja ? <div className={styles.cardItemSecondary}>{ja}</div> : null}
                                {meta ? <div className={styles.cardItemMeta}>{meta}</div> : null}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div className={styles.cardCol}>
                      <div className={styles.cardColHeader}>
                        <div className={styles.cardColTitle}>4. 작품</div>
                        <div className={styles.cardColCount}>{selectedItemsByKind.work.length}</div>
                      </div>
                      <div className={styles.cardList}>
                        {selectedItemsByKind.work.length === 0 ? (
                          <div className={styles.cardEmpty}>—</div>
                        ) : (
                          selectedItemsByKind.work.map((it) => {
                            const primaryKo = displayWorkKoTitle(it);
                            const ja = displayWorkJaTitle(it);
                            const rank = rankOf("work", it.id);
                            return (
                              <div key={it.id} className={styles.cardItem}>
                                <div className={styles.cardItemPrimary}>
                                  <span className={styles.cardRankPill}>{`#${rank}`}</span>
                                  {primaryKo}
                                </div>
                                {ja ? <div className={styles.cardItemSecondary}>{ja}</div> : null}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    generated on {formatDateYYYYMMDD(new Date())}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryButton} onClick={downloadJson}>
                JSON
              </button>
              <button type="button" className={styles.secondaryButton} onClick={downloadCsv}>
                CSV
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={downloadPngFromPreview}
                disabled={!pngBlobUrl || isPngPreparing}
              >
                {isPngPreparing ? "Preparing PNG..." : "Download PNG"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isPortraitEditorOpen ? (
        <div
          className={styles.portraitOverlay}
          role="presentation"
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setIsPortraitEditorOpen(false);
          }}
        >
          <div className={styles.portraitDialog} role="dialog" aria-modal="true">
            <div className={styles.portraitHeader}>
              <div className={styles.portraitTitle}>
                Portrait 편집
                {portraitEditingCharacter ? `: ${displayKoLine(portraitEditingCharacter)}` : ""}
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setIsPortraitEditorOpen(false)}
                aria-label="close-portrait"
              >
                ×
              </button>
            </div>

            <div className={styles.portraitBody}>
              <div className={styles.portraitCropColumn}>
                <div className={styles.portraitCropLabel}>1:1 Crop</div>
                <div
                  ref={portraitViewportRef}
                  className={styles.portraitViewport}
                  onPointerDown={(e) => {
                    if (!portraitDraftNatural.ready) return;
                    const vw = portraitViewportSize.width || 280;
                    const vh = portraitViewportSize.height || 280;
                    const crop = computeCrop(
                      portraitDraftNatural.width,
                      portraitDraftNatural.height,
                      vw,
                      vh,
                      portraitDraftZoom,
                      portraitDraftPosX,
                      portraitDraftPosY
                    );
                    portraitDragRef.current = {
                      startClientX: e.clientX,
                      startClientY: e.clientY,
                      startPosX: portraitDraftPosX,
                      startPosY: portraitDraftPosY,
                      maxShiftX: crop.maxShiftX,
                      maxShiftY: crop.maxShiftY,
                    };
                    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                  }}
                  onPointerMove={(e) => {
                    const drag = portraitDragRef.current;
                    if (!drag) return;
                    const dx = e.clientX - drag.startClientX;
                    const dy = e.clientY - drag.startClientY;
                    const nextX =
                      drag.maxShiftX > 0 ? drag.startPosX - dx / drag.maxShiftX : drag.startPosX;
                    const nextY =
                      drag.maxShiftY > 0 ? drag.startPosY - dy / drag.maxShiftY : drag.startPosY;
                    setPortraitDraftPosX(clamp01(nextX));
                    setPortraitDraftPosY(clamp01(nextY));
                  }}
                  onPointerUp={() => {
                    portraitDragRef.current = null;
                  }}
                  onPointerCancel={() => {
                    portraitDragRef.current = null;
                  }}
                >
                  <img
                    src={portraitDraftResolvedUrl}
                    alt={
                      portraitEditingCharacter ? displayKoLine(portraitEditingCharacter) : "portrait"
                    }
                    className={styles.portraitImg}
                    draggable={false}
                    style={(() => {
                      const vw = portraitViewportSize.width || 280;
                      const vh = portraitViewportSize.height || 280;
                      if (!portraitDraftNatural.ready) return {};
                      const crop = computeCrop(
                        portraitDraftNatural.width,
                        portraitDraftNatural.height,
                        vw,
                        vh,
                        portraitDraftZoom,
                        portraitDraftPosX,
                        portraitDraftPosY
                      );
                      return {
                        width: `${crop.width}px`,
                        height: `${crop.height}px`,
                        transform: `translate(${crop.translateX}px, ${crop.translateY}px)` as const,
                      };
                    })()}
                  />
                </div>

                <label className={styles.portraitSliderLabel}>
                  Zoom
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={portraitDraftZoom}
                    onChange={(e) => setPortraitDraftZoom(Number(e.target.value))}
                    className={styles.portraitSlider}
                  />
                </label>
              </div>

              <div className={styles.portraitFormColumn}>
                <label className={styles.portraitField}>
                  이미지
                  <select
                    className={styles.portraitSelect}
                    value={portraitDraftImageUrl}
                    onChange={(e) => setPortraitDraftImageUrl(e.target.value)}
                  >
                    {(() => {
                      const hasCurrent = portraitEditingCandidates.some(
                        (c) => c.url === portraitDraftImageUrl
                      );
                      const list: CharacterImageCandidate[] =
                        !hasCurrent && portraitDraftImageUrl
                          ? [
                              { gameId: "saved", url: portraitDraftImageUrl },
                              ...portraitEditingCandidates,
                            ]
                          : portraitEditingCandidates;
                      return list.map((c) => (
                        <option key={c.url} value={c.url}>
                          {c.gameId} · {c.url.split("/").pop()}
                        </option>
                      ));
                    })()}
                  </select>
                </label>

                <label className={styles.portraitField}>
                  코멘트
                  <textarea
                    className={styles.portraitTextarea}
                    value={portraitDraftComment}
                    onChange={(e) => setPortraitDraftComment(e.target.value)}
                    placeholder="캐릭터 1순위 코멘트"
                    maxLength={120}
                    rows={4}
                  />
                </label>

                <div className={styles.portraitActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                      setPortraitDraftZoom(1);
                      setPortraitDraftPosX(0.5);
                      setPortraitDraftPosY(0.2);
                    }}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setIsPortraitEditorOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={savePortraitDraft}
                    disabled={!portraitDraftImageUrl}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
