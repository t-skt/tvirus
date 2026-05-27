// ─── Sprite list ────────────────────────────────────────────────────────────

export const ALL_SPRITES = [
  "alice_margatroid",
  "aunn_komano",
  "aya_shameimaru",
  "benben_tsukumo",
  "byakuren_hijiri",
  "chen",
  "chimata_tenkyuu",
  "chimi_houjuu",
  "chiyari_tenkajin",
  "cirno",
  "clownpiece",
  "daiyousei",
  "doremy_sweet",
  "eika_ebisu",
  "eiki_shiki_yamaxanadu",
  "eirin_yagokoro",
  "enoko_mitsugashira",
  "eternity_larva",
  "ex_keine",
  "flandre_scarlet",
  "fortune_teller",
  "fujiwara_no_mokou",
  "hata_no_kokoro",
  "hatate_himekaidou",
  "hecatia_lapislazuli",
  "hieda_no_akyuu",
  "hina_kagiyama",
  "hisami_yomotsu",
  "hong_meiling",
  "ichirin_kumoi",
  "iku_nagae",
  "joon_yorigami",
  "junko",
  "kagerou_imaizumi",
  "kaguya_houraisan",
  "kanako_yasaka",
  "kasen_ibaraki",
  "keiki_haniyasushin",
  "keine_kamishirasawa",
  "kisume",
  "koakuma",
  "kogasa_tatara",
  "koishi_komeiji",
  "komachi_onozuka",
  "kosuzu_motoori",
  "kutaka_niwatari",
  "kyouko_kasodani",
  "letty_whiterock",
  "lily_white",
  "luna_child",
  "lunasa_prismriver",
  "lyrica_prismriver",
  "mai_teireida",
  "maimizou_futatsuiwa",
  "maribel_hearn",
  "marisa_kirisame",
  "mayumi_joutouguu",
  "medicine_melancholy",
  "megumu_iizunamaru",
  "merlin_prismriver",
  "mike_goutokuji",
  "minamitsu_murasa",
  "minoriko_aki",
  "misumaru_tamatsukuri",
  "miyoi_okunoda",
  "mizuchi_miyadeguchi",
  "momiji_inubashiri",
  "momoyo_himemushi",
  "mononobe_no_futo",
  "mystia_lorelei",
  "nareko_michigami",
  "narumi_yatadera",
  "nazrin",
  "nemuno_sakata",
  "nitori_kawashiro",
  "nue_houjuu",
  "okina_matara",
  "parsee_mizuhashi",
  "patchouli_knowledge",
  "raiko_horikawa",
  "ran_yakumo",
  "reimu_hakurei",
  "reisen",
  "reisen_udonge_inaba",
  "remilia_scarlet",
  "renko_usami",
  "rin_kaenbyou",
  "rin_satsuki",
  "ringo",
  "rinnosuke_morichika",
  "rumia",
  "sagume_kishin",
  "saki_kurokoma",
  "sakuya_izayoi",
  "sanae_kochiya",
  "sannyo_komakusa",
  "satono_nishida",
  "satori_komeiji",
  "seiga_kaku",
  "seija_kijin",
  "seiran",
  "sekibanki",
  "shanghai_doll",
  "shinmyoumaru_sukuna",
  "shion_yorigami",
  "shizuha_aki",
  "shou_toramaru",
  "soga_no_tojiko",
  "son_biten",
  "star_sapphire",
  "suika_ibuki",
  "sumireko_usami",
  "sunny_milk",
  "suwako_moriya",
  "takane_yamashiro",
  "tenshi_hinanawi",
  "tewi_inaba",
  "tokiko",
  "toyosatomimi_no_miko",
  "tsukasa_kudamaki",
  "ubame_chirizuka",
  "unzan",
  "urumi_ushizaki",
  "utsuho_reiuji",
  "wakasagihime",
  "watatsuki_no_toyohime",
  "watatsuki_no_yorihime",
  "wriggle_nightbug",
  "yachie_kicchou",
  "yamame_kurodani",
  "yatsuhashi_tsukumo",
  "yoshika_miyako",
  "youmu_konpaku",
  "yukari_yakumo",
  "yuugi_hoshiguma",
  "yuuka_kazami",
  "yuuma_toutetsu",
  "yuyuko_saigyouji",
  "zanmu_nippaku",
];

