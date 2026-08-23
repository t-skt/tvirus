# introduce

동방 트친소(트위터 친구 소개) 카드 메이커. 15가지 컨셉 × 6테마 × 3언어(KO/JP/EN)로 카드 생성 후 PNG 다운로드.

원래 [wealthygogi/introduce](https://github.com/wealthygogi/introduce) 단독 레포였으나 tvirus로 편입.

## 컨셉
A. RPG 상태창 · B. 스펠카드 · C. 타이틀 · D. 대화창 · E. 설정화면 · F. 분분마루 · G. 오미쿠지 · H. 영원정 처방전 · I. 코미케 · J. PC-98 · K. 요괴도감 · L. 마도서 · M. 연회장 · N. 메신저 · O. TCG

## 기술
- React Router SPA (`basename: /tvirus/apps/introduce/`)
- modern-screenshot (SVG foreignObject → PNG, 웹폰트 base64 임베드)
- 스프라이트: `public/introduce-sprites/` (Majstek 16×16 Mini Pack)
- GitHub Pages SPA 폴백: `404.html` → `/apps/introduce/` redirect
