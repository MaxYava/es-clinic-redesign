"use client";

import { useEffect, useRef, useState } from "react";
import copy from "../data/copy.json";
import styles from "./comparison-lab.module.css";

const pairs = Array.from({ length: 7 }, (_, index) => ({
  before: copy[39 + index * 2],
  after: copy[40 + index * 2],
}));

function Clover() {
  return <img src="/assets/clover.svg" alt="" aria-hidden="true" />;
}

function VariantOne() {
  const [clinic, setClinic] = useState(false);

  return (
    <section className={styles.variant} aria-label="Вариант 1">
      <div className={styles.variantHead}>
        <span className={styles.variantLabel}>Вариант 1</span>
        <div className={styles.textSwitch} role="group" aria-label="Режим сравнения">
          <button type="button" aria-pressed={!clinic} onClick={() => setClinic(false)}>Без ЕС Клиники</button>
          <span aria-hidden="true">↔</span>
          <button type="button" aria-pressed={clinic} onClick={() => setClinic(true)}>С ЕС Клиникой</button>
        </div>
      </div>
      <div className={styles.switchList} aria-live="polite">
        {pairs.map((pair, index) => (
          <div className={styles.switchRow} key={index}>
            <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
            <div className={styles.switchText} key={`${clinic}-${index}`} style={{ "--delay": `${index * 42}ms` }}>
              {clinic && <Clover />}
              <span>{clinic ? pair.after : pair.before}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function VariantTwo() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.variant} aria-label="Вариант 2">
      <div className={styles.variantHead}>
        <span className={styles.variantLabel}>Вариант 2</span>
        <div className={styles.pairLegend}><span>Без ЕС Клиники</span><span aria-hidden="true">→</span><span>С ЕС Клиникой</span></div>
      </div>
      <div className={styles.pairList} data-visible={visible}>
        {pairs.map((pair, index) => (
          <div className={styles.pairRow} key={index} style={{ "--delay": `${index * 80}ms` }}>
            <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
            <div className={styles.pairContent}>
              <span className={styles.beforeLine}>{pair.before}</span>
              <span className={styles.afterLine}><Clover />{pair.after}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function VariantThree() {
  const [active, setActive] = useState(0);
  const previous = () => setActive((value) => (value + pairs.length - 1) % pairs.length);
  const next = () => setActive((value) => (value + 1) % pairs.length);

  return (
    <section className={styles.variant} aria-label="Вариант 3">
      <div className={`${styles.variantHead} ${styles.focusHead}`}><span className={styles.variantLabel}>Вариант 3</span><span className={styles.counter}>{String(active + 1).padStart(2, "0")} / 07</span></div>
      <div className={styles.focusStage} key={active} aria-live="polite">
        <div className={styles.focusBefore}><span>Без ЕС Клиники</span><p>{pairs[active].before}</p></div>
        <div className={styles.focusTransition} aria-hidden="true"><i /><Clover /><i /></div>
        <div className={styles.focusAfter}><span>С ЕС Клиникой</span><p>{pairs[active].after}</p></div>
      </div>
      <div className={styles.focusNav}>
        <button type="button" onClick={previous} aria-label="Предыдущая пара">←</button>
        <div className={styles.dots} aria-label="Выбрать пару">{pairs.map((_, index) => <button type="button" key={index} aria-label={`Пара ${index + 1}`} aria-current={active === index ? "true" : undefined} onClick={() => setActive(index)} />)}</div>
        <button type="button" onClick={next} aria-label="Следующая пара">→</button>
      </div>
    </section>
  );
}

export default function ComparisonLab() {
  return <main className={styles.page}><VariantOne /><VariantTwo /><VariantThree /></main>;
}
