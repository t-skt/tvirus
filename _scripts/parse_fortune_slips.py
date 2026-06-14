#!/usr/bin/env python3
"""
Line-by-line parser for woohs_fortune_slips.md -> fortuneSlips.json + image mapping.
128 entries. Uses ## No. as entry delimiter (robust against --- within content).
"""

import json, os, re, sys

MARKDOWN_PATH = os.path.expanduser("~/git/hermes/woohs_fortune_slips.md")
OUTPUT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                           "apps/fortune-slip/src/data/fortuneSlips.json")
TWIKI_TH_DIR = os.path.expanduser("~/git/twiki/static/img")


def slugify(en_name: str) -> str:
    name = re.sub(r'\s*\(.*?\)\s*', '', en_name).strip()
    slug = re.sub(r"[']", '', name.lower())
    slug = re.sub(r'[^a-z0-9]+', '_', slug).strip('_')
    return slug


def parse_entries(lines: list[str]) -> list[dict]:
    entries = []
    current = None
    for line in lines:
        if line.startswith('## No.'):
            if current is not None:
                e = _parse_one(current)
                if e: entries.append(e)
            current = [line]
        elif current is not None:
            current.append(line)
    if current is not None:
        e = _parse_one(current)
        if e: entries.append(e)
    return entries


def _parse_one(lines: list[str]) -> dict | None:
    entry = {
        "number": 0, "character": {"ko": "", "ja": "", "en": ""},
        "fortune": {"ko": "", "ja": "", "en": ""},
        "title": {"ko": "", "ja": "", "en": ""},
        "ability": {"ko": "", "ja": "", "en": ""},
        "poem": {"ko": "", "ja": "", "en": ""},
        "categories": [], "comment": {"ko": "", "ja": "", "en": ""}, "image": "",
    }
    h = lines[0].strip()
    m = re.match(r'^## No\.\s*(\d+):\s*(.+?)\s*\((.+)\)\s*$', h)
    if not m:
        m = re.match(r'^## No\.\s*(\d+):\s*(.+)$', h)
        if not m: return None
        entry["number"], entry["character"]["en"] = int(m.group(1)), m.group(2).strip()
    else:
        entry["number"] = int(m.group(1))
        entry["character"]["en"] = m.group(2).strip()
        entry["character"]["ja"] = m.group(3).strip()

    mode = "fortune"
    poem_lang = None
    pj, pe, pk = [], [], []
    cat_rows = []
    cj, ce, ck = [], [], []
    cmode = None

    for line in lines[1:]:
        s = line.strip()

        if mode == "fortune":
            m = re.match(r'^\*\*Fortune:\*\*\s*(.+?)\s*\((.+?)\)\s*[-—]\s*(.+)$', s)
            if m:
                entry["fortune"]["ja"] = m.group(1).strip()
                entry["fortune"]["en"] = m.group(2).strip()
                entry["fortune"]["ko"] = m.group(3).strip()
                mode = "title"; continue

        if mode == "title":
            m = re.match(r'^\*\*Title:\*\*\s*(.+?)\s*[-—]\s*(.+?)\s*[-—]\s*(.+)$', s)
            if m:
                entry["title"]["ja"] = m.group(1).strip()
                entry["title"]["en"] = m.group(2).strip()
                entry["title"]["ko"] = m.group(3).strip()
                mode = "ability"; continue

        if mode == "ability":
            m = re.match(r'^\*\*Ability:\*\*\s*(.+?)\s*[-—]\s*(.+?)\s*[-—]\s*(.+)$', s)
            if m:
                entry["ability"]["ja"] = m.group(1).strip()
                entry["ability"]["en"] = m.group(2).strip()
                entry["ability"]["ko"] = m.group(3).strip()
                mode = "poem_start"; continue

        if mode == "poem_start":
            if s == '```': mode = "poem"; poem_lang = None; continue

        if mode == "poem":
            if s == '```': mode = "categories"; poem_lang = None; continue
            if not s:
                poem_lang = None  # reset on blank line to detect next stanza language
                continue
            if poem_lang is None:
                if re.search(r'[a-zA-Z]{3,}', s): poem_lang = 'en'
                elif re.search(r'[가-힣]', s): poem_lang = 'ko'
                else: poem_lang = 'ja'
            if poem_lang == 'ja': pj.append(s)
            elif poem_lang == 'en': pe.append(s)
            elif poem_lang == 'ko': pk.append(s)
            continue

        if mode == "categories":
            if s.startswith('|') and '|' in s[1:]:
                c = [x.strip() for x in s.split('|')[1:-1]]
                if len(c) == 4 and c[0] not in ('구분', '---', ''):
                    cat_rows.append({"label": c[0], "ja": c[1], "en": c[2], "ko": c[3]})
            elif re.match(r'^\*\*ZUN', s):
                mode = "comment"; cmode = None; continue

        if mode == "comment":
            mj = re.match(r'^-\s*JP:\s*(.*)$', s)
            me = re.match(r'^-\s*EN:\s*(.*)$', s)
            mk = re.match(r'^-\s*KR:\s*(.*)$', s)
            if mj: cmode = 'jp'; cj.append(mj.group(1))
            elif me: cmode = 'en'; ce.append(me.group(1))
            elif mk: cmode = 'kr'; ck.append(mk.group(1))
            elif cmode == 'jp' and s and not s.startswith('#'): cj.append(s)
            elif cmode == 'en' and s and not s.startswith('#'): ce.append(s)
            elif cmode == 'kr' and s and not s.startswith('#'): ck.append(s)

    def _join_stanzas(lines_list, lang):
        paragraphs, cur = [], []
        for ln in lines_list:
            t = ln.strip()
            if not t:
                if cur:
                    sep = ' ' if lang == 'en' else ''
                    paragraphs.append(sep.join(cur)); cur = []
            else:
                cur.append(t)
        if cur:
            sep = ' ' if lang == 'en' else ''
            paragraphs.append(sep.join(cur))
        result = '\n\n'.join(paragraphs)
        result = re.sub(r'([.,!?;])(?=[^\s.,!?;])', r'\1 ', result)
        return result

    def _fix_ko_spacing(text):
        text = re.sub(r'(다고)(?=[가-힣])', r'\1 ', text)
        text = re.sub(r'(다니)(?=[가-힣])', r'\1 ', text)
        text = re.sub(r'(거야)(?=[가-힣])', r'\1 ', text)
        text = re.sub(r'(거예요)(?=[가-힣])', r'\1 ', text)
        text = re.sub(r'(기때문)', r'기 때문', text)
        text = re.sub(r'(지않)', r'지 않', text)
        return text

    entry["poem"]["ja"] = _join_stanzas(pj, 'ja')
    entry["poem"]["en"] = _join_stanzas(pe, 'en')
    entry["poem"]["ko"] = _fix_ko_spacing(_join_stanzas(pk, 'ko'))
    entry["categories"] = cat_rows
    entry["comment"]["ja"] = ' '.join(cj).strip()
    entry["comment"]["en"] = ' '.join(ce).strip()
    entry["comment"]["ko"] = ' '.join(ck).strip()
    entry["image"] = slugify(entry["character"]["en"])
    return entry


