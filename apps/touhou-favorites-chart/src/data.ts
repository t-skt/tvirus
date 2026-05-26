// 데이터셋 JSON 파싱 + fetch hook.

import { useEffect, useState } from "react";
import { baseUrl } from "@shared/utils/baseUrl";
import type {
  BaseEntity,
  CharacterEntity,
  CharacterImageCandidate,
  CharacterImagesIndex,
  SourceRef,
  TouhouNormalizedV2,
  TrackEntity,
  WorkEntity,
  WorkType,
} from "./types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => (typeof x === "string" ? x : "")) : [];
}

function asNullableString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function asNullableNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function asWorkType(v: unknown): WorkType {
  return v === "game" || v === "music" || v === "book" || v === "unknown"
    ? v
    : "unknown";
}

function parseSourceRef(v: unknown): SourceRef | null {
  if (!isRecord(v)) return null;
  const file = asString(v.file);
  const line = asNullableNumber(v.line);
  if (!file) return null;
  return { file, line };
}

export function parseDataset(v: unknown): TouhouNormalizedV2 {
  if (!isRecord(v)) throw new Error("Invalid dataset: expected object");
  const worksRaw = v.works;
  const charactersRaw = v.characters;
  const tracksRaw = v.tracks;
  if (!Array.isArray(worksRaw) || !Array.isArray(charactersRaw) || !Array.isArray(tracksRaw)) {
    throw new Error("Invalid dataset: expected works[]/characters[]/tracks[]");
  }

  const parseBase = (x: unknown): BaseEntity | null => {
    if (!isRecord(x)) return null;
    const id = asString(x.id);
    if (!id) return null;
    const source = parseSourceRef(x.source);
    return {
      id,
      name_ko: asString(x.name_ko),
      name_ja: asString(x.name_ja),
      name_en: asString(x.name_en),
      search: asStringArray(x.search),
      source: source || undefined,
    };
  };

  const works: WorkEntity[] = [];
  for (const w of worksRaw) {
    const base = parseBase(w);
    if (!base) continue;
    if (!isRecord(w)) continue;
    works.push({
      ...base,
      type: asWorkType(w.type),
      work_section_ja: asString(w.work_section_ja),
      order_index: asNullableNumber(w.order_index),
    });
  }

  const characters: CharacterEntity[] = [];
  for (const c of charactersRaw) {
    const base = parseBase(c);
    if (!base) continue;
    if (!isRecord(c)) continue;
    characters.push({
      ...base,
      source_work_id: asNullableString(c.source_work_id),
    });
  }

  const tracks: TrackEntity[] = [];
  for (const t of tracksRaw) {
    const base = parseBase(t);
    if (!base) continue;
    if (!isRecord(t)) continue;
    tracks.push({
      ...base,
      source_work_id: asNullableString(t.source_work_id),
    });
  }

  const meta = isRecord(v.meta) ? v.meta : undefined;
  return {
    meta: meta
      ? {
          source: isRecord(meta) ? asString(meta.source) : "",
          generated_at: isRecord(meta) ? asString(meta.generated_at) : "",
        }
      : undefined,
    works,
    characters,
    tracks,
  };
}

export function parseCharacterImagesIndex(v: unknown): CharacterImagesIndex {
  if (!isRecord(v)) return {};
  const out: CharacterImagesIndex = {};
  for (const [k, vv] of Object.entries(v)) {
    if (!Array.isArray(vv)) continue;
    const list: CharacterImageCandidate[] = [];
    for (const x of vv) {
      if (!isRecord(x)) continue;
      const gameId = asString(x.gameId);
      const url = asString(x.url);
      if (!gameId || !url) continue;
      list.push({ gameId, url });
    }
    if (list.length) out[k] = list;
  }
  return out;
}

const EMPTY_DATASET: TouhouNormalizedV2 = { works: [], characters: [], tracks: [] };

export function useTouhouDataset(): {
  dataset: TouhouNormalizedV2;
  characterImagesIndex: CharacterImagesIndex;
  ready: boolean;
  error: string | null;
} {
  const [state, setState] = useState<{
    dataset: TouhouNormalizedV2;
    characterImagesIndex: CharacterImagesIndex;
    ready: boolean;
    error: string | null;
  }>({ dataset: EMPTY_DATASET, characterImagesIndex: {}, ready: false, error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [normRes, idxRes] = await Promise.all([
          fetch(baseUrl("data/touhou_normalized_v2.json")),
          fetch(baseUrl("data/touhou_character_images_index.json")),
        ]);
        if (!normRes.ok) throw new Error(`dataset fetch failed: ${normRes.status}`);
        if (!idxRes.ok) throw new Error(`image index fetch failed: ${idxRes.status}`);
        const normJson = await normRes.json();
        const idxJson = await idxRes.json();
        if (cancelled) return;
        setState({
          dataset: parseDataset(normJson),
          characterImagesIndex: parseCharacterImagesIndex(idxJson),
          ready: true,
          error: null,
        });
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        setState({ dataset: EMPTY_DATASET, characterImagesIndex: {}, ready: true, error: msg });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
