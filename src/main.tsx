import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>tvirus</h1>
      <p>동방 장난감 갤러리 — Phase 2 M1 placeholder</p>
      <p>각 앱은 <code>/tvirus/apps/&lt;slug&gt;/</code> 에 배포됨 (M5에서 갤러리 작성).</p>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
