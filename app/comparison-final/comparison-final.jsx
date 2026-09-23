"use client";

import { useState } from "react";
import copy from "../data/copy.json";
import styles from "./comparison-final.module.css";

const pairs = Array.from({ length: 7 }, (_, index) => ({
  before: copy[39 + index * 2],
  after: copy[40 + index * 2],
}));

function Clover() {
  return <img src="/assets/clover.svg" width="18" height="18" alt="" aria-hidden="true" />;
}

function useActiveRow() {
  const [pointer, setPointer] = useState(null);
  const [keyboard, setKeyboard] = useState(null);
  const [selected, setSelected] = useState(0);
  const active = pointer ?? keyboard ?? selected;

  const hoverProps = (index) => ({
    onPointerEnter: (event) => {
      if (event.pointerType !== "touch") setPointer(index);
    },
    onPointerLeave: (event) => {
      if (event.pointerType !== "touch") setPointer(null);
    },
  });

  const buttonProps = (index) => ({
    onFocus: (event) => {
      if (event.currentTarget.matches(":focus-visible")) setKeyboard(index);
    },
    onBlur: () => setKeyboard(null),
    onClick: () => setSelected(index),
  });

  return { active, hoverProps, buttonProps };
}

function Head({ label, direction }) {
  return <div className={styles.head}><span>{label}</span><div className={styles.legend}><span>Без ЕС Клиники</span><span aria-hidden="true">{direction}</span><span>С ЕС Клиникой</span></div></div>;
}

function SwapVariant({ label, mode }) {
  const { active, hoverProps, buttonProps } = useActiveRow();

  return <section className={styles.variant} aria-label={label}>
    <Head label={label} direction="→" />
    <div className={styles.swapList} data-mode={mode}>
      {pairs.map((pair, index) => {
        const open = active === index;
        return <button type="button" className={styles.swapRow} data-open={open} aria-pressed={open} key={index} {...hoverProps(index)} {...buttonProps(index)}>
          <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
          <span className={styles.swapStack}>
            <span className={styles.swapBefore} aria-hidden={open}>{pair.before}</span>
            <span className={styles.swapAfter} aria-hidden={!open}><Clover /><span>{pair.after}</span></span>
          </span>
          <span className={styles.swapCircle} aria-hidden="true"><span className={styles.swapArrow}>↗</span><Clover /></span>
        </button>;
      })}
    </div>
  </section>;
}

function AccordionVariant({ label, mode }) {
  const { active, hoverProps, buttonProps } = useActiveRow();

  return <section className={styles.variant} aria-label={label}>
    <Head label={label} direction="↓" />
    <div className={styles.accordionList} data-mode={mode}>
      {pairs.map((pair, index) => {
        const open = active === index;
        const controls = `${mode}-answer-${index}`;
        return <div className={styles.accordionRow} data-open={open} key={index} {...hoverProps(index)}>
          <button type="button" className={styles.accordionTrigger} aria-expanded={open} aria-controls={controls} {...buttonProps(index)}>
            <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
            <span className={styles.accordionTitle}>{pair.before}</span>
            <span className={styles.plusCircle} aria-hidden="true"><span>+</span></span>
          </button>
          <div className={styles.answerGrid} id={controls} aria-hidden={!open}>
            <div className={styles.answerClip}><div className={styles.answerInner}>
              <Clover /><span>{pair.after}</span>
            </div></div>
          </div>
        </div>;
      })}
    </div>
  </section>;
}

export default function ComparisonFinal() {
  return <main className={styles.page}>
    <SwapVariant label="Вариант 4.1" mode="soft" />
    <SwapVariant label="Вариант 4.2" mode="wipe" />
    <AccordionVariant label="Вариант 5.1" mode="soft" />
    <AccordionVariant label="Вариант 5.2" mode="rail" />
  </main>;
}
