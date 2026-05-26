# tvirus

**Touhou 인터랙티브 앱 모음** — Team SKT의 동방 기반 장난감/실험.

Vite + React multi-page 정적 사이트. 각 앱은 독립 entry point.

## 빠른 시작

```bash
cd ~/git/tvirus
pnpm install
pnpm dev                      # 메인 갤러리 + 모든 앱 dev 서버
pnpm build                    # 정적 빌드 (dist/)
```

## 앱 목록 (계획)

- `cirno-donation` — 치르노 기부 인터랙티브
- `danmaku-dodge` — 탄막 회피 미니게임
- `gacha-game` — 캐릭터 가챠
- `shisensho` — 사천성
- `character-tool` — 캐릭터 캔버스/도구
- `replay-scoreboard` — 리플레이 스코어보드

## 구조

```
tvirus/
├── apps/                # 각 앱 entry point + src/
├── shared/              # 공통 에셋 / 컴포넌트 / 데이터
├── vite.config.ts       # multi-page mode
└── .github/workflows/   # GitHub Pages 배포
```

## 운영 가이드

- 운영 매뉴얼은 [`CLAUDE.md`](./CLAUDE.md) 참조
- 위키 콘텐츠(스토리, 대사, 스펠카드 설명)는 [`t-skt/twiki`](https://github.com/t-skt/twiki)에 있음
- tdata에 의존성 추가 금지. 필요한 메타는 `shared/data/`에 스냅샷.

## 라이선스

이미지: ZUN/Team Shanghai Alice. 자세한 사항은 [twiki LICENSE-IMAGES.md](https://github.com/t-skt/twiki/blob/main/LICENSE-IMAGES.md) 참조.

## 관련 레포

- 위키: [t-skt/twiki](https://github.com/t-skt/twiki)
- 데이터 소스: [t-skt/tdata](https://github.com/t-skt/tdata)
