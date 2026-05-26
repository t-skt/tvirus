// Portrait crop / image natural size / element resize / storage 헬퍼.

import React, { useEffect, useState } from "react";
import {
  PORTRAIT_STORAGE_KEY,
  PORTRAIT_STORAGE_VERSION,
  type PortraitState,
  type PortraitStorage,
} from "./types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

export function loadPortraitStorage(): PortraitStorage {
  if (typeof window === "undefined") {
    return { version: PORTRAIT_STORAGE_VERSION, items: {} };
  }
  try {
    const raw = window.localStorage.getItem(PORTRAIT_STORAGE_KEY);
    if (!raw) return { version: PORTRAIT_STORAGE_VERSION, items: {} };
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return { version: PORTRAIT_STORAGE_VERSION, items: {} };
    const version = (parsed.version === 1 ? 1 : 0) as 1 | 0;
    if (version !== 1) return { version: PORTRAIT_STORAGE_VERSION, items: {} };
    const itemsRaw = parsed.items;
    if (!isRecord(itemsRaw)) return { version: PORTRAIT_STORAGE_VERSION, items: {} };

    const items: Record<string, PortraitState> = {};
    for (const [id, v] of Object.entries(itemsRaw)) {
      if (!isRecord(v)) continue;
      const imageUrl = asString(v.imageUrl);
      const zoom = typeof v.zoom === "number" ? v.zoom : 1;
      const posX = typeof v.posX === "number" ? v.posX : 0.5;
      const posY = typeof v.posY === "number" ? v.posY : 0.2;
      const comment = asString(v.comment);
      const updatedAt = asString(v.updatedAt) || new Date().toISOString();
      if (!imageUrl) continue;
      items[id] = {
        imageUrl,
        zoom: clamp(zoom, 1, 3),
        posX: clamp01(posX),
        posY: clamp01(posY),
        comment,
        updatedAt,
      };
    }
    return { version: PORTRAIT_STORAGE_VERSION, items };
  } catch {
    return { version: PORTRAIT_STORAGE_VERSION, items: {} };
  }
}

export function computeCrop(
  naturalW: number,
  naturalH: number,
  viewportW: number,
  viewportH: number,
  zoom: number,
  posX: number,
  posY: number
): {
  width: number;
  height: number;
  translateX: number;
  translateY: number;
  maxShiftX: number;
  maxShiftY: number;
} {
  const base = Math.max(viewportW / naturalW, viewportH / naturalH);
  const scale = base * zoom;
  const scaledW = naturalW * scale;
  const scaledH = naturalH * scale;
  const maxShiftX = Math.max(0, scaledW - viewportW);
  const maxShiftY = Math.max(0, scaledH - viewportH);

  const x = clamp01(posX);
  const y = clamp01(posY);
  const translateX = -maxShiftX * x;
  const translateY = -maxShiftY * y;

  return {
    width: scaledW,
    height: scaledH,
    translateX,
    translateY,
    maxShiftX,
    maxShiftY,
  };
}

export function useImageNaturalSize(
  url: string | null
): { width: number; height: number; ready: boolean } {
  const [state, setState] = useState<{ width: number; height: number; ready: boolean }>({
    width: 0,
    height: 0,
    ready: false,
  });

  useEffect(() => {
    if (!url) {
      setState({ width: 0, height: 0, ready: false });
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.src = url;

    const commit = () => {
      if (cancelled) return;
      const w = img.naturalWidth || 0;
      const h = img.naturalHeight || 0;
      if (w && h) setState({ width: w, height: h, ready: true });
      else setState({ width: 0, height: 0, ready: false });
    };

    if (img.complete) {
      commit();
    } else {
      img.addEventListener("load", commit);
      img.addEventListener("error", commit);
    }

    return () => {
      cancelled = true;
      img.removeEventListener("load", commit);
      img.removeEventListener("error", commit);
    };
  }, [url]);

  return state;
}

export function useElementSize(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean
): { width: number; height: number } {
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const r = el.getBoundingClientRect();
      setSize({ width: r.width, height: r.height });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [enabled, ref]);

  return size;
}

export async function waitForImages(container: HTMLElement): Promise<void> {
  const imgs = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    imgs.map(async (img) => {
      if (img.complete && img.naturalWidth > 0) return;
      const anyImg = img as unknown as { decode?: () => Promise<void> };
      const timeoutMs = 8000;
      const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, timeoutMs));

      if (anyImg.decode) {
        try {
          await Promise.race([anyImg.decode(), timeout]);
          if (img.complete) return;
        } catch {
          // fall through
        }
      }

      await Promise.race([
        new Promise<void>((resolve) => {
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        }),
        timeout,
      ]);
    })
  );
}
