"use client";

import { Children, useEffect, useId, useRef, useState } from "react";
import styles from "./contract-tree.module.css";

const FRAME_COUNT = 576;
const LAST_FRAME = FRAME_COUNT - 1;
const CARD_WINDOWS = [[245, 327], [352, 432], [490, 565]];
const frameUrl = index => `/contract-tree/source-1080-v2/frame-${String(index + 1).padStart(3, "0")}.webp`;

export function ContractDetail({ heading, title, children }) {
  const id = useId();
  const detailRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const card = detailRef.current?.closest('[data-active]');
    if (!card) return;
    const visibility = new MutationObserver(() => {
      if (card.dataset.active === "false") setExpanded(false);
    });
    visibility.observe(card, { attributes: true, attributeFilter: ["data-active"] });
    return () => visibility.disconnect();
  }, []);
  return <div ref={detailRef} className={styles.detail} data-expanded={expanded}>
    <button type="button" className={styles.detailTrigger}
      onClick={() => setExpanded(value => !value)} aria-expanded={expanded}
      aria-controls={id} aria-label={`${expanded ? "Свернуть" : "Раскрыть"}: ${title}`}>
      <span>{heading}</span><span className={styles.detailPlus} aria-hidden="true" />
    </button>
    <div id={id} className={styles.detailPanel} inert={!expanded} aria-hidden={!expanded}>
      <div className={styles.detailPanelClip}><div className={styles.detailBody}>{children}</div></div>
    </div>
  </div>;
}