// ─── Character doc links ────────────────────────────────────────────────────

// Cross-site target: twiki (Korean Touhou wiki) hosted at the same GH Pages org.
const TWIKI_ORIGIN = "https://t-skt.github.io/twiki";

export function resolveCharacterDocUrl(docPath: string): string {
  if (/^https?:\/\//.test(docPath)) return docPath;
  return TWIKI_ORIGIN + (docPath.startsWith("/") ? docPath : "/" + docPath);
}

export const CHARACTER_DOC_MAP: Record<string, string> = {
  // Th06
  rumia: "/docs/th06/characters/rumia",
  cirno: "/docs/th06/characters/cirno",
  daiyousei: "/docs/th06/characters/daiyousei",
  hong_meiling: "/docs/th06/characters/hong_meiling",
  koakuma: "/docs/th06/characters/koakuma",
  patchouli_knowledge: "/docs/th06/characters/patchouli_knowledge",
  sakuya_izayoi: "/docs/th06/characters/izayoi_sakuya",
  remilia_scarlet: "/docs/th06/characters/remilia_scarlet",
  flandre_scarlet: "/docs/th06/characters/flandre_scarlet",
  // Th07
  letty_whiterock: "/docs/th07/characters/letty_whiterock",
  chen: "/docs/th07/characters/chen",
  alice_margatroid: "/docs/th07/characters/alice_margatroid",
  lily_white: "/docs/th07/characters/lily_white",
  lunasa_prismriver: "/docs/th07/characters/lunasa_prismriver",
  merlin_prismriver: "/docs/th07/characters/merlin_prismriver",
  lyrica_prismriver: "/docs/th07/characters/lyrica_prismriver",
  youmu_konpaku: "/docs/th07/characters/konpaku_youmu",
  yuyuko_saigyouji: "/docs/th07/characters/saigyouji_yuyuko",
  ran_yakumo: "/docs/th07/characters/yakumo_ran",
  yukari_yakumo: "/docs/th07/characters/yakumo_yukari",
  // Th08
  wriggle_nightbug: "/docs/th08/characters/wriggle_nightbug",
  mystia_lorelei: "/docs/th08/characters/mystia_lorelei",
  keine_kamishirasawa: "/docs/th08/characters/kamishirasawa_keine",
  tewi_inaba: "/docs/th08/characters/inaba_tewi",
  reisen_udonge_inaba: "/docs/th08/characters/reisen_udongein_inaba",
  eirin_yagokoro: "/docs/th08/characters/yagokoro_eirin",
  kaguya_houraisan: "/docs/th08/characters/houraisan_kaguya",
  fujiwara_no_mokou: "/docs/th08/characters/fujiwara_no_mokou",
  // Th09
  medicine_melancholy: "/docs/th09/characters/medicine_melancholy",
  yuuka_kazami: "/docs/th09/characters/kazami_yuuka",
  komachi_onozuka: "/docs/th09/characters/onozuka_komachi",
  eiki_shiki_yamaxanadu: "/docs/th09/characters/shikieiki_yamaxanadu",
  // Th10
  shizuha_aki: "/docs/th10/characters/aki_shizuha",
  minoriko_aki: "/docs/th10/characters/aki_minoriko",
  hina_kagiyama: "/docs/th10/characters/kagiyama_hina",
  nitori_kawashiro: "/docs/th10/characters/kawashiro_nitori",
  momiji_inubashiri: "/docs/th10/characters/inubashiri_momiji",
  sanae_kochiya: "/docs/th10/characters/kochiya_sanae",
  kanako_yasaka: "/docs/th10/characters/yasaka_kanako",
  suwako_moriya: "/docs/th10/characters/moriya_suwako",
  // Th11
  kisume: "/docs/th11/characters/kisume",
  yamame_kurodani: "/docs/th11/characters/kurodani_yamame",
  parsee_mizuhashi: "/docs/th11/characters/mizuhashi_parsee",
  yuugi_hoshiguma: "/docs/th11/characters/hoshiguma_yuugi",
  satori_komeiji: "/docs/th11/characters/komeiji_satori",
  rin_kaenbyou: "/docs/th11/characters/kaenbyou_rin",
  utsuho_reiuji: "/docs/th11/characters/reiuji_utsuho",
  koishi_komeiji: "/docs/th11/characters/komeiji_koishi",
  // Th12
  nazrin: "/docs/th12/characters/nazrin",
  kogasa_tatara: "/docs/th12/characters/tatara_kogasa",
  ichirin_kumoi: "/docs/th12/characters/kumoi_ichirin",
  minamitsu_murasa: "/docs/th12/characters/murasa_minamitsu",
  shou_toramaru: "/docs/th12/characters/toramaru_shou",
  byakuren_hijiri: "/docs/th12/characters/hijiri_byakuren",
  // Th13
  kyouko_kasodani: "/docs/th13/characters/kasodani_kyouko",
  yoshika_miyako: "/docs/th13/characters/miyako_yoshika",
  seiga_kaku: "/docs/th13/characters/kaku_seiga",
  soga_no_tojiko: "/docs/th13/characters/soga_no_tojiko",
  mononobe_no_futo: "/docs/th13/characters/mononobe_no_futo",
  toyosatomimi_no_miko: "/docs/th13/characters/toyosatomimi_no_miko",
  // Th14
  wakasagihime: "/docs/th14/characters/wakasagihime",
  sekibanki: "/docs/th14/characters/sekibanki",
  kagerou_imaizumi: "/docs/th14/characters/imaizumi_kagerou",
  benben_tsukumo: "/docs/th14/characters/tsukumo_benben",
  yatsuhashi_tsukumo: "/docs/th14/characters/tsukumo_yatsuhashi",
  seija_kijin: "/docs/th14/characters/kijin_seija",
  shinmyoumaru_sukuna: "/docs/th14/characters/sukuna_shinmyoumaru",
  raiko_horikawa: "/docs/th14/characters/horikawa_raiko",
  // Th15
  seiran: "/docs/th15/characters/seiran",
  ringo: "/docs/th15/characters/ringo",
  doremy_sweet: "/docs/th15/characters/doremy_sweet",
  sagume_kishin: "/docs/th15/characters/kishin_sagume",
  clownpiece: "/docs/th15/characters/clownpiece",
  junko: "/docs/th15/characters/junko",
  hecatia_lapislazuli: "/docs/th15/characters/hecatia_lapislazuli",
  // Th16
  eternity_larva: "/docs/th16/characters/eternity_larva",
  nemuno_sakata: "/docs/th16/characters/sakata_nemuno",
  narumi_yatadera: "/docs/th16/characters/yatadera_narumi",
  satono_nishida: "/docs/th16/characters/nishida_satono",
  mai_teireida: "/docs/th16/characters/teireida_mai",
  okina_matara: "/docs/th16/characters/matara_okina",
  // Th17
  eika_ebisu: "/docs/th17/characters/ebisu_eika",
  urumi_ushizaki: "/docs/th17/characters/ushizaki_urumi",
  kutaka_niwatari: "/docs/th17/characters/niwatari_kutaka",
  yachie_kicchou: "/docs/th17/characters/kitcho_yachie",
  mayumi_joutouguu: "/docs/th17/characters/joutougu_mayumi",
  keiki_haniyasushin: "/docs/th17/characters/haniyasushin_keiki",
  saki_kurokoma: "/docs/th17/characters/kurokoma_saki",
  // Th18
  mike_goutokuji: "/docs/th18/characters/goutokuzi_mike",
  takane_yamashiro: "/docs/th18/characters/yamashiro_takane",
  sannyo_komakusa: "/docs/th18/characters/komakusa_sannyo",
  misumaru_tamatsukuri: "/docs/th18/characters/tamatsukuri_misumaru",
  tsukasa_kudamaki: "/docs/th18/characters/kudamaki_tsukasa",
  megumu_iizunamaru: "/docs/th18/characters/iizunamaru_megumu",
  chimata_tenkyuu: "/docs/th18/characters/tenkyu_chimata",
  momoyo_himemushi: "/docs/th18/characters/himemushi_momoyo",
  // Th19
  son_biten: "/docs/th19/characters/son_biten",
  enoko_mitsugashira: "/docs/th19/characters/enoko_maimoto",
  chiyari_tenkajin: "/docs/th19/characters/chiyari",
  hisami_yomotsu: "/docs/th19/characters/hisami_yomotsu",
  zanmu_nippaku: "/docs/th19/characters/zanmu_nippaku",
  chimi_houjuu: "/docs/th19/characters/houju_chimi",
  // Th075
  suika_ibuki: "/docs/th075/characters/ibuki_suika",
  // Th105
  iku_nagae: "/docs/th105/characters/nagae_iku",
  tenshi_hinanawi: "/docs/th105/characters/hinanawi_tenshi",
  // Th135
  hata_no_kokoro: "/docs/th135/characters/hatano_kokoro",
  // Th145
  sumireko_usami: "/docs/th145/characters/usami_sumireko",
  // Th155
  joon_yorigami: "/docs/th155/characters/yorigami_jyoon",
  shion_yorigami: "/docs/th155/characters/yorigami_shion",
  // Multi-game
  reimu_hakurei: "/docs/th06/characters/hakurei_reimu",
  marisa_kirisame: "/docs/th06/characters/kirisame_marisa",
  aya_shameimaru: "/docs/th09/characters/shameimaru_aya",
  reisen: "/docs/th15/characters/reisen",
  aunn_komano: "/docs/th16/characters/komano_aunn",
};

// ─── Types ──────────────────────────────────────────────────────────────────

export type Difficulty = "easy" | "normal" | "hard" | "lunatic";

export interface DiffConfig {
  cols: number;
  rows: number;
  label: string;
}

export const DIFF_CONFIG: Record<Difficulty, DiffConfig> = {
  easy: { cols: 6, rows: 4, label: "쉬움" },
  normal: { cols: 10, rows: 6, label: "보통" },
  hard: { cols: 14, rows: 8, label: "어려움" },
  lunatic: { cols: 18, rows: 10, label: "루나틱" },
};

export interface Tile {
  id: number; // unique instance id
  sprite: string; // sprite name
  removed: boolean;
}

export type Grid = (Tile | null)[][]; // [row][col], null = empty

export interface PathPoint {
  r: number;
  c: number;
}

export interface AnimatedPath {
  points: PathPoint[];
  id: number;
}

export interface GameState {
  grid: Grid;
  rows: number;
  cols: number;
  selected: PathPoint | null;
  hintsLeft: number;
  shufflesLeft: number;
  hintPair: [PathPoint, PathPoint] | null;
  animPath: AnimatedPath | null;
  won: boolean;
  noMoves: boolean;
  elapsed: number; // seconds
  running: boolean;
  animPathCounter: number;
  gameId: number;
  lastAction: "select" | "match" | "clear" | null;
}

// ─── Pure game logic ─────────────────────────────────────────────────────────

export function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildGrid(rows: number, cols: number): Grid {
  const pairsNeeded = (rows * cols) / 2;
  const shuffled = fisherYates(ALL_SPRITES);
  const chosen = shuffled.slice(0, pairsNeeded);
  const flat = fisherYates([...chosen, ...chosen]);

  const grid: Grid = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      id: r * cols + c,
      sprite: flat[r * cols + c],
      removed: false,
    })),
  );
  return grid;
}

