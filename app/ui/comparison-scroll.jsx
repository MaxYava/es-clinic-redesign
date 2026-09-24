"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./comparison-scroll.module.css";

function ScrollPairCard({ item, answer, index, revealed }) {
  return (
    <article
      className={styles.pair}
      data-revealed={revealed}
      style={{ "--card-index": index }}
      aria-label={`Сравнение ${index + 1}`}
    >
      <div className={styles.stack}>
        <div className={styles.beforeCard}>
          <div className={styles.cardHeading}><span>Самостоятельно</span></div>
          <p>{item}</p>
        </div>
        <div className={styles.afterCard} aria-hidden={!revealed}>
          <div className={styles.cardHeading}>
            <Image src="/assets/clover.svg" width={19} height={19} alt="" />
            <span>С ЕС Клиникой</span>
          </div>
          <p>{answer}</p>
        </div>
      </div>
    </article>
  );
}

export function ScrollComparisonReveal({ before, after, heading }) {
  const sceneRef = useRef(null);
  const lowerSceneRef = useRef(null);
  const revealedRef = useRef(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const pairs = before.map((item, index) => ({ item, answer: after[index], index }));
  const upperPairs = pairs.slice(0, 4);
  const lowerPairs = pairs.slice(4);

  useLayoutEffect(() => {
    const scene = sceneRef.current;
    const lowerScene = lowerSceneRef.current;
    if (!scene || !lowerScene) return undefined;

    const stages = [
      { element: scene, end: upperPairs.length },
      { element: lowerScene, end: before.length },
    ];
    let stageIndex = revealedRef.current >= upperPairs.length ? 1 : 0;
    scene.dataset.scrollPhase = stageIndex === 1 ? "complete" : "idle";
    lowerScene.dataset.scrollPhase = "idle";

    // idle -> approaching -> presenting -> complete. Geometry never changes,
    // and completion removes the input gate rather than collapsing a spacer.
    let phase = revealedRef.current === before.length ? "complete" : "idle";
    let targetY = window.scrollY;
    let frame = 0;
    let previousFrameAt = 0;
    let releaseTimer = 0;
    let gestureDistance = 0;
    let readyAt = 0;
    const revealInterval = 700;
    const anchorY = () => {
      const element = stages[stageIndex].element;
      const topInset = window.innerWidth <= 760 ? 60 : 70;
      // Leave the upper answers visible while fitting the lower row below.
      const inset = stageIndex === 0 ? topInset : Math.max(topInset,
        Math.min(window.innerHeight * 0.34, window.innerHeight - element.offsetHeight - 55));
      return Math.max(0, window.scrollY + element.getBoundingClientRect().top - inset);
    };
    const setPhase = (value) => {
      phase = value;
      stages[stageIndex].element.dataset.scrollPhase = value;
    };
    setPhase(phase);

    const stopMovement = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      previousFrameAt = 0;
    };
    const cancelApproach = () => {
      stopMovement();
      if (phase !== "complete") setPhase("idle");
      gestureDistance = 0;
    };
    const move = (now) => {
      const boundary = anchorY();
      targetY = Math.min(targetY, boundary);
      const remaining = targetY - window.scrollY;
      const elapsed = previousFrameAt ? Math.min(48, now - previousFrameAt) : 16;
      previousFrameAt = now;
      // Accumulate wheel distance in targetY, including events received before
      // the browser paints. Never add an automatic jump to the section start.
      const nextY = Math.abs(remaining) <= 2
        ? targetY
        : window.scrollY + remaining * (1 - Math.exp(-elapsed / 65));
      window.scrollTo({ top: nextY, behavior: "instant" });
      if (Math.abs(targetY - window.scrollY) > 2) {
        frame = window.requestAnimationFrame(move);
        return;
      }
      frame = 0;
      previousFrameAt = 0;
      if (targetY >= boundary - 1) {
        setPhase("presenting");
        gestureDistance = 0;
        readyAt = now + 180;
      }
    };
    const approach = (distance) => {
      if (phase === "idle") {
        targetY = window.scrollY;
        // Cancel any native smooth-scroll momentum before taking ownership.
        window.scrollTo({ top: targetY, behavior: "instant" });
        setPhase("approaching");
      }
      targetY = Math.min(anchorY(), targetY + distance);
      if (!frame) frame = window.requestAnimationFrame(move);
    };
    const consume = (event, distance) => {
      if (phase === "complete" || !distance) return;
      if (distance < 0) {
        cancelApproach();
        return;
      }
      const boundary = anchorY();
      if (phase === "idle") {
        // Take ownership near the section, but move by the user's wheel
        // distance only. This catches queued fast input without pulling ahead.
        const approachStart = boundary - window.innerHeight * 1.25;
        if (window.scrollY + distance < approachStart) return;
        // A scrollbar/hash navigation below the scene must never pull back.
        if (window.scrollY > boundary + 2) return;
      }
      event.preventDefault();
      const now = performance.now();
      if (phase === "idle" || phase === "approaching") {
        approach(distance);
        return;
      }
      // Continuous wheel/trackpad input must advance too; do not require
      // silence between gestures. Discard momentum during each entrance.
      if (now < readyAt || revealedRef.current >= stages[stageIndex].end) return;
      gestureDistance += distance;
      if (gestureDistance < 60) return;
      gestureDistance = 0;
      readyAt = now + revealInterval;
      revealedRef.current += 1;
      setRevealedCount(revealedRef.current);
      if (revealedRef.current === stages[stageIndex].end) {
        // Keep the last answer on screen until its entrance is finished.
        releaseTimer = window.setTimeout(() => {
          setPhase("complete");
          stopMovement();
          if (stageIndex < stages.length - 1) {
            stageIndex += 1;
            gestureDistance = 0;
            setPhase("idle");
          } else {
            window.removeEventListener("wheel", onWheel, true);
            window.removeEventListener("keydown", onKeyDown, true);
          }
        }, 1250);
      }
    };
    const onWheel = (event) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const distance = event.deltaMode === 1 ? event.deltaY * 16
        : event.deltaMode === 2 ? event.deltaY * window.innerHeight : event.deltaY;
      consume(event, distance);
    };
    const onKeyDown = (event) => {
      if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey
        || event.target.closest?.("input, textarea, select, button, [contenteditable='true'], [role='dialog']")) return;
      const distance = event.key === "ArrowDown" ? 80
        : event.key === "PageDown" || (event.code === "Space" && !event.shiftKey) ? window.innerHeight * 0.85
        : event.key === "ArrowUp" || event.key === "PageUp" || (event.code === "Space" && event.shiftKey) ? -80
        : 0;
      consume(event, distance);
    };
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("keydown", onKeyDown, { capture: true });
    window.dispatchEvent(new Event("comparison-scroll-ready"));
    return () => {
      stopMovement();
      window.clearTimeout(releaseTimer);
      window.removeEventListener("wheel", onWheel, true);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [upperPairs.length, before.length]);

  return (
    <div className={styles.scrollComparison}>
      <div ref={sceneRef} className={styles.upperScene} data-comparison-scene>
        <div className={styles.stickyView}>
          {heading}
          <div className={`${styles.cards} ${styles.upperCards}`}>
            {upperPairs.map((pair) => (
              <ScrollPairCard
                key={pair.index}
                {...pair}
                revealed={pair.index < revealedCount}
              />
            ))}
          </div>
        </div>
      </div>
      <div ref={lowerSceneRef} className={`${styles.cards} ${styles.lowerCards}`} data-comparison-lower-scene>
        {lowerPairs.map((pair) => (
          <ScrollPairCard key={pair.index} {...pair} revealed={pair.index < revealedCount} />
        ))}
      </div>
    </div>
  );
}
