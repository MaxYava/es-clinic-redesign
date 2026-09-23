"use client";

import { Children, useEffect, useRef } from "react";
import { TREE_HOLD_VIEWPORTS, TREE_STOP_FRAMES, treeStoryboard } from "./tree-storyboard";
import styles from "./tree-closeup.module.css";

const variants = {
  closeup: { directory: "botanical-closeup-hd", id: "tree-closeup", eyebrow: "Дерево заботы · ближе", title: ["От корней", "к кроне"], width: 1920, height: 1080 },
  sprout: { directory: "sprout-to-tree-hd", id: "tree-sprout", eyebrow: "Дерево заботы · вариант 03", title: ["От ростка", "к дереву"], width: 1920, height: 1080 },
  documentary: { directory: "documentary-growth", id: "tree-documentary", eyebrow: "Дерево заботы · вариант 04", title: ["История роста", "одного дерева"], width: 1920, height: 1080 },
};
const frameUrl = (index, directory) => `/contract-tree/${directory}/frame-${String(index + 1).padStart(3, "0")}.webp`;
const clamp = value => Math.max(0, Math.min(1, value));

export function TreeCloseup({ variant = "closeup", children }) {
  const config = variants[variant];
  const pauseFrames = TREE_STOP_FRAMES[variant];
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
      context.clearRect(0, 0, surface.width, surface.height);
      context.drawImage(frames[index], 0, 0, surface.width, surface.height);
      layer.dataset.ready = "true";
      root.dataset.frame = String(index);
      drawn = index;
    };
    const load = () => {
      if (loaded) return;
      loaded = true;
      const order = [...new Set([target, ...pauseFrames, 0, ...Array.from({ length: 96 }, (_, index) => index)])];
      for (const index of order) {
        const frame = new Image();
        frames[index] = frame;
        frame.onload = () => { draw(); schedule(); };
        frame.src = frameUrl(index, config.directory);
      }
    };
    const update = () => {
      request = 0;
      const rect = root.getBoundingClientRect();
      const staticView = motion.matches || !!root.closest('[data-editing="true"]');
      const animationDistance = Math.max(1, rect.height - innerHeight * (1 + 3 * TREE_HOLD_VIEWPORTS));
      const story = staticView ? { progress: 1, active: -1 } : treeStoryboard(Math.max(0, -rect.top), animationDistance, innerHeight, pauseFrames);
      const progress = clamp(story.progress);
      target = Math.round(progress * 95);
      root.style.setProperty("--progress", progress);
      root.style.setProperty("--heading-opacity", staticView ? 0 : clamp((.4 - progress) / .18));
      root.dataset.static = String(staticView);
      root.querySelectorAll(`.${styles.stepCard}`).forEach((card, index) => {
        const active = staticView || (story.active === index && !!frames[target]?.naturalWidth);
        card.dataset.active = String(active);
        card.inert = !active;
      });
      draw();
    };
    const schedule = () => { if (!request) request = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { load(); observer.disconnect(); }
    }, { rootMargin: "650px" });
    observer.observe(root);
    const resize = new ResizeObserver(schedule);
    resize.observe(root);
    const editing = new MutationObserver(schedule);
    const page = root.closest(".page");
    if (page) editing.observe(page, { attributes: true, attributeFilter: ["data-editing"] });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    update();
    return () => {
      disposed = true;
      cancelAnimationFrame(request);
      observer.disconnect();
      resize.disconnect();
      editing.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
      frames.forEach(frame => { frame.onload = null; });
    };
  }, [config.directory, pauseFrames]);

  return <section id={config.id} className={`${styles.journey} ${variant === "documentary" ? styles.slowJourney : ""}`} ref={journey} aria-labelledby={`${config.id}-title`}>
    <div className={styles.stage}>
      <header className={styles.heading}>
        <span>{config.eyebrow}</span>
        <h2 id={`${config.id}-title`}>{config.title[0]}<br />{config.title[1]}</h2>
      </header>
      <div className={styles.art} ref={art} aria-hidden="true">
        <img src={frameUrl(0, config.directory)} alt="" width={config.width || 1280} height={config.height || 720} loading="lazy" />
        <canvas ref={canvas} width={config.width || 1280} height={config.height || 720} />
      </div>
      <div className={styles.storySteps}>
        {Children.map(children, (child, index) => <div className={`${styles.stepCard} ${styles[`step${index}`]}`} data-active="false" inert>{child}</div>)}
      </div>
      <div className={styles.progress} aria-hidden="true"><span /></div>
    </div>
  </section>;
}