// Check if cell (r, c) is empty (no tile) in the extended grid.
// The "extended" grid includes -1 and rows/cols as border lanes.
export function isEmpty(
  grid: Grid,
  rows: number,
  cols: number,
  r: number,
  c: number,
): boolean {
  if (r < 0 || r >= rows || c < 0 || c >= cols) return true; // border
  const t = grid[r][c];
  return t === null || t.removed;
}

// Check if a straight horizontal/vertical segment is clear (excluding endpoints).
export function segmentClear(
  grid: Grid,
  rows: number,
  cols: number,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
): boolean {
  if (r1 === r2) {
    const [cMin, cMax] = c1 < c2 ? [c1, c2] : [c2, c1];
    for (let c = cMin + 1; c < cMax; c++) {
      if (!isEmpty(grid, rows, cols, r1, c)) return false;
    }
    return true;
  } else {
    const [rMin, rMax] = r1 < r2 ? [r1, r2] : [r2, r1];
    for (let r = rMin + 1; r < rMax; r++) {
      if (!isEmpty(grid, rows, cols, r, c1)) return false;
    }
    return true;
  }
}

// Find connecting path with at most 2 turns. Returns path points (corners) or null.
// The path can route through the border (r=-1, r=rows, c=-1, c=cols).
export function findPath(
  grid: Grid,
  rows: number,
  cols: number,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
): PathPoint[] | null {
  // 0 turns: same row or col, direct clear line
  if (r1 === r2) {
    if (segmentClear(grid, rows, cols, r1, c1, r2, c2)) {
      return [
        { r: r1, c: c1 },
        { r: r2, c: c2 },
      ];
    }
  } else if (c1 === c2) {
    if (segmentClear(grid, rows, cols, r1, c1, r2, c2)) {
      return [
        { r: r1, c: c1 },
        { r: r2, c: c2 },
      ];
    }
  }

  // 1 turn: two possible corners
  // Corner A: (r1, c2)
  if (isEmpty(grid, rows, cols, r1, c2)) {
    if (
      segmentClear(grid, rows, cols, r1, c1, r1, c2) &&
      segmentClear(grid, rows, cols, r1, c2, r2, c2)
    ) {
      return [
        { r: r1, c: c1 },
        { r: r1, c: c2 },
        { r: r2, c: c2 },
      ];
    }
  }
  // Corner B: (r2, c1)
  if (isEmpty(grid, rows, cols, r2, c1)) {
    if (
      segmentClear(grid, rows, cols, r2, c1, r2, c2) &&
      segmentClear(grid, rows, cols, r1, c1, r2, c1)
    ) {
      return [
        { r: r1, c: c1 },
        { r: r2, c: c1 },
        { r: r2, c: c2 },
      ];
    }
  }

  // 2 turns: scan all intermediate columns (including border -1 and cols).
  // Route: (r1,c1) -> (r1,cM) -> (r2,cM) -> (r2,c2)
  for (let cM = -1; cM <= cols; cM++) {
    if (cM === c1 || cM === c2) continue;
    // The two corner cells must be empty (border cells always are)
    if (!isEmpty(grid, rows, cols, r1, cM)) continue;
    if (!isEmpty(grid, rows, cols, r2, cM)) continue;
    if (
      segmentClear(grid, rows, cols, r1, c1, r1, cM) &&
      segmentClear(grid, rows, cols, r1, cM, r2, cM) &&
      segmentClear(grid, rows, cols, r2, cM, r2, c2)
    ) {
      return [
        { r: r1, c: c1 },
        { r: r1, c: cM },
        { r: r2, c: cM },
        { r: r2, c: c2 },
      ];
    }
  }

  // 2 turns: scan all intermediate rows (including border -1 and rows).
  // Route: (r1,c1) -> (rM,c1) -> (rM,c2) -> (r2,c2)
  for (let rM = -1; rM <= rows; rM++) {
    if (rM === r1 || rM === r2) continue;
    // The two corner cells must be empty (border cells always are)
    if (!isEmpty(grid, rows, cols, rM, c1)) continue;
    if (!isEmpty(grid, rows, cols, rM, c2)) continue;
    if (
      segmentClear(grid, rows, cols, r1, c1, rM, c1) &&
      segmentClear(grid, rows, cols, rM, c1, rM, c2) &&
      segmentClear(grid, rows, cols, rM, c2, r2, c2)
    ) {
      return [
        { r: r1, c: c1 },
        { r: rM, c: c1 },
        { r: rM, c: c2 },
        { r: r2, c: c2 },
      ];
    }
  }

  return null;
}