IMG_SPECIAL = {
    "hong_meiling": "hong_meiring", "reisen_udongein_inaba": "reisen_udongein_inaba",
    "fujiwara_no_mokou": "huziwara_no_mokou", "aya_shameimaru": "shameimaru_aya",
    "komachi_onozuka": "onozuka_komachi", "shizuha_aki": "aki_sizuha",
    "minoriko_aki": "aki_minoriko", "hina_kagiyama": "kagiyama_hina",
    "nitori_kawashiro": "kawasiro_nitori", "momiji_inubashiri": "inubasiri_momizi",
    "sanae_kochiya": "kochiya_sanae", "kanako_yasaka": "yasaka_kanako",
    "suwako_moriya": "moriya_suwako", "iku_nagae": "nagae_iku",
    "tenshi_hinanawi": "hinanawi_tenshi", "yamame_kurodani": "kurodani_yamame",
    "parsee_mizuhashi": "mizuhashi_parsee", "yuugi_hoshiguma": "hoshiguma_yugi",
    "rin_kaenbyou": "kaenbyou_rin", "utsuho_reiuji": "reiuzi_utsuho",
    "kogasa_tatara": "tatara_kogasa", "ichirin_kumoi": "kumoi_ichirin",
    "minamitsu_murasa": "captain_murasa_minamitsu", "shou_toramaru": "toramaru_syou",
    "byakuren_hijiri": "hiziri_byakuren", "nue_houjuu": "houjuu_nue",
    "suika_ibuki": "ibuki_suika", "hatate_himekaidou": "himekaidou_hatate",
    "kyouko_kasodani": "kasodani_kyouko", "yoshika_miyako": "miyako_yoshika",
    "seiga_kaku": "kaku_seiga", "soga_no_tojiko": "soga_no_toziko",
    "mononobe_no_futo": "mononobe_no_futo", "mamizou_futatsuiwa": "hutatsuiwa_mamizou",
    "hata_no_kokoro": "hatano_kokoro", "kagerou_imaizumi": "imaizumi_kagerou",
    "benben_tsukumo": "tsukumo_benben", "yatsuhashi_tsukumo": "tsukumo_yatsuhashi",
    "seija_kijin": "kijin_seija", "shinmyoumaru_sukuna": "sukuna_shinmyoumaru",
    "raiko_horikawa": "horikawa_raiko", "sumireko_usami": "usami_sumireko",
    "sagume_kishin": "kisin_sagume", "hecatia_lapislazuli": "hecatia_lapislazuli",
    "joon_yorigami": "yorigami_jyoon", "shion_yorigami": "yorigami_shion",
    "nemuno_sakata": "sakata_nemuno", "aunn_komano": "komano_aun",
    "narumi_yatadera": "yatadera_narumi", "mai_teireida": "teireida_mai",
    "satono_nishida": "nishida_satono", "okina_matara": "matara_okina",
    "eika_ebisu": "ebisu_eika", "urumi_ushizaki": "ushizaki_urumi",
    "kutaka_niwatari": "niwatari_kutaka", "yachie_kicchou": "kitcho_yachie",
    "mayumi_joutouguu": "joutougu_mayumi", "keiki_haniyasushin": "haniyasushin_keiki",
    "saki_kurokoma": "kurokoma_saki", "yuuma_toutetsu": "yuuma_toutetsu",
    "mike_goutokuji": "goutokuzi_mike", "takane_yamashiro": "yamashiro_takane",
    "sannyo_komakusa": "komakusa_sannyo", "misumaru_tamatsukuri": "tamatsukuri_misumaru",
    "tsukasa_kudamaki": "kudamaki_tsukasa", "megumu_iizunamaru": "iizunamaru_megumu",
    "chimata_tenkyuu": "tenkyu_chimata", "momoyo_himemushi": "himemushi_momoyo",
    "son_biten": "son_biten", "enoko_mitsugashira": "mitsugashira_enoko",
    "chiyari_tenkajin": "tenkajin_chiyari", "hisami_yomotsu": "yomotsu_hisami",
    "zanmu_nippaku": "nippaku_zanmu", "watatsuki_no_toyohime": "watatsuki_toyohime",
    "hieda_no_akyuu": "hieda_no_akyuu", "miyoi_okunoda": "miyoi_okunoda",
    "mizuchi_miyadeguchi": "mizuchi_miyadeguchi", "rinnosuke_morichika": "rinnosuke_morichika",
    "eirin_yagokoro": "yagokoro_eirin", "kaguya_houraisan": "houraisan_kaguya",
    "tewi_inaba": "inaba_tewi", "wriggle_nightbug": "wriggle_nightbug",
    "mystia_lorelei": "mystia_lorelei", "medicine_melancholy": "medicine_melancholy",
    "yuuka_kazami": "kazami_yuuka", "clownpiece": "clownpiece", "junko": "junko",
    "seiran": "seiran", "ringo": "ringo", "sunny_milk": "sunny_milk",
    "luna_child": "luna_child", "star_sapphire": "star_sapphire", "kisume": "kisume",
    "nazrin": "nazrin", "wakasagihime": "wakasagihime", "sekibanki": "sekibanki",
    "eiki_shiki": "shiki_eiki_yamaxanadu", "keine_kamishirasawa": "kamishirasawa_keine",
    "kasen_ibaraki": "ibaraki_kasen",
    "sakuya_izayoi": "izayoi_sakuya", "youmu_konpaku": "konpaku_youmu",
    "yuyuko_saigyouji": "saigyouji_yuyuko", "ran_yakumo": "yakumo_ran",
    "yukari_yakumo": "yakumo_yukari", "eiki_shiki": "shiki_eiki_yamaxanadu",
    "satori_komeiji": "komeiji_satori", "koishi_komeiji": "komeiji_koishi",
    "hakurei_reimu": "hakurei_reimu", "kirisame_marisa": "kirisame_marisa",
    "ichirin_kumoi_unzan": "kumoi_ichirin",
    "eiki_shiki_yamaxanadu": "shiki_eiki_yamaxanadu",
    "marisa_kirisame": "kirisame_marisa", "reimu_hakurei": "hakurei_reimu",
}


