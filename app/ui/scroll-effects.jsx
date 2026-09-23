"use client";

import { useEffect } from "react";

export function ScrollEffects() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!window.IntersectionObserver || motion.matches) return;
    const page = document.querySelector(".page");
    const animations = new Map();
    const counters = new Map();
    const frames = new Set();
    let stopped = false;
    const elements = [...document.querySelectorAll("main .section [data-edit-kind='text'], main .section [data-edit-kind='photo'], main .family-showcase-section [data-edit-kind='photo'], main .section details:not(.process-step), main .process-list > li, main .loyalty [data-edit-kind], .partner-grid > div")]
      .filter(el => !el.closest("#comparison, .review-details-content") && !el.parentElement.closest("[data-edit-kind], details"));
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        animations.get(entry.target)?.play();
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    for (const el of elements) {
      // Progressive enhancement: keep the initial viewport and SSR content visible.
      if (el.getBoundingClientRect().top < window.innerHeight) continue;
      const siblings = [...el.parentElement.children].filter(child => elements.includes(child));
      const delay = Math.min(siblings.indexOf(el) * 90, 450);
      const photo = el.dataset.editKind === "photo";
      const animation = el.animate([
        { opacity: 0, transform: `translateY(30px)${photo ? " scale(1.05)" : ""}` },
        { opacity: 1, transform: "none" },
      ], { duration: 1000, delay, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" });
      animation.pause();
      animation.currentTime = 0;
      animation.onfinish = () => animation.cancel();
      animations.set(el, animation);
      observer.observe(el);
    }
    const countObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting || stopped) continue;
        const el = entry.target;
        countObserver.unobserve(el);
        const original = el.textContent;
        const match = original.match(/^(\d+)(.*)$/);
        if (!match) continue;
        const text = el.firstChild;
        if (text?.nodeType !== Node.TEXT_NODE) continue;
        const previousLabel = el.getAttribute("aria-label");
        el.setAttribute("aria-label", original);
        counters.set(el, { text, original, previousLabel });
        const start = performance.now();
        const tick = now => {
          if (stopped) return;
          const progress = Math.min((now - start) / 1400, 1);
          text.nodeValue = `${Math.round(Number(match[1]) * (1 - Math.pow(1 - progress, 3)))}${match[2]}`;
          if (progress < 1) schedule(tick);
        };
        schedule(tick);
      }
    }, { threshold: 0.3 });
    function schedule(callback) {
      const id = requestAnimationFrame(now => { frames.delete(id); callback(now); });
      frames.add(id);
    }
    document.querySelectorAll(".stats [data-edit-id^='stat-']:not([data-edit-id^='stat-label-'])").forEach(el => countObserver.observe(el));
    const finish = () => {
      stopped = true;
      observer.disconnect();
      countObserver.disconnect();
      animations.forEach(animation => animation.cancel());
      frames.forEach(id => cancelAnimationFrame(id));
      frames.clear();
      counters.forEach(({ text, original, previousLabel }, el) => {
        if (text.parentNode === el) text.nodeValue = original;
        if (previousLabel === null) el.removeAttribute("aria-label");
        else el.setAttribute("aria-label", previousLabel);
      });
      counters.clear();
    };
    // Editing must never be obstructed by hidden elements or temporary numbers.
    const editorObserver = new MutationObserver(() => {
      if (page.dataset.editing === "true") finish();
    });
    editorObserver.observe(page, { attributes: true, attributeFilter: ["data-editing"] });
    if (page.dataset.editing === "true") finish();
    motion.addEventListener("change", finish);
    return () => { finish(); editorObserver.disconnect(); motion.removeEventListener("change", finish); };
  }, []);
  return null;
}
