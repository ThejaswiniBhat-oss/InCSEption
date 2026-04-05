import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './FluidBlob.module.css';

/**
 * FluidBlob — metallic morphing sphere, inspired by monopo.vn.
 * Uses GSAP to animate border-radius between organic states and
 * independently moves the specular highlight for a 3-D liquid-metal feel.
 * Respects prefers-reduced-motion.
 */

const MORPH_STATES = [
  '44% 56% 65% 35% / 47% 58% 42% 53%',
  '67% 33% 42% 58% / 56% 38% 62% 44%',
  '38% 62% 55% 45% / 35% 65% 36% 65%',
  '60% 40% 32% 68% / 58% 44% 56% 42%',
  '52% 48% 60% 40% / 46% 56% 44% 54%',
  '35% 65% 48% 52% / 62% 40% 60% 38%',
];

export default function FluidBlob() {
  const wrapRef      = useRef<HTMLDivElement>(null);
  const blobRef      = useRef<HTMLDivElement>(null);
  const glowRef      = useRef<HTMLDivElement>(null);
  const specRef      = useRef<HTMLDivElement>(null);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reducedMotion || !blobRef.current) return;

    const ctx = gsap.context(() => {
      // ── Morph shape ────────────────────────────────────────────────────────
      const morphTl = gsap.timeline({ repeat: -1 });
      MORPH_STATES.forEach(state => {
        morphTl.to(blobRef.current, {
          borderRadius: state,
          duration: gsap.utils.random(7, 10),
          ease: 'sine.inOut',
        });
      });
      morphTl.to(blobRef.current, {
        borderRadius: MORPH_STATES[0],
        duration: 8,
        ease: 'sine.inOut',
      });

      // ── Gentle breathing scale ─────────────────────────────────────────────
      gsap.to(blobRef.current, {
        scale: 1.035,
        duration: 7,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      // ── Specular highlight drifts independently ────────────────────────────
      gsap.to(specRef.current, {
        x: 28,
        y: -20,
        duration: 9,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      gsap.to(specRef.current, {
        x: -12,
        duration: 13,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 4,
      });

      // ── Outer glow pulse ───────────────────────────────────────────────────
      gsap.to(glowRef.current, {
        opacity: 0.55,
        duration: 6,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      // ── Whole blob slow drift ──────────────────────────────────────────────
      gsap.to(wrapRef.current, {
        y: -18,
        duration: 11,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    }, wrapRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div className={styles.outer} aria-hidden="true">
      <div ref={wrapRef} className={styles.wrap}>
        {/* Outer diffuse glow */}
        <div ref={glowRef} className={styles.outerGlow} />

        {/* Main morphing sphere */}
        <div ref={blobRef} className={styles.blob}>
          {/* Base metallic gradient rendered via CSS */}

          {/* Specular highlight — bright spot simulating light source */}
          <div ref={specRef} className={styles.specular} />

          {/* Secondary highlight — rim catch light */}
          <div className={styles.rimLight} />

          {/* Shadow zone opposite to light source */}
          <div className={styles.shadow} />

          {/* Olive/green colour undertone (as on monopo.vn) */}
          <div className={styles.tint} />
        </div>
      </div>
    </div>
  );
}
