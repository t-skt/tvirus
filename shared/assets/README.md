# shared/assets

Source of truth: `~/git/twiki/static/img/`

## 정책
- 단방향 sync: twiki → tvirus/shared/assets/ (복사)
- 추가 시 명시적 commit (자동 sync 금지)
- 무거운 라이브러리/sprite는 사용 앱의 의존성으로 (shared/는 가볍게)

## 구성
- `dot/` — 140 캐릭터 도트 sprite. CirnoDonation, DanmakuDodge, Shisensho 3개 앱에서 사용.
- `characters/` — 캐릭터 일러스트 (사용 빈도 추정 11~30개).
- `toy/` — touhouwiki-kr에서 이전된 장난감 전용 자산 (twiki M1에서 이동).
- `icons/` — 공통 UI 아이콘 (있다면).
