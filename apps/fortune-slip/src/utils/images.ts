/**
 * Character image loader using Vite's import.meta.glob.
 * Collects all webp from shared/assets/characters/ at build time.
 */

// Glob MUST be a static string literal for Vite to analyze it
const modules = import.meta.glob(
  "../../../../shared/assets/characters/*.webp",
  { eager: true, query: "?url", import: "default" }
);

const imageMap: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const filename = path.split("/").pop()!;
  imageMap[filename] = url as string;
}

/**
 * Get the URL for a character image by filename.
 * Falls back to the dot image if webp not found in the glob.
 * @param filename e.g. "rumia.webp"
 */
export function getCharacterImageUrl(filename: string): string | undefined {
  return imageMap[filename];
}

/** Check if a webp image is available */
export function hasWebpImage(filename: string): boolean {
  return filename in imageMap;
}
