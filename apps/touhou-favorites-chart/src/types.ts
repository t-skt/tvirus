// 데이터셋 타입 + 즐겨찾기 항목 타입 정의.

export type FavoriteKind = "character" | "track" | "work";

export type WorkType = "game" | "music" | "book" | "unknown";

export type SourceRef = {
  file: string;
  line: number | null;
};

export type BaseEntity = {
  id: string;
  name_ko: string;
  name_ja: string;
  name_en: string;
  search: string[];
  source?: SourceRef;
};

export type WorkEntity = BaseEntity & {
  type: WorkType;
  work_section_ja: string;
  order_index: number | null;
};

export type CharacterEntity = BaseEntity & {
  source_work_id: string | null;
};

export type TrackEntity = BaseEntity & {
  source_work_id: string | null;
};

export type TouhouNormalizedV2 = {
  meta?: {
    source?: string;
    generated_at?: string;
  };
  works: WorkEntity[];
  characters: CharacterEntity[];
  tracks: TrackEntity[];
};

export type FavoriteItem = {
  kind: FavoriteKind;
  id: string;
  name_ko: string;
  name_ja: string;
  name_en: string;
  source_work_id: string | null;
  source_work_name_ko: string;
  source_work_name_ja: string;
  source_work_name_en: string;
  source_file: string;
  source_line: number | null;
  csv_order: number;
  search_key: string;
};

export type CharacterImageCandidate = {
  gameId: string;
  url: string;
};

export type CharacterImagesIndex = Record<string, CharacterImageCandidate[]>;

export type PortraitState = {
  imageUrl: string;
  zoom: number;
  posX: number;
  posY: number;
  comment: string;
  updatedAt: string;
};

export type PortraitStorage = {
  version: 1;
  items: Record<string, PortraitState>;
};

export const PORTRAIT_STORAGE_KEY = "touhou_favorites_portraits_v1";
export const PORTRAIT_STORAGE_VERSION = 1 as const;

export const MAX_SELECTED_BY_KIND: Record<FavoriteKind, number> = {
  character: 4,
  track: 3,
  work: 3,
};

export type SeasonId = "spring" | "summer" | "autumn" | "winter";

export type SeasonPreset = {
  id: SeasonId;
  label: string;
  description: string;
  colors: {
    bg: string;
    surface: string;
    ink: string;
    muted: string;
    border: string;
    accentA: string;
    accentB: string;
    accentASoft: string;
    accentBSoft: string;
    pngBackground: string;
  };
  overlayTop: string;
  overlayBottom: string;
};

export const SEASON_PRESETS: SeasonPreset[] = [
  {
    id: "spring",
    label: "봄 | Spring",
    description: "벚꽃과 새싹의 따뜻한 느낌",
    colors: {
      bg: "#fff7fb",
      surface: "#ffffff",
      ink: "#2f1c34",
      muted: "rgba(47, 28, 52, 0.7)",
      border: "#f472b6",
      accentA: "#f472b6",
      accentB: "#34d399",
      accentASoft: "rgba(244, 114, 182, 0.2)",
      accentBSoft: "rgba(52, 211, 153, 0.16)",
      pngBackground: "#fff7fb",
    },
    overlayTop: "rgba(244, 114, 182, 0.12)",
    overlayBottom: "rgba(52, 211, 153, 0.12)",
  },
  {
    id: "summer",
    label: "여름 | Summer",
    description: "짙은 초록과 한여름의 생기",
    colors: {
      bg: "#f3fff4",
      surface: "#ffffff",
      ink: "#0b2b1a",
      muted: "rgba(11, 43, 26, 0.7)",
      border: "#16a34a",
      accentA: "#16a34a",
      accentB: "#22c55e",
      accentASoft: "rgba(34, 197, 94, 0.22)",
      accentBSoft: "rgba(16, 185, 129, 0.16)",
      pngBackground: "#f3fff4",
    },
    overlayTop: "rgba(34, 197, 94, 0.12)",
    overlayBottom: "rgba(20, 184, 166, 0.12)",
  },
  {
    id: "autumn",
    label: "가을 | Autumn",
    description: "단풍과 노을",
    colors: {
      bg: "#fff7ec",
      surface: "#ffffff",
      ink: "#3c1a07",
      muted: "rgba(60, 26, 7, 0.7)",
      border: "#fb923c",
      accentA: "#fb923c",
      accentB: "#f97316",
      accentASoft: "rgba(251, 146, 60, 0.2)",
      accentBSoft: "rgba(249, 115, 22, 0.16)",
      pngBackground: "#fff7ec",
    },
    overlayTop: "rgba(251, 146, 60, 0.12)",
    overlayBottom: "rgba(234, 179, 8, 0.12)",
  },
  {
    id: "winter",
    label: "겨울 | Winter",
    description: "차분한 눈빛",
    colors: {
      bg: "#f3f7ff",
      surface: "#ffffff",
      ink: "#111936",
      muted: "rgba(17, 25, 54, 0.7)",
      border: "#0ea5e9",
      accentA: "#0ea5e9",
      accentB: "#6366f1",
      accentASoft: "rgba(14, 165, 233, 0.2)",
      accentBSoft: "rgba(99, 102, 241, 0.16)",
      pngBackground: "#f3f7ff",
    },
    overlayTop: "rgba(14, 165, 233, 0.12)",
    overlayBottom: "rgba(99, 102, 241, 0.12)",
  },
];

export const PNG_WIDTH = 1280;
export const PNG_HEIGHT = 720;
export const PNG_SCALE = 3;
