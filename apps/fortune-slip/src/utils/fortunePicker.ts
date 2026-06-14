import fortuneSlips from "../data/fortuneSlips.json";
import type { FortuneSlip } from "./types";

// Re-export with type
const slips = fortuneSlips as FortuneSlip[];

/**
 * Simple string hash (djb2) for deterministic selection.
 */
function hashCode(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Pick today's fortune slip for a given user.
 * Deterministic: same userId + same date = same fortune all day.
 */
export function pickTodaysFortune(userId: string): FortuneSlip {
  const today = new Date();
  const dateStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const seed = hashCode(userId + dateStr);
  const index = seed % slips.length;
  return slips[index];
}

/** Get the fortune level color class */
export function fortuneColorClass(fortuneKo: string): string {
  if (fortuneKo.includes("대길") || fortuneKo.includes("대대") || fortuneKo.includes("최강")) return "fortune-blessed";
  if (fortuneKo.includes("대") || fortuneKo.includes("중길") || fortuneKo.includes("길") && !fortuneKo.includes("말") && !fortuneKo.includes("반") && !fortuneKo.includes("흉") && !fortuneKo.includes("凶")) return "fortune-great";
  if (fortuneKo.includes("말") || fortuneKo.includes("소길") || fortuneKo.includes("반") || fortuneKo.includes("평")) return "fortune-fair";
  if (fortuneKo.includes("흉") || fortuneKo.includes("凶") || fortuneKo.includes("맹")) return "fortune-bad";
  return "fortune-neutral";
}
