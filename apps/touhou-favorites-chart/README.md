# touhou-favorites-chart

동방프로젝트 최애표. 캐릭터 / OST / 작품 최애를 골라서 시즌 테마 카드 PNG + JSON/CSV로 저장.

## 기능

- 시즌 프리셋 4종 (봄/여름/가을/겨울)
- 캐릭터 4개, OST 3개, 작품 3개까지 선택
- 캐릭터 #1 portrait (이미지 후보 + 1:1 crop + zoom + 코멘트), localStorage 보존
- PNG 1280×720 (3x scale) html2canvas 캡처
- JSON / CSV 내보내기

## 데이터

- `public/data/touhou_normalized_v2.json` — 정규화된 동방 작품/캐릭터/OST 데이터 (touhouwiki-kr 추출)
- `public/data/touhou_character_images_index.json` — 캐릭터 ID → 이미지 후보 인덱스 (webp)
- `public/img/th{NN}/{character_id}.webp` — 캐릭터 이미지 (252개, ≈21MB)

## 기술

- React 19
- html2canvas (캡처)
- 250+ 캐릭터, 800+ OST, 71+ 작품

## 경로

`/tvirus/apps/touhou-favorites-chart/`
