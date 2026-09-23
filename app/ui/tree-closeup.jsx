"use client";

import { useEffect, useRef } from "react";
import styles from "./tree-closeup.module.css";

const frameUrl = index => `/contract-tree/botanical-closeup/frame-${String(index + 1).padStart(3, "0")}.webp`;
const clamp = value => Math.max(0, Math.min(1, value));

export function TreeCloseup() {
  const journey = useRef(null);
  const art = useRef(null);
  const canvas = useRef(null);

  useEffect(() => {
    const root = journey.current;
    const layer = art.current;
    const surface = canvas.current;
    const context = surface.getContext("2d");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const frames = [];
    let loaded = false;
    let disposed = false;
    let request = 0;
    let target = 0;
    let drawn = -1;

    const draw = () => {
      if (disposed || !context) return;
      let index = target;
      while (index >= 0 && !frames[index]?.naturalWidth) index--;
      if (index < 0 || index === drawn) return;
      context.clearRect(0, 0, 1280, 720);
      context.drawImage(frames[index], 0, 0, 1280, 720);
      layer.dataset.ready = "true";
      drawn = index;
    };
    const load = () => {
      if (loaded) return;
      loaded = true;
      const order = [target, ...Array.from({ length: 96 }, (_, index) => index).filter(index => index !== target)];
      for (const index of order) {
        const frame = new Image();
        frames[index] = frame;
        frame.onload = draw;
        frame.src = frameUrl(index);
      }
    };
    const update = () => {
      request = 0;
      const rect = root.getBoundingClientRect();
      const staticView = motion.matches || !!root.closest('[data-editing="true"]');
      const progress = staticView ? 1 : clamp(-rect.top / Math.max(1, rect.height - innerHeight));
      target = Math.round(progress * 95);
      root.style.setProperty("--progress", progress);
      root.style.setProperty("--heading-opacity", staticView ? 0 : clamp((.4 - progress) / .18));
      root.dataset.chapter = progress < .3 ? "one" : progress < .66 ? "two" : "three";
      draw();
    };
    const schedule = () => { if (!request) request = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { load(); observer.disconnect(); }
    }, { rootMargin: "650px" });
    observer.observe(root);
    const resize = new ResizeObserver(schedule);
    resize.observe(root);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    update();
    return () => {
      disposed = true;
      cancelAnimationFrame(request);
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
      frames.forEach(frame => { frame.onload = null; });
    };
  }, []);

  return <section id="tree-closeup" className={styles.journey} ref={journey} aria-labelledby="tree-closeup-title" data-chapter="one">
    <div className={styles.stage}>
      <header className={styles.heading}>
        <span>Дерево заботы · ближе</span>
        <h2 id="tree-closeup-title">От корней<br />к кроне</h2>
      </header>
      <div className={styles.art} ref={art} aria-hidden="true">
        <img src={frameUrl(0)} alt="" width="1280" height="720" loading="lazy" />
        <canvas ref={canvas} width="1280" height="720" />
      </div>
      <div className={styles.chapter} aria-live="off">
        <span className={styles.chapterOne}>01 / 03&nbsp; Корни и ствол</span>
        <span className={styles.chapterTwo}>02 / 03&nbsp; Ствол и ветви</span>
        <span className={styles.chapterThree}>03 / 03&nbsp; Листва и крона</span>
      </div>
      <div className={styles.progress} aria-hidden="true"><span /></div>
    </div>
  </section>;
}
