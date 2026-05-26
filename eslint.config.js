import tseslint from 'typescript-eslint';

export default tseslint.config(
  tseslint.configs.base,
  {
    files: ['apps/**/*.{ts,tsx}', 'shared/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@docusaurus/*'], message: 'tvirus does not use Docusaurus. Use @shared/utils/baseUrl instead of useBaseUrl.' },
            { group: ['@site/*'], message: 'No Docusaurus aliases. Use @shared/* instead.' },
          ],
        },
      ],
    },
  },
  {
    files: ['shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'html2canvas', message: 'shared/ 무거운 라이브러리 금지 — 사용 앱에서만 import.' },
            { name: 'react-image-crop', message: 'shared/ 무거운 라이브러리 금지 — 사용 앱에서만 import.' },
            { name: '@docusaurus/core', message: 'tvirus does not use Docusaurus.' },
          ],
          patterns: [
            { group: ['@docusaurus/*'], message: 'tvirus does not use Docusaurus.' },
            { group: ['three', 'three/*'], message: 'shared/ 무거운 라이브러리 금지.' },
            { group: ['@react-three/*'], message: 'shared/ 무거운 라이브러리 금지.' },
          ],
        },
      ],
    },
  },
);
