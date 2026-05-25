/**
 * Vite의 import.meta.env.BASE_URL을 활용한 베이스 URL 헬퍼.
 * useBaseUrl (Docusaurus) 대체용.
 *
 * 사용 예:
 *   baseUrl('img/cirno.png') → '/tvirus/img/cirno.png'
 *   baseUrl('/img/cirno.png') → '/tvirus/img/cirno.png' (slash 정규화)
 */
export function baseUrl(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const cleaned = path.startsWith('/') ? path : '/' + path;
  return base + cleaned;
}
