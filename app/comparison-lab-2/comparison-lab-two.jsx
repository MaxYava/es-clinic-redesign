"use client";

import { useState } from "react";
import copy from "../data/copy.json";
import styles from "./comparison-lab-two.module.css";

const pairs = Array.from({ length: 7 }, (_, index) => ({
  before: copy[39 + index * 2],
  after: copy[40 + index * 2],
}));

function Clover() {
  return <img src="/assets/clover.svg" width="18" height="18" alt="" aria-hidden="true" />;
}

function useRowSelection(initial = null, allowEmpty = true) {
  const [pointer, setPointer] = useState(null);
  const [keyboard, setKeyboard] = useState(null);
  const [selected, setSelected] = useState(initial);
  const active = pointer ?? keyboard ?? selected;

  const rowProps = (index) => ({
    onPointerEnter: (event) => {
      if (event.pointerType !== "touch") setPointer(index);
    },
    onPointerLeave: (event) => {
      if (event.pointerType !== "touch") setPointer(null);
    },
    onFocus: (event) => {
      if (event.target.matches(":focus-visible")) setKeyboard(index);
    },
    onBlur: () => setKeyboard(null),
    onClick: () => setSelected((current) => allowEmpty && current === index ? null : index),
  });

  return { active, rowProps };
}

function VariantFour() {
  const { active, rowProps } = useRowSelection();

  return (
    <section className={styles.variant} aria-label="Вариант 4">
      <div className={styles.head}><span>Вариант 4</span><div className={styles.legend}><span>Без ЕС Клиники</span><span aria-hidden="true">→</span><span>С ЕС Клиникой</span></div></div>
      <div className={styles.morphList}>
        {pairs.map((pair, index) => {
          const open = active === index;
          return <button type="button" className={styles.morphRow} data-open={open} aria-expanded={open} key={index} {...rowProps(index)}>
            <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
            <span className={styles.morphStack}>
              <span className={styles.morphBefore} aria-hidden={open}>{pair.before}</span>
              <span className={styles.morphAfter} aria-hidden={!open}><Clover />{pair.after}</span>
            </span>
            <span className={styles.rowEnd} aria-hidden="true"><span>↗</span><Clover /></span>
          </button>;
        })}
      </div>
    </section>
  );
}

function VariantFive() {
  const { active, rowProps } = useRowSelection();

  return (
    <section className={styles.variant} aria-label="Вариант 5">
      <div className={styles.head}><span>Вариант 5</span><div className={styles.legend}><span>Без ЕС Клиники</span><span aria-hidden="true">↓</span><span>С ЕС Клиникой</span></div></div>
      <div className={styles.expandList}>
        {pairs.map((pair, index) => {
          const open = active === index;
          return <div className={styles.expandRow} data-open={open} key={index} onPointerEnter={rowProps(index).onPointerEnter} onPointerLeave={rowProps(index).onPointerLeave}>
            <button type="button" className={styles.expandTrigger} aria-expanded={open} onFocus={rowProps(index).onFocus} onBlur={rowProps(index).onBlur} onClick={rowProps(index).onClick}>
              <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              <span>{pair.before}</span>
              <span className={styles.expandIcon} aria-hidden="true">+</span>
            </button>
            <div className={styles.answerGrid} aria-hidden={!open}><div className={styles.answerClip}><div className={styles.answerContent}><Clover /><span>{pair.after}</span></div></div></div>
          </div>;
        })}
      </div>
    </section>
  );
}

function VariantSix() {
  const { active, rowProps } = useRowSelection(0, false);
  const current = active ?? 0;

  return (
    <section className={styles.variant} aria-label="Вариант 6">
      <div className={styles.head}><span>Вариант 6</span><div className={styles.legend}><span>Без ЕС Клиники</span><span aria-hidden="true">→</span><span>С ЕС Клиникой</span></div></div>
      <div className={styles.asideLayout}>
        <div className={styles.asideList}>
          {pairs.map((pair, index) => {
            const open = current === index;
            return <div className={styles.asideRow} data-open={open} key={index} onPointerEnter={rowProps(index).onPointerEnter} onPointerLeave={rowProps(index).onPointerLeave}>
              <button type="button" aria-pressed={open} onFocus={rowProps(index).onFocus} onBlur={rowProps(index).onBlur} onClick={rowProps(index).onClick}>
                <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                <span>{pair.before}</span>
                <span className={styles.asideArrow} aria-hidden="true">↗</span>
              </button>
              <div className={styles.mobileAnswer} data-open={open} aria-hidden={!open}><div><Clover /><span>{pair.after}</span></div></div>
            </div>;
          })}
        </div>
        <div className={styles.asideAnswer} aria-live="polite">
          <div className={styles.asideAnswerSticky} key={current}>
            <div className={styles.asideAnswerTop}><Clover /><span>{String(current + 1).padStart(2, "0")} / 07</span></div>
            <p>{pairs[current].after}</p>
            <span className={styles.asideAnswerLabel}>С ЕС Клиникой</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ComparisonLabTwo() {
  return <main className={styles.page}><VariantFour /><VariantFive /><VariantSix /></main>;
}