def find_image(slug: str, twiki_files: set) -> str:
    direct = f"{slug}.webp"
    if direct in twiki_files: return direct
    mapped = IMG_SPECIAL.get(slug)
    if mapped and f"{mapped}.webp" in twiki_files: return f"{mapped}.webp"
    return direct  # fallback


def main():
    with open(MARKDOWN_PATH, encoding='utf-8') as f:
        lines = f.readlines()

    twiki_files = set()
    if os.path.isdir(TWIKI_TH_DIR):
        for root, dirs, files in os.walk(TWIKI_TH_DIR):
            for f in files:
                if f.endswith('.webp'): twiki_files.add(f)

    print(f"twiki th* webp: {len(twiki_files)}")
    entries = parse_entries(lines)
    entries.sort(key=lambda e: e["number"])

    matched = 0
    for e in entries:
        found = find_image(e["image"], twiki_files)
        e["image"] = found
        if found in twiki_files: matched += 1

    print(f"Parsed: {len(entries)}, images matched: {matched}/{len(entries)}")

    missing = set(range(1, 129)) - {e["number"] for e in entries}
    if missing: print(f"WARNING missing numbers: {sorted(missing)}")

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)
    print(f"Output: {OUTPUT_PATH} ({os.path.getsize(OUTPUT_PATH)/1024:.1f} KB)")

    # Report image copy needs
    tdir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "shared/assets/characters")
    existing = set(os.listdir(tdir)) if os.path.isdir(tdir) else set()
    needed = [(e["image"], e["number"], e["character"]["en"])
              for e in entries if e["image"] not in existing and e["image"] in twiki_files]
    print(f"\nImages to copy from twiki: {len(needed)}")
    for img, n, name in needed:
        print(f"  #{n:3d} {name:30s} -> {img}")

    return entries, needed


if __name__ == '__main__':
    entries, needed = main()
    sys.exit(0)
