# touhou-vote-chart

동방 인기투표 순위 추이 차트.

캐릭터를 선택하면 23년도 / 24년도 / 현재 순위 변화를 Plotly 꺾은선 그래프로 시각화하고,
요약 테이블을 PNG로 저장할 수 있습니다.

## 기술
- Plotly (CDN — 별도 npm 패키지 없음)
- html2canvas (스크린샷)
- 데이터: `src/data.ts` (221개 캐릭터, 자체 포함)
