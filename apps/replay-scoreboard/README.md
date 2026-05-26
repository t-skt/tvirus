# 리플레이 점수판

동방 리플레이 파일(.rpy)을 파싱해 점수표를 생성하고 이미지로 저장하는 도구.

- th6~th18, th20 지원
- 드래그&드롭 / 클릭으로 여러 파일 업로드
- 게임·점수·캐릭터·난이도·스테이지·날짜·슬로우율 정렬
- html2canvas로 점수표 PNG 저장

## 출처

`touhouwiki-kr/src/components/ReplayScoreboard/` → tvirus M9 이전.
Docusaurus 의존(`@docusaurus/*`, `@theme/*`, CSS 변수) 제거.
html2canvas는 이 앱 내부에서만 import (shared/에 차단 룰 작동).
