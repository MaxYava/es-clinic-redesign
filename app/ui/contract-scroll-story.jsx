"use client";

import { useEffect, useRef } from "react";
import copy from "../data/copy.json";
import styles from "./contract-scroll-story.module.css";

const groups = [
  { title: 62, items: [[63, 64, 65], [66], [67], [68], [69, 70]] },
  { title: 71, items: [[72, 73], [74, 75], [76, 77], [78, 79]] },
  { title: 80, items: [[81, 82, 83], [84, 85]] },
];

const clamp = (value) => Math.max(0, Math.min(1, value));
const ease = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

function Service({ ids }) {
  const [first, ...rest] = ids;
  const [heading, ...inlineBody] = copy[first].split("\n");
  return (
    <article className={styles.service}>
      <h4>{heading}</h4>
      {inlineBody.map((line, index) => <p key={`inline-${index}`}>{line}</p>)}
      {rest.map((id) => <p key={id}>{copy[id]}</p>)}
    </article>
  );
}

export function ContractScrollStory({ intro }) {
  const trackRef = useRef(null);
  const panelRefs = useRef([]);

  useEffect(() => {
    const track = trackRef.current;
    const panels = panelRefs.current;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = matchMedia("(max-width: 760px)");
    let scheduled = 0;

    const update = () => {
      scheduled = 0;
      if (!track) return;
      if (reducedMotion.matches || mobile.matches) {
        panels.forEach((panel) => { if (panel) panel.inert = false; });
        return;
      }
      const rect = track.getBoundingClientRect();
      const distance = Math.max(1, rect.height - innerHeight);
      const progress = clamp(-rect.top / distance);
      panels.forEach((panel, index) => {
        if (!panel) return;
        const phase = progress * panels.length - index;
        const entrance = index === 0 ? ease(phase / .32) : ease((phase + .22) / .44);
        const departure = index === panels.length - 1 ? 0 : ease((phase - .78) / .44);
        const opacity = entrance * (1 - departure);
        const slide = (1 - entrance) * 110 - departure * 110;
        panel.style.setProperty("--slide", `${slide.toFixed(3)}vw`);
        panel.style.setProperty("--opacity", opacity.toFixed(3));
        panel.inert = opacity < .6;
      });
    };
    const schedule = () => { if (!scheduled) scheduled = requestAnimationFrame(update); };
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    reducedMotion.addEventListener("change", schedule);
    mobile.addEventListener("change", schedule);
    update();
    return () => {
      cancelAnimationFrame(scheduled);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      reducedMotion.removeEventListener("change", schedule);
      mobile.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <div className={styles.journey} data-contract-scroll-preview>
      <div className={styles.track} ref={trackRef}>
        <div className={styles.sticky}>
          <div className={styles.intro}>{intro}</div>
          <div className={styles.panels}>
            {groups.map((group, index) => (
              <article
                className={styles.panel}
                key={group.title}
                ref={(element) => { panelRefs.current[index] = element; }}
                data-contract-panel={index + 1}
                aria-label={`Раздел ${index + 1} из ${groups.length}`}
              >
                <div className={styles.panelHeading}>
                  <h3>{copy[group.title].replace(/^\d+\.\s*/, "").replace(/\s*\n\s*/g, " ")}</h3>
                </div>
                <div className={styles.services}>
                  {group.items.map((ids) => <Service ids={ids} key={ids[0]} />)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
