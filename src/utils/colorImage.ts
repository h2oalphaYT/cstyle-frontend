import type { Product } from '../api';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Best image for a colour. Products don't store an image per colour, so this uses, in order:
 *  1. an image whose file name contains the colour name (e.g. "...-navy-1.webp"),
 *  2. the first image for the first colour, and for other colours the extra images at the end
 *     of the gallery (the seeded catalogue keeps a "second colour" shot last),
 *  3. otherwise the main image.
 */
export const imageIndexForColor = (product: Pick<Product, 'images' | 'colors'>, colorName: string): number => {
  const images = product.images || [];
  if (!images.length || !colorName) return 0;
  const key = slug(colorName);
  const byName = images.findIndex(src => slug(decodeURIComponent(src.split('/').pop() || '')).includes(key));
  if (byName >= 0) return byName;
  const colorIndex = product.colors.findIndex(c => c.name.toLowerCase() === colorName.toLowerCase());
  if (colorIndex <= 0) return 0;
  // Extra colours map onto the tail of the gallery: images beyond the first three views.
  const extra = images.length - 3;
  if (extra <= 0) return 0;
  return colorIndex <= extra ? 3 + colorIndex - 1 : 0;
};
