"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./comparison-reveal.module.css";

export function ComparisonReveal({ before, after, beforeLabel, afterLabel }) {
  const surface = useRef(null);
  const [revealing, setRevealing] = useState(false);
  const [full, setFull] = useState(false);
  const pointer = useRef(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!pointer.current || !surface.current) return;
      const { x, y } = pointer.current;
      const bounds = surface.current.getBoundingClientRect();
      surface.current.style.setProperty("--reveal-x", `${x - bounds.left}px`);
      surface.current.style.setProperty("--reveal-y", `${y - bounds.top}px`);
      const inside = x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
      setRevealing(inside);
      // Smooth scrolling can move the surface between native scroll events.
      if (inside) frame = requestAnimationFrame(update);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const track = (event) => {
      if (event.pointerType !== "mouse") return;
      pointer.current = { x: event.clientX, y: event.clientY };
      schedule();
    };
    const trackWheel = (event) => {
      // Wheel events carry the cursor position even before its first movement.
      pointer.current = { x: event.clientX, y: event.clientY };
      schedule();
    };
    window.addEventListener("pointermove", track, { passive: true });
    window.addEventListener("wheel", trackWheel, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true, capture: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", track);
      window.removeEventListener("wheel", trackWheel);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const move = (event) => {
    if (event.pointerType !== "mouse") return;
    pointer.current = { x: event.clientX, y: event.clientY };
    const bounds = surface.current.getBoundingClientRect();
    surface.current.style.setProperty("--reveal-x", `${event.clientX - bounds.left}px`);
    surface.current.style.setProperty("--reveal-y", `${event.clientY - bounds.top}px`);
    setRevealing(true);
  };

  return (
    <div className={styles.comparison}>
      <button type="button" className={styles.toggle} aria-pressed={full}
        onClick={() => setFull(!full)}>
        <span>{beforeLabel}</span><span aria-hidden="true">↔</span><span>{afterLabel}</span>
      </button>
      <div ref={surface} className={styles.surface} data-revealing={revealing} data-full={full}
        onPointerEnter={move} onPointerMove={move} onPointerLeave={() => setRevealing(false)}
        onClick={(event) => {
          if (event.target.closest("[data-edit-id]") && event.defaultPrevented) return;
          if (window.matchMedia("(hover: none)").matches) setFull(!full);
        }}>
        <div className={styles.layer} aria-hidden={full}>
          {before.map((text, i) => <div className={styles.line} key={i}>{text}</div>)}
        </div>
        <div className={`${styles.layer} ${styles.after}`} aria-hidden={!full}>
          {after.map((text, i) => <div className={styles.line} key={i}>
            <Image className={styles.logo} src="/assets/clover.svg" width={24} height={24} alt="" />
            {text}
          </div>)}
        </div>
      <div className={`${styles.decorations} ${styles.after}`} aria-hidden="true">
        <Image className={styles.clover} src="/assets/clover.svg" width={64} height={64} alt="" />
        <svg className={styles.smile} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="40" cy="40" r="32" />
          <path d="M28 30v3M51 30v3M25 45c6 15 24 15 30 0" />
        </svg>
        <svg className={styles.heart} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M24 40S5 29 5 16a10 10 0 0 1 19-4 10 10 0 0 1 19 4c0 13-19 24-19 24Z" />
        </svg>
      </div>
      </div>
    </div>
  );
}