export function getTile(grid: Grid, r: number, c: number): Tile | null {
  return grid[r]?.[c] ?? null;
}

// Find all valid matching pairs in current grid.
export function findAllPairs(
  grid: Grid,
  rows: number,
  cols: number,
): [PathPoint, PathPoint][] {
  const pairs: [PathPoint, PathPoint][] = [];
  const tiles: PathPoint[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = grid[r][c];
      if (t && !t.removed) tiles.push({ r, c });
    }
  }

  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      const a = tiles[i];
      const b = tiles[j];
      const ta = getTile(grid, a.r, a.c)!;
      const tb = getTile(grid, b.r, b.c)!;
      if (ta.sprite === tb.sprite) {
        if (findPath(grid, rows, cols, a.r, a.c, b.r, b.c)) {
          pairs.push([a, b]);
        }
      }
    }
  }
  return pairs;
}

export function countRemaining(grid: Grid, rows: number, cols: number): number {
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = grid[r][c];
      if (t && !t.removed) count++;
    }
  }
  return count;
}

export function removeTiles(grid: Grid, a: PathPoint, b: PathPoint): Grid {
  return grid.map((row, r) =>
    row.map((tile, c) => {
      if ((r === a.r && c === a.c) || (r === b.r && c === b.c)) {
        return tile ? { ...tile, removed: true } : null;
      }
      return tile;
    }),
  );
}

