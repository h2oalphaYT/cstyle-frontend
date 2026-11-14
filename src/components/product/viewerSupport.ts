/**
 * Whether to offer the 3D garment viewer: needs WebGL and a reasonably capable device
 * (desktop, or a phone with 4+ cores / 4GB+ memory), and no data-saver mode.
 * Cheap to call — it does not load three.js.
 */
export const supports3D = (): boolean => {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if ((nav.hardwareConcurrency || 0) < 4) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
};
