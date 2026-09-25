"use client";

import { Children, cloneElement, isValidElement, useEffect, useId, useRef, useState } from "react";
import styles from "./contract-tree.module.css";

const COLLAPSE_FALLBACK_MS = 600;

export function ContractDetail({ heading, title, children, expanded: controlledExpanded, onExpandedChange }) {
  const id = useId();
  const detailRef = useRef(null);
  const [localExpanded, setLocalExpanded] = useState(false);
  const expanded = controlledExpanded ?? localExpanded;
  const changeExpanded = onExpandedChange ?? setLocalExpanded;

  useEffect(() => {
    const card = detailRef.current?.closest("[data-card-step]");
    if (!card) return;
    const visibility = new MutationObserver(() => {
      if (card.dataset.visible !== "true") changeExpanded(false);
    });
    visibility.observe(card, { attributes: true, attributeFilter: ["data-visible"] });
    return () => visibility.disconnect();
  }, [changeExpanded]);

  const toggleExpanded = () => {
    const next = !expanded;
    const card = detailRef.current?.closest(`.${styles.card}`);
    if (next && card) {
      const scene = card.closest("[data-contract-scene]");
      if (scene?.dataset.locked === "true") {
        const bounds = scene.getBoundingClientRect();
        if (bounds.top > 1 || bounds.bottom < window.innerHeight - 1) {
          window.scrollTo({ top: window.scrollY + bounds.top, behavior: "instant" });
        }
      }
      const rect = card.closest("[data-card-step]").getBoundingClientRect();
      const width = Math.min(window.innerWidth * (window.innerWidth <= 760 ? .9 : .78), 1160);
      card.style.setProperty("--expand-x", `${window.innerWidth / 2 - rect.left}px`);
      card.style.setProperty("--expand-y", `${window.innerHeight / 2 - rect.top}px`);
      card.style.setProperty("--expand-width", `${width}px`);
      card.style.setProperty("--expand-inset", window.innerWidth <= 760 ? "120px" : "24px");
    }
    changeExpanded(next);
  };

  return (
    <div ref={detailRef} className={styles.detail} data-expanded={expanded}>
      <button
        type="button"
        className={styles.detailTrigger}
        onClick={toggleExpanded}
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
  const [activeCard, setActiveCard] = useState(null);
  const closingCard = useRef(null);
  const [closingCardState, setClosingCardState] = useState(null);
  const pendingCard = useRef(null);
  const closeTimer = useRef(null);

  const finishCollapse = (index) => {
    if (closingCard.current !== index) return;
    window.clearTimeout(closeTimer.current);
    closingCard.current = null;
    setClosingCardState(null);
    const next = pendingCard.current;
    pendingCard.current = null;
    if (next !== null) setActiveCard(next);
  };

  const requestCardState = (index, nextExpanded) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.clearTimeout(closeTimer.current);
      closingCard.current = null;
      setClosingCardState(null);
      pendingCard.current = null;
      setActiveCard(nextExpanded ? index : null);
      return;
    }

    if (nextExpanded) {
      if (closingCard.current !== null) {
        pendingCard.current = index;
        return;
      }
      if (activeCard !== null && activeCard !== index) {
        closingCard.current = activeCard;
        setClosingCardState(activeCard);
        pendingCard.current = index;
        setActiveCard(null);
        closeTimer.current = window.setTimeout(() => finishCollapse(activeCard), COLLAPSE_FALLBACK_MS);
        return;
      }
      setActiveCard(index);
      return;
    }

    if (activeCard !== index) return;
    pendingCard.current = null;
    closingCard.current = index;
    setClosingCardState(index);
    setActiveCard(null);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => finishCollapse(index), COLLAPSE_FALLBACK_MS);
  };

  useEffect(() => {
    if (activeCard === null) return;
    const closeAtSceneEdge = () => {
      const scene = root.current;
      const bounds = scene?.getBoundingClientRect();
      const card = scene?.querySelector(`[data-card-step="${activeCard + 1}"] .${styles.card}`);
      const cardBounds = card?.getBoundingClientRect();
      if (bounds && cardBounds && (
        bounds.top > 120 ||
        cardBounds.top < 96 ||
        cardBounds.bottom > bounds.bottom - 20
      )) {
        requestCardState(activeCard, false);
      }
    };
    window.addEventListener("scroll", closeAtSceneEdge, { passive: true });
    window.addEventListener("resize", closeAtSceneEdge);
    return () => {
      window.removeEventListener("scroll", closeAtSceneEdge);
      window.removeEventListener("resize", closeAtSceneEdge);
    };
  }, [activeCard]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

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
      item?.style.setProperty("--reveal-x", "0px");
    });
    const update = () => {
      frame = 0;
      if (window.innerWidth <= 760) {
        // Stacked cards already scroll naturally on narrow screens.
        locked.current = true;
        section.dataset.locked = "true";
        revealAll();
        return;
      }
      if (locked.current || page?.dataset.editing === "true" || motion.matches) {
        revealAll();
        return;
      }
      const start = section.getBoundingClientRect().top + window.scrollY;
      const phase = Math.max(420, Math.round(window.innerHeight * .48));
      const gap = Math.max(18, Math.round(window.innerHeight * .02));
      const distance = window.innerWidth * 1.15;
      const playhead = window.scrollY - start;
      const revealEnd = (cards.length - 1) * (phase + gap) + phase;
      if (playhead >= revealEnd) {
        locked.current = true;
        revealAll();
        // The final view matches the scene at its natural start. Remove the
        // animation's scroll distance while retaining any wheel overshoot.
        section.dataset.locked = "true";
        window.scrollTo({ top: start + playhead - revealEnd, behavior: "instant" });
        return;
      }
      cards.forEach((card, index) => {
        const progress = clamp((playhead - index * (phase + gap)) / phase);
        const item = card.querySelector(`.${styles.card}`);
        const visible = progress > 0.001;
        card.dataset.visible = String(visible);
        card.inert = progress < .98;
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
        <div className={styles.cardRail}>
          {intro}
          {Children.map(children, (child, index) => (
            <div className={styles.cardRow} data-card-step={index + 1} data-step={index + 1} data-visible="false"
              data-closing={closingCardState === index ? "true" : undefined} inert key={index}>
              <div className={styles.card}
                onTransitionEnd={(event) => {
                  if (event.target === event.currentTarget && event.propertyName === "transform" && closingCard.current === index) {
                    finishCollapse(index);
                  }
                }}
                onPointerDown={(event) => startDrag(event, index)}
                onPointerMove={moveDrag}
                onPointerUp={stopDrag}
                onPointerCancel={stopDrag}
                onClickCapture={(event) => preventDraggedClick(event, index)}
              >{isValidElement(child) ? cloneElement(child, {
                expanded: activeCard === index,
                onExpandedChange: (next) => requestCardState(index, next),
              }) : child}</div>
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
