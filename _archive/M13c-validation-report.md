# tvirus M13c 검증 보고서

생성: 2026-05-27

## 빌드
- lint: PASS (exit 0)
- typecheck: PASS (exit 0)
- build: PASS (exit 0)
- dist 사이즈: 33M

## 9개 앱 dist 산출물
OK cirno-donation
OK gacha-game
OK danmaku-dodge
OK replay-scoreboard
OK touhou-vote-chart
OK introduce-form
OK character-tool
OK shisensho
OK touhou-favorites-chart
총 9/9 PASS

## F13 (shared/ 무거운 라이브러리 차단)
PASS — shared/ clean (html2canvas, react-image-crop, three, @react-three 0건)

## AC-V14 (결정성 soft warning)
AC-V14 결정성 warning: 0 lines (soft policy) — 완전 결정성 빌드 확인

## F11 (character-meta.json 사용처)
- apps/ shared/ src/ 전체 참조 0건 → dead asset 확인
- shared/data/character-meta.json git rm 완료

## agent-browser 9 앱 smoke
cirno-donation root=1 errs=0 PASS
gacha-game root=1 errs=0 PASS
danmaku-dodge root=1 errs=0 PASS
replay-scoreboard root=1 errs=0 PASS
touhou-vote-chart root=1 errs=0 PASS
introduce-form root=1 errs=0 PASS
character-tool root=1 errs=0 PASS
shisensho root=1 errs=0 PASS
touhou-favorites-chart root=1 errs=0 PASS
gallery cards=9 PASS

## 번들 상세 (dist/assets/)
- html2canvas-yA1QDkVT.js: 199.56 kB (gzip: 46.78 kB)
- jsx-runtime-DSs3Rrld.js: 190.84 kB (gzip: 60.19 kB)
- introduce-form-CfduElBe.js: 42.53 kB
- touhou-favorites-chart-ETiadoml.js: 38.32 kB
- character-tool-BbXmQtjm.js: 33.57 kB
- touhou-vote-chart-BSv_BoiN.js: 31.01 kB
- shisensho-CypxL2Go.js: 24.62 kB
- cirno-donation-Qk4icFWv.js: 21.98 kB
- replay-scoreboard-CQpcefT3.js: 19.13 kB
- gacha-game-CSjOtALn.js: 17.93 kB
- danmaku-dodge-CxWh2w4m.js: 16.62 kB

## Acceptance Criteria 결과
| # | 조건 | 결과 |
|---|------|------|
| M13c.1 | 9개 앱 모두 200 (로컬 smoke 대체) | PASS |
| M13c.2 | 9개 앱 agent-browser smoke 통과 (F4/D6) | PASS (9/9 root=1 errs=0) |
| M13c.3 | build 0 errors | PASS |
| M13c.4 | character-meta 사용처 결정 (F11) | PASS (dead → git rm) |
| M13c.5 | 결정성 soft warning 기록 (D8) | PASS (0 warnings — fully deterministic) |

## 결론
M13c 모든 AC 통과. 9개 앱 전수 smoke root mount + console error 0 확인.
shared/ 무거운 라이브러리 완전 차단. 빌드 완전 결정성. dead asset 제거 완료.
