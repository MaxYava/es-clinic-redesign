"use client";

import { Children, useEffect, useId, useRef, useState } from "react";
import styles from "./contract-tree.module.css";

export function ContractDetail({ heading, title, children }) {
  const id = useId();
  const detailRef = useRef(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const card = detailRef.current?.closest("[data-card-step]");
    if (!card) return;
    const visibility = new MutationObserver(() => {
      if (card.dataset.visible !== "true") setExpanded(false);
    });
    visibility.observe(card, { attributes: true, attributeFilter: ["data-visible"] });
    return () => visibility.disconnect();
  }, []);

  return (
    <div ref={detailRef} className={styles.detail} data-expanded={expanded}>
      <button
        type="button"
        className={styles.detailTrigger}
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls={id}
        aria-label={`${expanded ? "Свернуть" : "Раскрыть"}: ${title}`}
      >
        <span>{heading}</span>
        <span className={styles.detailPlus} aria-hidden="true" />
      </button>
      <div className={styles.detailPanel} id={id} inert={!expanded} aria-hidden={!expanded}>
        <div className={styles.detailPanelClip}>
          <div className={styles.detailBody}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export function ContractTree({ children, intro }) {
  const root = useRef(null);
  const drag = useRef(null);
  const positions = useRef([]);
  const lastDrag = useRef(null);

  const startDrag = (event, index) => {
    if ((event.pointerType === "mouse" && event.button !== 0) || !event.target.closest("button")) return;
    const card = event.currentTarget;
    const x = positions.current[index] || 0;
    const rect = card.getBoundingClientRect();
    drag.current = {
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      x,
      minX: 20 - (rect.left - x),
      maxX: window.innerWidth - 20 - (rect.right - x),
      moved: false,
    };
  };

  const moveDrag = (event) => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const delta = event.clientX - active.startX;
    if (!active.moved && Math.abs(delta) < 6) return;
    if (!active.moved) event.currentTarget.setPointerCapture(event.pointerId);
    active.moved = true;
    const nextX = Math.max(active.minX, Math.min(active.maxX, active.x + delta));
    event.currentTarget.style.setProperty("--drag-x", `${nextX}px`);
    event.currentTarget.dataset.dragging = "true";
    positions.current[active.index] = nextX;
  };

  const stopDrag = (event) => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (active.moved) lastDrag.current = { index: active.index, time: performance.now() };
    event.currentTarget.dataset.dragging = "false";
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
  };

  const preventDraggedClick = (event, index) => {
    const last = lastDrag.current;
    if (last && last.index === index && performance.now() - last.time <= 450) {
      event.preventDefault();
      event.stopPropagation();
      lastDrag.current = null;
      return;
    }
    // Opening a wide panel from a displaced position could push it offscreen.
    event.currentTarget.style.setProperty("--drag-x", "0px");
    positions.current[index] = 0;
  };

  useEffect(() => {
    const section = root.current;
    const cards = [...section.querySelectorAll("[data-card-step]")];
    const page = section.closest(".page");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const locked = { current: false };
    let frame = 0;
    const clamp = (value) => Math.max(0, Math.min(1, value));
    const revealAll = () => cards.forEach((card) => {
      card.dataset.visible = "true";
      card.inert = false;
      const item = card.querySelector(`.${styles.card}`);
      item?.style.setProperty("--reveal-opacity", "1");
      item?.style.setProperty("--reveal-x", "0px");
    });
    const update = () => {
      frame = 0;
      if (locked.current || page?.dataset.editing === "true" || motion.matches) {
        revealAll();
        return;
      }
      const start = section.getBoundingClientRect().top + window.scrollY;
      const phase = Math.max(480, Math.round(window.innerHeight * .6));
      const gap = Math.max(24, Math.round(window.innerHeight * .025));
      const distance = Math.max(window.innerWidth * .9, 920);
      const playhead = window.scrollY - start;
      const totalEnd = (cards.length - 1) * (phase + gap) + phase;
      if (playhead >= totalEnd) {
        locked.current = true;
        revealAll();
        return;
      }
      cards.forEach((card, index) => {
        const progress = clamp((playhead - index * (phase + gap)) / phase);
        const item = card.querySelector(`.${styles.card}`);
        const visible = progress > 0.001;
        card.dataset.visible = String(visible);
        card.inert = progress < .98;
        item?.style.setProperty("--reveal-opacity", String(progress));
        item?.style.setProperty("--reveal-x", `${(1 - progress) * distance}px`);
      });
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    const onResize = schedule;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    motion.addEventListener("change", schedule);
    update();
    const editing = page && new MutationObserver(() => {
      if (page.dataset.editing === "true") schedule();
    });
    if (editing) editing.observe(page, { attributes: true, attributeFilter: ["data-editing"] });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      motion.removeEventListener("change", schedule);
      editing?.disconnect();
    };
  }, []);

  return (
    <div className={styles.journey} ref={root} data-contract-scene>
      <div className={styles.backdrop} aria-hidden="true">
        <picture className={styles.photo}>
          <source media="(max-width: 760px)" srcSet="/assets/enhanced/history.webp" />
          <img src="/assets/official-footer-building.png" alt="" width="1400" height="700" loading="lazy" decoding="async" />
        </picture>
      </div>
      <div className={styles.scene}>
        {intro}
        <div className={styles.cardRail}>
          {Children.map(children, (child, index) => (
            <div className={styles.cardRow} data-card-step={index + 1} data-step={index + 1} data-visible="false" inert key={index}>
              <div className={styles.card}
                onPointerDown={(event) => startDrag(event, index)}
                onPointerMove={moveDrag}
                onPointerUp={stopDrag}
                onPointerCancel={stopDrag}
                onClickCapture={(event) => preventDraggedClick(event, index)}
              >{child}</div>
            </div>
          ))}
        </div>
        <div className={styles.sequence} aria-hidden="true">
          {Children.map(children, (_, index) => (
            <div className={styles.sequenceStep} data-reveal-step={index + 1} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
