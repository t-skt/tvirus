import React, { useCallback, useMemo, useState } from "react";
import { getUserId } from "./utils/userIdentity";
import { pickTodaysFortune } from "./utils/fortunePicker";
import { getCharacterImageUrl } from "./utils/images";
import type { FortuneSlip } from "./utils/types";
import styles from "./styles.module.css";

type Lang = "ko" | "ja" | "en";

const FORTUNE_EMOJI: Record<string, string> = {
  "대길": "🌟", "대대": "🌟", "최강": "⭐", "중길": "✨",
  "길": "🍀", "소길": "🌱", "말길": "🌿", "반길": "🌾",
  "평": "⏸️", "흉": "🌧️", "凶": "🌧️", "맹": "💀", "흉맹": "💀",
  "미분": "❓",
};

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function getFortuneEmoji(fortune: string): string {
  for (const [key, emoji] of Object.entries(FORTUNE_EMOJI)) {
    if (fortune.includes(key)) return emoji;
  }
  return "🎴";
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const dow = DAY_NAMES[d.getDay()];
  return `${y}.${m}.${day} (${dow})`;
}

const LANG_LABELS: Record<Lang, string> = { ko: "한국어", ja: "日本語", en: "English" };

const FortuneApp: React.FC = () => {
  const userId = useMemo(() => getUserId(), []);
  const [lang, setLang] = useState<Lang>("ko");

  const slip = useMemo(() => pickTodaysFortune(userId), [userId]);

  const characterImage = useMemo(() => {
    const url = getCharacterImageUrl(slip.image);
    if (url) return url;
    // Fallback to dot image
    const dotName = slip.image.replace(".webp", ".png");
    return getCharacterImageUrl(dotName) ?? undefined;
  }, [slip.image]);

  const t = useCallback(
    (ko: string, ja: string, en: string) => {
      if (lang === "ko") return ko;
      if (lang === "ja") return ja;
      return en;
    },
    [lang]
  );

  const fortuneEmoji = getFortuneEmoji(slip.fortune.ko);
  const today = new Date();

  return (
    <div className={styles.page}>
      {/* Language toggle */}
      <div className={styles.langBar}>
        {(["ko", "ja", "en"] as Lang[]).map((l) => (
          <button
            key={l}
            className={`${styles.langBtn} ${lang === l ? styles.langBtnActive : ""}`}
            onClick={() => setLang(l)}
          >
            {LANG_LABELS[l]}
          </button>
        ))}
      </div>

      {/* Main card */}
      <main className={styles.card}>
        {/* Date & user header */}
        <div className={styles.header}>
          <div className={styles.date}>{formatDate(today)}</div>
          <div className={styles.greeting}>
            {t("오늘의 운세", "今日の運勢", "Today's Fortune")}
          </div>
        </div>

        {/* Fortune badge */}
        <div className={styles.fortuneBadge}>
          <span className={styles.fortuneEmoji}>{fortuneEmoji}</span>
          <span className={`${styles.fortuneText} ${styles[`fortune_${fortuneClass(slip.fortune.ko)}`]}`}>
            {t(slip.fortune.ko, slip.fortune.ja, slip.fortune.en)}
          </span>
        </div>

        {/* Character image */}
        {characterImage && (
          <div className={styles.imageWrap}>
            <img
              src={characterImage}
              alt={slip.character.en}
              className={styles.characterImg}
              loading="lazy"
            />
          </div>
        )}

        {/* Character info */}
        <div className={styles.charInfo}>
          <h2 className={styles.charName}>
            {t(slip.character.ko, slip.character.ja, slip.character.en)}
          </h2>
          <p className={styles.charTitle}>
            {t(slip.title.ko, slip.title.ja, slip.title.en)}
          </p>
        </div>

        {/* Poem */}
        <div className={styles.poemBox}>
          <div className={styles.poemLabel}>
            {t("시 (詩)", "詩 (Poem)", "Poem")}
          </div>
          <div className={styles.poemText}>
            {t(slip.poem.ko, slip.poem.ja, slip.poem.en)}
          </div>
        </div>

        {/* Fortune categories — always expanded */}
        <div className={styles.detailSection}>
          <h3 className={styles.sectionTitle}>
            {t("운세 항목", "運勢項目", "Fortune Categories")}
          </h3>
          {slip.categories.map((cat, i) => (
            <div key={i} className={styles.categoryItem}>
              <div className={styles.categoryHeader}>
                <span className={styles.categoryLabel}>{cat.label}</span>
              </div>
              <div className={styles.categoryBody}>
                <p>{t(cat.ko, cat.ja, cat.en)}</p>
              </div>
            </div>
          ))}

          {/* ZUN's comment */}
          {slip.comment.ko && (
            <>
              <h3 className={styles.sectionTitle}>
                {t("ZUN의 코멘트", "ZUNのコメント", "ZUN's Comment")}
              </h3>
              <div className={styles.commentBox}>
                <p>{t(slip.comment.ko, slip.comment.ja, slip.comment.en)}</p>
              </div>
            </>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.footerNum}>
            {t("동방환존신첨", "東方幻存神籤", "Whispered Oracle of Hakurei Shrine")} · #{slip.number} / 128
          </span>
          <div className={styles.footerNote}>
            {t("※ 오늘의 운세는 하루 동안 고정됩니다", "※ 今日の運勢は一日中固定されます", "※ Today's fortune is fixed for the day")}
          </div>
        </div>
      </main>
    </div>
  );
};

function fortuneClass(ko: string): string {
  if (ko.includes("대") || ko.includes("최강") || ko.includes("길") && !ko.includes("소") && !ko.includes("말") && !ko.includes("반")) return "great";
  if (ko.includes("중") || ko.includes("소") || ko.includes("말") || ko.includes("반") || ko.includes("평")) return "fair";
  if (ko.includes("흉") || ko.includes("凶") || ko.includes("맹")) return "bad";
  return "neutral";
}

export default FortuneApp;
