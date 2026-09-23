"use client";

import { Children, useEffect, useRef, useId } from "react";
import styles from "./contract-tree.module.css";

const frameUrl = index => `/contract-tree/new-tree-clean/frame-${String(index + 1).padStart(3, "0")}.webp`;

export function ContractDetail({ heading, title, children }) {
  const dialog = useRef(null);
  const id = useId();
  const previousOverflow = useRef(null);
  const unlock = () => {
    if (previousOverflow.current !== null) {
      document.body.style.overflow = previousOverflow.current;
      previousOverflow.current = null;
    }
  };
  useEffect(() => () => unlock(), []);
  const open = () => {
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current.showModal();
  };
  return <>
    <button type="button" className={styles.detailTrigger} onClick={open} aria-haspopup="dialog">
      <span>{heading}</span><span className={styles.detailPlus} aria-hidden="true">+</span>
    </button>
    <dialog ref={dialog} className={styles.detailDialog} aria-labelledby={id} onClose={unlock} onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }}>
      <div className={styles.dialogInner}>
        <div className={styles.dialogHeader}><div><small>Годовой контракт</small><h2 id={id}>{title}</h2></div><button type="button" aria-label="Закрыть подробности" onClick={() => dialog.current.close()} autoFocus>×</button></div>
        <div className={styles.dialogBody}>{children}</div>
      </div>
    </dialog>
  </>;
}

export function ContractTree({ children, heading }) {
  const root = useRef(null);
  const canvas = useRef(null);

  useEffect(() => {
    const element = root.current;
    const context = canvas.current.getContext("2d");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = matchMedia("(max-width: 760px)");
    const frames = [];
    let disposed = false;
    let raf = 0;
    let target = 0;
    let drawn = -1;
    let loaded = false;
    const draw = () => {
      if (disposed || !context) return;
      let nearest = target;
      while (nearest >= 0 && !frames[nearest]?.complete) nearest--;
      const frame = frames[nearest];
      if (frame?.naturalWidth && drawn !== nearest) {
        context.clearRect(0, 0, 660, 550);
        context.drawImage(frame, 0, 0, 660, 550);
        canvas.current.parentElement.dataset.ready = "true";
        drawn = nearest;
      }
    };
    const update = () => {
      raf = 0;
      const box = element.getBoundingClientRect();
      const staticView = motion.matches || !!element.closest('[data-editing="true"]');
      const progress = staticView ? 1 : Math.max(0, Math.min(1, (95 - box.top) / Math.max(1, box.height - (innerHeight - 95))));
      target = Math.round(progress * 95);
      element.style.setProperty("--growth", progress);
      element.querySelectorAll(`.${styles.card}`).forEach((card, index) => {
        const reveal = staticView ? 1 : Math.max(0, Math.min(1, (progress - [.12, .4, .7][index]) / .16));
        const line = Math.min(1, reveal / .45);
        const text = Math.max(0, Math.min(1, (reveal - .2) / .8));
        const visible = reveal > 0;
        card.style.setProperty("--line-reveal", line);
        card.style.setProperty("--text-reveal", text * text * (3 - 2 * text));
        card.dataset.visible = String(visible);
        card.inert = text < .95;
      });
      draw();
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    const load = () => {
      if (loaded) return;
      loaded = true;
      for (let index = 0; index < 96; index++) {
        const frame = new window.Image();
        frames[index] = frame;
        frame.onload = draw;
        frame.src = frameUrl(index);
      }
    };
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { load(); observer.disconnect(); }
    }, { rootMargin: "800px" });
    observer.observe(element);
    const resize = new ResizeObserver(schedule);
    resize.observe(element);
    const editing = new MutationObserver(schedule);
    const page = element.closest(".page");
    if (page) editing.observe(page, { attributes: true, attributeFilter: ["data-editing"] });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    mobile.addEventListener("change", schedule);
    update();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect(); resize.disconnect(); editing.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
      mobile.removeEventListener("change", schedule);
      frames.forEach(frame => { frame.onload = null; });
    };
  }, []);

  return <div className={styles.journey} ref={root}>
    <div className={styles.stage}>
      <div className={styles.heading}>{heading}</div>
      <div className={styles.scene}>
      <div className={styles.tree} aria-hidden="true">
        <img src={frameUrl(0)} alt="" loading="lazy" width="660" height="550" />
        <canvas ref={canvas} width="660" height="550" />
      </div>
      {Children.map(children, (child, index) => <div className={`${styles.card} ${styles[`card${index}`]}`} data-visible="false" inert>
        {child}
      </div>)}
      </div>
      <div className={styles.track} aria-hidden="true"><span /></div>
    </div>
  </div>;
}
