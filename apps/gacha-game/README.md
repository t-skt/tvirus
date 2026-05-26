# 동방 가챠

동방 프로젝트 게임/캐릭터 랜덤 뽑기 앱.

## 기능

- **게임 모드**: 동방 프로젝트 게임 중 랜덤으로 하나를 뽑습니다.
- **캐릭터 모드**: 전체 또는 특정 작품 범위 내에서 캐릭터를 뽑습니다.
  - 풀(캐릭터 균등): 전체 캐릭터 풀에서 균등 확률로 뽑기
  - 작품 균등: 먼저 작품을 랜덤 선택 후 해당 작품 캐릭터 중 뽑기

## 데이터 소스

`public/data/touhou_normalized.json` — touhouwiki-kr에서 추출한 정규화 데이터.

## 이전 경로

`touhouwiki-kr/src/components/GachaGame/` → `apps/gacha-game/`

Docusaurus 의존(`useBaseUrl`, `@docusaurus/*`) 제거 후 `@shared/utils/baseUrl`로 대체.
