"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./comparison-reveal.module.css";

export function ComparisonReveal({ before, after }) {
  const [pointer, setPointer] = useState(null);
  const [keyboard, setKeyboard] = useState(null);
  const [selected, setSelected] = useState(0);
  const active = pointer ?? keyboard ?? selected;

  return (
    <div className={styles.comparison}>
      <div>
        {before.map((item, index) => {
          const open = active === index;
          const answerId = `comparison-answer-${index}`;

          return (
            <div
              className={styles.row}
              data-open={open}
              key={index}
              onPointerEnter={(event) => {
                if (event.pointerType !== "touch") setPointer(index);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType !== "touch") setPointer(null);
              }}
            >
              <button
                type="button"
                className={styles.trigger}
                aria-expanded={open}
                aria-controls={answerId}
                onFocus={(event) => {
                  if (event.currentTarget.matches(":focus-visible")) setKeyboard(index);
                }}
                onBlur={() => setKeyboard(null)}
                onClick={() => setSelected(index)}
              >
                <span className={styles.title}>{item}</span>
                <span className={styles.plusCircle} aria-hidden="true"><span /></span>
              </button>
              <div className={styles.answerGrid} id={answerId} aria-hidden={!open} inert={!open}>
                <div className={styles.answerClip}>
                  <div className={styles.answerInner}>
                    <Image src="/assets/clover.svg" width={18} height={18} alt="" />
                    <span>{after[index]}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
