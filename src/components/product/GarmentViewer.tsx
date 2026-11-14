/**
 * Interactive 3D garment preview (three.js). Lazy-loaded from the product page only, so it
 * never touches the home page or first paint. Drag to rotate; picking a colour swatch
 * recolours the model live. The model is a stylised garment built from the category
 * (shirt / tee / polo vs trousers / shorts), not a scan of the actual product.
 */
import { useEffect, useRef } from 'react';
import {
  AmbientLight, Color, DirectionalLight, ExtrudeGeometry, Group, HemisphereLight, Mesh,
  MeshStandardMaterial, PerspectiveCamera, Scene, Shape, SRGBColorSpace, WebGLRenderer,
  CircleGeometry, MeshBasicMaterial, TorusGeometry,
} from 'three';
import { prefersReducedMotion } from '../../motion';

type Kind = 'top' | 'trousers' | 'shorts';

const kindFor = (category: string): Kind => {
  const c = category.toLowerCase();
  if (c.includes('short')) return 'shorts';
  if (c.includes('trouser') || c.includes('pant') || c.includes('chino')) return 'trousers';
  return 'top';
};

/** Front silhouette of a short-sleeve top, centred on the origin (units ≈ metres / 2). */
const topShape = () => {
  const s = new Shape();
  s.moveTo(-0.18, 0.62);           // left collar
  s.quadraticCurveTo(0, 0.5, 0.18, 0.62); // neckline
  s.lineTo(0.42, 0.55);            // right shoulder
  s.lineTo(0.72, 0.28);            // right sleeve top
  s.lineTo(0.58, 0.12);            // right sleeve end
  s.lineTo(0.4, 0.26);             // right armpit
  s.lineTo(0.4, -0.62);            // right hem
  s.quadraticCurveTo(0, -0.67, -0.4, -0.62);
  s.lineTo(-0.4, 0.26);
  s.lineTo(-0.58, 0.12);
  s.lineTo(-0.72, 0.28);
  s.lineTo(-0.42, 0.55);
  s.closePath();
  return s;
};

const legsShape = (length: number) => {
  const s = new Shape();
  const top = 0.5;
  const bottom = top - length;
  s.moveTo(-0.36, top);
  s.lineTo(0.36, top);
  s.lineTo(0.4, bottom);
  s.lineTo(0.06, bottom);
  s.lineTo(0, top - 0.32);          // crotch
  s.lineTo(-0.06, bottom);
  s.lineTo(-0.4, bottom);
  s.closePath();
  return s;
};

interface Props {
  category: string;
  color: string;
}

const GarmentViewer = ({ category, color }: Props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<MeshStandardMaterial | null>(null);
  const targetColor = useRef(new Color(color));

  // Live recolour: ease the material toward the newly picked swatch colour.
  useEffect(() => {
    targetColor.current = new Color(color);
  }, [color]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    const reduced = prefersReducedMotion();

    const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'pan-y';
    renderer.domElement.setAttribute('aria-hidden', 'true');

    const scene = new Scene();
    const camera = new PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0.05, 4.4);

    scene.add(new HemisphereLight(0xfff6e8, 0x202020, 0.9));
    scene.add(new AmbientLight(0xffffff, 0.25));
    const key = new DirectionalLight(0xffffff, 1.6);
    key.position.set(2, 3, 4);
    scene.add(key);
    const rim = new DirectionalLight(0xc5a880, 1.0);
    rim.position.set(-3, 1, -3);
    scene.add(rim);

    const material = new MeshStandardMaterial({ color: new Color(color), roughness: 0.82, metalness: 0.02 });
    materialRef.current = material;

    const kind = kindFor(category);
    const shape = kind === 'top' ? topShape() : legsShape(kind === 'shorts' ? 0.62 : 1.25);
    const geometry = new ExtrudeGeometry(shape, {
      depth: 0.16, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.05, bevelSegments: 6, curveSegments: 24,
    });
    geometry.center();

    const garment = new Group();
    const body = new Mesh(geometry, material);
    garment.add(body);

    // Collar ring for tops, waistband for bottoms — small details that read well in 3D.
    const trimMaterial = new MeshStandardMaterial({ color: new Color(color).multiplyScalar(0.8), roughness: 0.75 });
    if (kind === 'top') {
      const collar = new Mesh(new TorusGeometry(0.17, 0.03, 12, 48, Math.PI), trimMaterial);
      collar.rotation.z = Math.PI;
      collar.position.set(0, 0.6, 0.02);
      garment.add(collar);
    } else {
      const band = new Mesh(new TorusGeometry(0.37, 0.03, 8, 64), trimMaterial);
      band.scale.set(1, 0.18, 1);
      band.position.set(0, geometry.boundingBox ? geometry.boundingBox.max.y - 0.02 : 0.3, 0);
      garment.add(band);
    }
    if (kind === 'trousers') garment.scale.setScalar(0.85);
    scene.add(garment);

    // Soft floor shadow
    const shadow = new Mesh(new CircleGeometry(0.7, 48), new MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.85;
    shadow.scale.set(1, 0.35, 1);
    scene.add(shadow);

    // ── Drag to rotate (with a little inertia) ──
    let rotY = -0.35;
    let rotX = 0.05;
    let velocity = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      renderer.domElement.setPointerCapture(e.pointerId);
      renderer.domElement.style.cursor = 'grabbing';
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      velocity = dx * 0.01;
      rotY += velocity;
      rotX = Math.max(-0.5, Math.min(0.5, rotX + dy * 0.006));
    };
    const onUp = () => {
      dragging = false;
      renderer.domElement.style.cursor = 'grab';
    };
    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointercancel', onUp);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    io.observe(mount);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      if (!dragging) {
        velocity *= 0.94;
        rotY += velocity + (reduced ? 0 : 0.0035);
      }
      garment.rotation.y = rotY;
      garment.rotation.x = rotX;
      material.color.lerp(targetColor.current, 0.12);
      trimMaterial.color.copy(material.color).multiplyScalar(0.8);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointercancel', onUp);
      scene.traverse(obj => {
        const m = obj as Mesh;
        m.geometry?.dispose();
        const mat = m.material as MeshStandardMaterial | MeshStandardMaterial[] | undefined;
        if (Array.isArray(mat)) mat.forEach(x => x.dispose()); else mat?.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
    // The scene is built once per category; colour changes are handled by targetColor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  return (
    <div className="absolute inset-0">
      <div ref={mountRef} className="absolute inset-0" role="img" aria-label="3D garment preview. Drag to rotate." />
      <p className="absolute bottom-3 inset-x-0 text-center text-[11px] uppercase tracking-[0.2em] text-cs-muted pointer-events-none">
        Drag to rotate · Pick a colour to recolour
      </p>
    </div>
  );
};

export default GarmentViewer;
