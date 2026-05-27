import { baseUrl } from '@shared/utils/baseUrl';

export function getImagePath(gameId: string, imageName: string): string {
  return baseUrl(`img/${gameId}/${imageName}`);
}
