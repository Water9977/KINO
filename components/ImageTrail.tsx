'use client';

import { gsap } from 'gsap';
import { useEffect, useRef, type JSX } from 'react';
import './ImageTrail.css';

/** Pointer travel (px) required before the next poster is revealed. */
const DISTANCE_THRESHOLD = 80;

function lerp(a: number, b: number, n: number): number {
  return (1 - n) * a + n * b;
}

function getPointerPos(e: MouseEvent | TouchEvent, rect: DOMRect): { x: number; y: number } {
  if ('touches' in e && e.touches.length > 0) {
    return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
  }
  if ('clientX' in e) {
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  return { x: 0, y: 0 };
}

interface TrailImage {
  el: HTMLDivElement;
  inner: HTMLDivElement | null;
  rect: DOMRect;
}

/**
 * Cursor-following poster trail.
 *
 * Everything this class creates — the animation frame, the document pointer
 * listeners, the resize listener and any in-flight GSAP tweens — is torn down
 * by `destroy()`. Previously none of it was: the render loop recursed through
 * requestAnimationFrame forever with no stored frame id and no effect cleanup,
 * so it survived unmount and doubled up under React Strict Mode.
 */
class ImageTrail {
  private container: HTMLDivElement;
  private images: TrailImage[];
  private imgPosition = 0;
  private zIndexVal = 1;
  private threshold = DISTANCE_THRESHOLD;
  private mousePos = { x: 0, y: 0 };
  private lastMousePos = { x: 0, y: 0 };
  private cacheMousePos = { x: 0, y: 0 };
  private frameId: number | null = null;
  private started = false;
  private destroyed = false;

  constructor(container: HTMLDivElement) {
    this.container = container;
    this.images = [...container.querySelectorAll<HTMLDivElement>('.content__img')].map((el) => ({
      el,
      inner: el.querySelector<HTMLDivElement>('.content__img-inner'),
      rect: el.getBoundingClientRect(),
    }));

    document.addEventListener('mousemove', this.handlePointerMove, { passive: true });
    document.addEventListener('touchmove', this.handlePointerMove, { passive: true });
    window.addEventListener('resize', this.handleResize);
  }

  /** One shared resize listener for all images, instead of one per image. */
  private handleResize = () => {
    for (const image of this.images) {
      gsap.set(image.el, { scale: 1, x: 0, y: 0, opacity: 0 });
      image.rect = image.el.getBoundingClientRect();
    }
  };

  private handlePointerMove = (ev: MouseEvent | TouchEvent) => {
    const rect = this.container.getBoundingClientRect();
    this.mousePos = getPointerPos(ev, rect);

    // Start the loop on first movement so an idle page costs nothing.
    if (!this.started) {
      this.started = true;
      this.cacheMousePos = { ...this.mousePos };
      this.lastMousePos = { ...this.mousePos };
      this.frameId = requestAnimationFrame(this.render);
    }
  };

  private render = () => {
    if (this.destroyed) return;

    const dx = this.mousePos.x - this.lastMousePos.x;
    const dy = this.mousePos.y - this.lastMousePos.y;

    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);

    if (Math.hypot(dx, dy) > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }

    this.frameId = requestAnimationFrame(this.render);
  };

  private showNextImage() {
    // Keep z-index bounded rather than incrementing forever.
    this.zIndexVal = (this.zIndexVal % this.images.length) + 1;
    this.imgPosition = (this.imgPosition + 1) % this.images.length;

    const img = this.images[this.imgPosition];
    if (!img) return;

    gsap.killTweensOf(img.el);
    gsap
      .timeline()
      .fromTo(
        img.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2,
        },
        {
          duration: 0.4,
          ease: 'power1',
          scale: 1,
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2,
        },
        0
      )
      .fromTo(
        img.inner,
        { scale: 2.8, filter: 'brightness(250%)' },
        { duration: 0.4, ease: 'power1', scale: 1, filter: 'brightness(100%)' },
        0
      )
      .to(img.el, { duration: 0.4, ease: 'power2', opacity: 0, scale: 0.2 }, 0.45);
  }

  destroy() {
    this.destroyed = true;
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    document.removeEventListener('mousemove', this.handlePointerMove);
    document.removeEventListener('touchmove', this.handlePointerMove);
    window.removeEventListener('resize', this.handleResize);
    for (const image of this.images) gsap.killTweensOf(image.el);
  }
}

interface ImageTrailProps {
  items?: readonly string[];
}

export default function ImageTrailComponent({ items = [] }: ImageTrailProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const trail = new ImageTrail(containerRef.current);
    return () => trail.destroy();
  }, [items]);

  return (
    <div
      ref={containerRef}
      className="content"
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none' }}
    >
      {items.map((url) => (
        <div className="content__img" key={url}>
          <div className="content__img-inner" style={{ backgroundImage: `url(${url})` }} />
        </div>
      ))}
    </div>
  );
}
