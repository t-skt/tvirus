# tvirus — Touhou 인터랙티브 앱 모음 (Public)

## 레포 목적
- 동방 캐릭터/세계관 기반 **장난감 앱** 모음 (cirno-donation, danmaku-dodge, gacha-game, shisensho, character-tool 등).
- 위키와 **분리**된 정체성. 학습 콘텐츠 아님, 데모/실험.

## 절대 금지 사항
- ❌ 위키 콘텐츠(스토리, 대사, 스펠카드 설명 등)를 이 레포에 복사하지 마라. 그건 `twiki`다.
- ❌ tdata에 의존성 추가하지 마라. 필요한 메타는 `shared/data/`에 스냅샷으로 둔다.
- ❌ 앱 간 공유 코드 없이 같은 로직 두 번 짜지 마라 → `shared/`로 추출.

## 새 앱 추가 패턴
```bash
# 1. apps/<kebab-case-name>/ 디렉토리 생성
mkdir -p apps/new-app/src

# 2. index.html, main.tsx 스캐폴딩 (다른 앱 복사)
cp apps/cirno-donation/index.html apps/new-app/index.html
# (제목/스크립트 경로 수정)

# 3. App.tsx 구현. shared/ 적극 활용.

# 4. vite.config.ts의 rollupOptions.input에 추가

# 5. src/apps.ts에 등록: APP_SLUGS에 슬러그 추가 + RECORDS에 category/dot 기록 추가

# 6. 로컬 dev
pnpm dev
```

## 공통 에셋 사용법
- 이미지: `@shared/assets/characters/cirno.webp`
- 동방 데이터셋(v1/v2 touhou_normalized*.json): `import { parseDataset, loadTouhouDataset, type Character, type Work, type TouhouDataset } from '@shared/data/touhou'`
- 훅: `import { useDataset, useLocalStorage } from '@shared/hooks'`
- 효과 컴포넌트(TH06~TH20): `import { EffectRenderer, ALL_EFFECT_IDS, type EffectId } from '@shared/components/effects'`
- 베이스 URL: `import { baseUrl } from '@shared/utils/baseUrl'`

## 빌드/배포 방법
- `pnpm build` → `dist/` 생성 (각 앱 sub-directory에 빌드됨)
- GitHub Actions: main push → build → GitHub Pages (또는 Cloudflare Pages 검토)
- URL 패턴: `t-skt.github.io/tvirus/cirno/`, `/tvirus/danmaku/`, ...

## 의존성 정책
- 각 앱에서 무거운 의존성(pixi.js, three.js, phaser 등) 사용 OK. **다른 앱 번들에 영향 안 줌** (multi-entry 격리).
- 단, `shared/`에는 의존성 최소화.