// Shuffle remaining tiles into random positions.
export function shuffleRemaining(grid: Grid, rows: number, cols: number): Grid {
  const sprites: string[] = [];
  const positions: [number, number][] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = grid[r][c];
      if (t && !t.removed) {
        sprites.push(t.sprite);
        positions.push([r, c]);
      }
    }
  }

  const shuffledSprites = fisherYates(sprites);
  const newGrid: Grid = grid.map((row) =>
    row.map((t) => (t ? { ...t } : null)),
  );
  let idCounter = rows * cols; // ensure new ids

  positions.forEach(([r, c], i) => {
    newGrid[r][c] = {
      id: idCounter++,
      sprite: shuffledSprites[i],
      removed: false,
    };
  });

  return newGrid;
}

let gameIdCounter = 0;

export function makeInitialState(difficulty: Difficulty): GameState {
  const { cols, rows } = DIFF_CONFIG[difficulty];
  let grid = buildGrid(rows, cols);

  // Ensure at least one valid move exists
  let attempts = 0;
  while (findAllPairs(grid, rows, cols).length === 0 && attempts < 20) {
    grid = buildGrid(rows, cols);
    attempts++;
  }

  return {
    grid,
    rows,
    cols,
    selected: null,
    hintsLeft: 3,
    shufflesLeft: 3,
    hintPair: null,
    animPath: null,
    won: false,
    noMoves: false,
    elapsed: 0,
    running: true,
    animPathCounter: 0,
    gameId: ++gameIdCounter,
    lastAction: null,
  };
}

// ─── Color generation ────────────────────────────────────────────────────────

export function spriteHash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function spriteColor(name: string): { bg: string; border: string } {
  const h = spriteHash(name) % 360;
  return {
    bg: `hsl(${h}, 55%, 88%)`,
    border: `hsl(${h}, 50%, 62%)`,
  };
}

// ─── Display name helper ─────────────────────────────────────────────────────

export function spriteDisplayName(sprite: string): string {
  return sprite
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Pixel grid sizes ────────────────────────────────────────────────────────

export const TILE_SIZE_MAX = 48; // px max tile size
export const TILE_SIZE_MIN = 32; // px min tile size
export const TILE_GAP = 4; // px gap between tiles
export const SPRITE_RATIO = 0.75; // sprite takes 75% of tile size
