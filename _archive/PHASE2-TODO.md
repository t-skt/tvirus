# Phase 2 — tvirus Vite + React 스캐폴딩

> Phase 1 (레포 부트스트랩) 완료 후 다음 작업.

## 사전 조건
- `~/git/touhouwiki-kr/` 에 장난감 컴포넌트 원본 존재
  - `src/components/CirnoDonation/` (788 lines)
  - `src/components/DanmakuDodge/` (1263 lines)
  - `src/components/GachaGame/`, `Shisensho/`, `CharacterTool/`, `ReplayScoreboard/`, 등

## 작업 목록

### A. Vite + React 스캐폴딩
- [ ] `pnpm create vite@latest . --template react-ts` (현재 빈 디렉토리에서)
- [ ] `vite.config.ts` multi-page mode 작성:
  ```ts
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import { resolve } from 'path';

  export default defineConfig({
    plugins: [react()],
    base: '/tvirus/',
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          cirno: resolve(__dirname, 'apps/cirno-donation/index.html'),
          // ... 추가 앱 등록
        },
      },
    },
    resolve: { alias: { '@shared': resolve(__dirname, 'shared') } },
  });
  ```
- [ ] `tsconfig.json` paths에 `"@shared/*": ["./shared/*"]` 추가

### B. 첫 앱: cirno-donation 이전
- [ ] `apps/cirno-donation/index.html` 작성
- [ ] `apps/cirno-donation/src/main.tsx` (React entry)
- [ ] `cp ~/git/touhouwiki-kr/src/components/CirnoDonation/index.tsx apps/cirno-donation/src/App.tsx`
- [ ] CirnoDonation 내부 의존성 정리 (Docusaurus import 제거, shared/ 경로 매핑)
- [ ] `apps/cirno-donation/README.md`

### C. 공통 에셋
- [ ] `shared/assets/characters/` — 필요한 캐릭터 이미지 일부 복사 (`~/git/touhouwiki-kr/static/img/characters/`)
- [ ] `shared/components/FrameCounter.tsx` 등 추출 (DanmakuDodge에서 재사용)
- [ ] `shared/data/character-meta.json` (캐릭터 이름/색상만, tdata 축소판)
- [ ] `shared/utils/`, `shared/hooks/` 필요 시 작성

### D. 메인 갤러리
- [ ] `index.html` — 앱 갤러리 (각 앱 카드)
- [ ] `src/main.tsx` 또는 가벼운 React 앱

### E. CI / 배포
- [ ] `.github/workflows/deploy.yml` 작성 (pnpm + Vite build + GitHub Pages)
- [ ] GitHub Pages 설정 (Settings → Pages → Source: GitHub Actions)

### F. 추가 앱 이전 (점진적)
- [ ] `apps/danmaku-dodge/`
- [ ] `apps/gacha-game/`
- [ ] `apps/shisensho/`
- [ ] `apps/character-tool/`
- [ ] `apps/replay-scoreboard/`

## 수용 기준 (Step 3 완료)
- `pnpm dev` → cirno-donation 동작
- `pnpm build` → `dist/` 0 errors
- GitHub Pages에 메인 갤러리 + cirno-donation 배포

## 다음 세션 시작 프롬프트 (참고)
```
PHASE2-TODO.md 의 A-E 순서로 작업해줘.
첫 앱은 cirno-donation. 원본은 ~/git/touhouwiki-kr/src/components/CirnoDonation/.
Docusaurus import는 모두 제거하고 shared/로 대체.
```