export function ContractTree({ children }) {
  const root = useRef(null);
  const canvas = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const element = root.current;
    const surface = canvas.current;
    const video = videoRef.current;
    const tree = surface.parentElement;
    const track = element.querySelector(`.${styles.track}`);
    const cards = [...element.querySelectorAll(`.${styles.card}`)];
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let raf = 0;
    let worker;
    let fallbackContext;
    let fallbackImage;
    let loaded = false;
    let target = 0;
    let requestedFrame = -1;
    let drawn = -1;
    let staticView = false;
    let maximumSpeed = 0;
    let streamSupported = innerWidth > 760 && Boolean(video.canPlayType('video/webm; codecs="av01.0.05M.08"'));
    let streamPlaying = false;
    const canvasSize = () => {
      if (innerWidth <= 760) return { width: 540, height: 1080 };
      const width = Math.min(1920, Math.max(960, Math.ceil(innerWidth * devicePixelRatio)));
      return { width, height: Math.round(width * 9 / 16) };
    };
    let desiredScroll = null;
    let playbackRaf = 0;
    let lastPlayback = 0;
    let lastDrivenScroll = null;
    let playbackStarted = 0;

    const limits = () => {
      const start = element.getBoundingClientRect().top + scrollY;
      const end = start + element.offsetHeight - innerHeight;
      const animationDistance = Math.max(1, end - start);
      return { start, end, animationDistance };
    };
    const stopPlayback = () => {
      cancelAnimationFrame(playbackRaf);
      if (streamPlaying) {
        video.pause();
        streamPlaying = false;
        if (streamSupported) drawFallback(Math.round(target));
      }
      playbackRaf = 0;
      lastPlayback = 0;
      lastDrivenScroll = null;
      desiredScroll = null;
      playbackStarted = 0;
    };
    const playQueuedScroll = now => {
      playbackRaf = 0;
      if (desiredScroll === null) return;
      if (lastDrivenScroll !== null && Math.abs(scrollY - lastDrivenScroll) > 2) {
        stopPlayback();
        return;
      }
      const elapsed = lastPlayback ? Math.min(50, now - lastPlayback) / 1000 : 1 / 60;
      lastPlayback = now;
      const current = scrollY;
      const remaining = desiredScroll - current;
      if (Math.abs(remaining) < 1) { stopPlayback(); return; }
      if (streamSupported && remaining > 0) {
        if (video.readyState >= 2 && !video.seeking) {
          const { start, animationDistance } = limits();
          const currentFrame = Math.max(0, Math.min(LAST_FRAME, (current - start) / animationDistance * LAST_FRAME));
          if (!streamPlaying) {
            if (Math.abs(video.currentTime * 30 - currentFrame) > 1.5) video.currentTime = currentFrame / 30;
            else {
              streamPlaying = true;
              tree.dataset.video = "true";
              video.play().catch(error => {
                if (error.name === "AbortError") return;
                streamSupported = false;
                streamPlaying = false;
                tree.dataset.video = "false";
                drawFallback(Math.round(target));
              });
            }
          } else {
            const streamFrame = Math.min(LAST_FRAME, Math.round(video.currentTime * 30));
            const nextScroll = Math.min(desiredScroll, start + streamFrame / LAST_FRAME * animationDistance);
            if (nextScroll > current) {
              scrollTo({ top: nextScroll, behavior: "instant" });
              lastDrivenScroll = scrollY;
              drawn = streamFrame;
              element.dataset.frame = String(streamFrame);
              element.dataset.renderSource = "stream";
              updateCards();
              schedule();
            }
            if (nextScroll >= desiredScroll - 1) { stopPlayback(); return; }
          }
        }
        playbackRaf = requestAnimationFrame(playQueuedScroll);
        return;
      }
      // The visual frame must keep up with the playhead; never skip ahead into an undecoded frame.
      if (loaded && drawn >= 0 && Math.abs(target - drawn) <= 2.5) {
        if (!playbackStarted) playbackStarted = now;
        const acceleration = Math.min(1, 0.12 + (now - playbackStarted) / 650);
        const step = Math.min(Math.abs(remaining), Math.max(1, maximumSpeed * acceleration * elapsed));
        scrollTo({ top: current + Math.sign(remaining) * step, behavior: "instant" });
        lastDrivenScroll = scrollY;
        schedule();
      }
      playbackRaf = requestAnimationFrame(playQueuedScroll);
    };
    const onWheel = event => {
      if (event.ctrlKey || motion.matches || element.closest('[data-editing="true"]')) {
        stopPlayback();
        return;
      }
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (!delta) return;
      const detailBody = event.target instanceof Element && event.target.closest(`.${styles.detailBody}`);
      if (detailBody && detailBody.scrollHeight > detailBody.clientHeight + 2 &&
        (delta > 0 ? detailBody.scrollTop + detailBody.clientHeight < detailBody.scrollHeight - 2 : detailBody.scrollTop > 2)) {
        stopPlayback();
        return;
      }
      const { start, end, animationDistance } = limits();
      maximumSpeed = animationDistance / LAST_FRAME * 30;
      const current = scrollY;
      const forward = delta > 0;
      if (!forward && streamPlaying) {
        video.pause();
        streamPlaying = false;
        drawFallback(Math.round(target));
      }
      const inside = current >= start - 2 && current <= end + 2;
      const entering = forward ? current < start && current + delta >= start : current > end && current + delta <= end;
      if (!inside && !entering) { stopPlayback(); return; }
      if (inside && ((forward && current >= end - 1 && (desiredScroll ?? current) >= end - 1) ||
        (!forward && current <= start + 1 && (desiredScroll ?? current) <= start + 1))) {
        stopPlayback();
        return;
      }
      event.preventDefault();
      if (entering) {
        const boundary = forward ? start : end;
        scrollTo({ top: boundary, behavior: "instant" });
        desiredScroll = boundary;
        lastDrivenScroll = scrollY;
        playbackStarted = 0;
        schedule();
      }
      if (desiredScroll === null || Math.sign(delta) !== Math.sign(desiredScroll - current)) {
        desiredScroll = scrollY;
        playbackStarted = 0;
      }
      // Never let rapid wheel events build a multi-second, self-running scroll tail.
      const impulse = Math.max(-180, Math.min(180, delta));
      const queueLimit = Math.max(60, maximumSpeed * 0.5);
      desiredScroll = Math.max(start, Math.min(end,
        scrollY + Math.max(-queueLimit, Math.min(queueLimit, desiredScroll + impulse - scrollY))));
      if (!playbackRaf) playbackRaf = requestAnimationFrame(playQueuedScroll);
    };
    const onScroll = () => {
      if (desiredScroll !== null && lastDrivenScroll !== null && Math.abs(scrollY - lastDrivenScroll) > 2) stopPlayback();
      schedule();
    };
    const scrubTo = clientX => {
      stopPlayback();
      const bounds = track.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
      const { start, end, animationDistance } = limits();
      scrollTo({ top: Math.min(end, start + animationDistance * fraction), behavior: "instant" });
      schedule();
    };
    const onTrackDown = event => {
      if (event.button !== 0) return;
      event.preventDefault();
      track.setPointerCapture(event.pointerId);
      scrubTo(event.clientX);
    };
    const onTrackMove = event => {
      if (track.hasPointerCapture(event.pointerId)) scrubTo(event.clientX);
    };
    const onTrackKey = event => {
      const step = event.shiftKey ? 24 : 1;
      const next = event.key === "Home" ? 0 : event.key === "End" ? LAST_FRAME :
        event.key === "ArrowRight" || event.key === "ArrowDown" ? Math.min(LAST_FRAME, Math.round(target) + step) :
        event.key === "ArrowLeft" || event.key === "ArrowUp" ? Math.max(0, Math.round(target) - step) : null;
      if (next === null) return;
      event.preventDefault();
      const bounds = track.getBoundingClientRect();
      scrubTo(bounds.left + bounds.width * next / LAST_FRAME);
    };

    const updateCards = () => {
      cards.forEach((card, index) => {
        const [start, end] = CARD_WINDOWS[index];
        const active = staticView || (drawn >= start && drawn <= end);
        if (card.dataset.active !== String(active)) card.dataset.active = String(active);
        card.inert = !active;
      });
    };
    const onDrawn = frame => {
      if (disposed) return;
      drawn = frame;
      tree.dataset.ready = "true";
      element.dataset.frame = String(frame);
      element.dataset.renderSource = "full";
      updateCards();
    };
    const drawFallback = frame => {
      if (!fallbackContext) return;
      const image = new Image();
      fallbackImage = image;
      image.onload = () => {
        if (disposed || fallbackImage !== image) return;
        fallbackContext.drawImage(image, 0, 0, surface.width, surface.height);
        if (!streamPlaying) {
          tree.dataset.video = "false";
          onDrawn(frame);
        }
      };
      image.src = frameUrl(frame);
    };
    const load = () => {
      if (loaded) return;
      loaded = true;
      if (streamSupported) {
        const size = canvasSize();
        surface.width = size.width;
        surface.height = size.height;
        fallbackContext = surface.getContext("2d", { alpha: false });
        drawFallback(Math.round(target));
        video.src = "/contract-tree/tree-growth-1080-av1.webm";
        video.load();
        return;
      }
      if (typeof Worker !== "undefined" && surface.transferControlToOffscreen) {
        try {
          const offscreen = surface.transferControlToOffscreen();
          worker = new Worker("/contract-tree/full-frame-worker.js");
          worker.onmessage = event => {
            if (event.data.type === "drawn") onDrawn(event.data.frame);
            if (event.data.type === "error") console.warn("Tree frame:", event.data.message);
          };
          worker.postMessage({ type: "init", canvas: offscreen, frame: target, size: canvasSize(), mobile: innerWidth <= 760 }, [offscreen]);
          requestedFrame = Math.round(target);
          return;
        } catch (error) {
          console.warn("Tree frame worker unavailable:", error);
        }
      }
      const size = canvasSize();
      surface.width = size.width;
      surface.height = size.height;
      fallbackContext = surface.getContext("2d", { alpha: false });
      drawFallback(Math.round(target));
    };
    const update = () => {
      raf = 0;
      const box = element.getBoundingClientRect();
      staticView = motion.matches || !!element.closest('[data-editing="true"]');
      const viewportHeight = innerHeight;
      const animationDistance = Math.max(1, box.height - viewportHeight);
      const progress = staticView ? 1 : Math.max(0, Math.min(1, -box.top / animationDistance));
      const nextTarget = progress * LAST_FRAME;
      element.dataset.static = String(staticView);
      element.dataset.targetFrame = String(Math.round(nextTarget));
      track.style.setProperty("--growth", nextTarget / LAST_FRAME);
      track.setAttribute("aria-valuenow", String(Math.round(nextTarget)));
      updateCards();
      if (Math.abs(nextTarget - target) < 0.02) return;
      target = nextTarget;
      if (streamSupported) {
        if (!streamPlaying) {
          if (desiredScroll === null) {
            const time = Math.min(LAST_FRAME / 30, Math.round(target) / 30);
            if (video.readyState >= 1 && !video.seeking && Math.abs(video.currentTime - time) > 0.05) video.currentTime = time;
          }
          drawFallback(Math.round(target));
        }
        return;
      }
      if (worker && requestedFrame !== Math.round(target)) {
        requestedFrame = Math.round(target);
        worker.postMessage({ type: "frame", frame: target });
      }
      else if (loaded) drawFallback(Math.round(target));
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    const onResize = () => {
      maximumSpeed = limits().animationDistance / LAST_FRAME * 30;
      if (worker) worker.postMessage({ type: "resize", size: canvasSize(), mobile: innerWidth <= 760 });
      else if (fallbackContext) {
        const size = canvasSize();
        surface.width = size.width;
        surface.height = size.height;
        drawFallback(Math.round(target));
      }
      schedule();
    };
    const onVideoError = () => {
      streamSupported = false;
      streamPlaying = false;
      tree.dataset.video = "false";
      drawFallback(Math.round(target));
    };
    const onVideoMetadata = () => {
      if (streamSupported && !streamPlaying) video.currentTime = Math.round(target) / 30;
    };
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { load(); observer.disconnect(); }
    }, { rootMargin: "850px" });
    observer.observe(element);
    const resize = new ResizeObserver(schedule);
    resize.observe(element);
    const editing = new MutationObserver(schedule);
    const page = element.closest(".page");
    if (page) editing.observe(page, { attributes: true, attributeFilter: ["data-editing"] });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointerdown", stopPlayback, { capture: true });
    window.addEventListener("resize", onResize);
    video.addEventListener("error", onVideoError);
    video.addEventListener("loadedmetadata", onVideoMetadata);
    motion.addEventListener("change", schedule);
    track.addEventListener("pointerdown", onTrackDown);
    track.addEventListener("pointermove", onTrackMove);
    track.addEventListener("keydown", onTrackKey);
    update();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      stopPlayback();
      observer.disconnect();
      resize.disconnect();
      editing.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointerdown", stopPlayback, true);
      window.removeEventListener("resize", onResize);
      video.removeEventListener("error", onVideoError);
      video.removeEventListener("loadedmetadata", onVideoMetadata);
      video.pause();
      motion.removeEventListener("change", schedule);
      track.removeEventListener("pointerdown", onTrackDown);
      track.removeEventListener("pointermove", onTrackMove);
      track.removeEventListener("keydown", onTrackKey);
      if (worker) worker.terminate();
      if (fallbackImage) fallbackImage.onload = null;
    };
  }, []);

  return <div className={styles.journey} ref={root} data-contract-tree>
    <div className={styles.stage}>
      <div className={styles.tree} aria-hidden="true">
        <img src={frameUrl(0)} alt="" loading="lazy" width="1920" height="1080" />
        <canvas ref={canvas} width="1920" height="1080" />
        <video ref={videoRef} muted playsInline preload="none" />
      </div>
      <div className={styles.scene}>
        {Children.map(children, (child, index) => <div className={`${styles.card} ${styles[`card${index}`]}`} data-active="false" inert>{child}</div>)}
      </div>
      <div className={styles.track} role="slider" tabIndex={0} aria-label="Быстрая перемотка дерева"
        aria-valuemin={0} aria-valuemax={LAST_FRAME} aria-valuenow={0}><span /></div>
    </div>
  </div>;
}
