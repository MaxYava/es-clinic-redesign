"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import copy from "../data/copy.json";
import s from "./dossier.module.css";

const titles = [
  "Выбор специалиста",
  "История семьи",
  "Передача контекста",
  "Медицинские мнения",
  "Сроки и динамика",
  "Организация",
  "Следующий шаг",
];

const situations = titles.map((title, index) => ({
  title,
  before: copy[39 + index * 2],
  after: copy[40 + index * 2],
}));

function PageIllustration({ spread, left, active }) {
  if (spread < 4 || spread > 6) return null;

  return <svg
    className={`${s.illustration} ${left ? s.illustrationBefore : s.illustrationAfter} ${active ? s.illustrationActive : ""}`}
    viewBox="0 0 420 132"
    role="img"
    aria-label={spread === 4 ? "Несколько мнений складываются в общую картину" : spread === 5 ? "План наблюдения связывает важные сроки" : "Организационные вопросы проходят через одного медицинского менеджера"}
  >
    {spread === 4 && (left ? <>
      <path d="M 38 30 H 142 M 174 60 H 278 M 67 104 H 183" />
      <circle cx="38" cy="30" r="9" /><circle cx="174" cy="60" r="9" /><circle cx="67" cy="104" r="9" />
      <path className={s.faintStroke} d="M 154 30 C 210 18 250 29 285 49 M 289 61 C 310 67 323 71 345 86 M 193 104 C 240 107 286 100 324 92" />
    </> : <>
      <path className={s.drawStroke} d="M 33 24 C 133 24 158 48 265 65 M 33 65 H 265 M 33 106 C 133 106 158 82 265 65 M 265 65 H 342" />
      <circle cx="33" cy="24" r="8" /><circle cx="33" cy="65" r="8" /><circle cx="33" cy="106" r="8" />
      <circle className={s.finalNode} cx="364" cy="65" r="21" />
      <path d="m 355 65 7 7 13 -15" />
    </>)}
    {spread === 5 && (left ? <>
      <circle cx="70" cy="32" r="12" /><circle cx="276" cy="23" r="12" /><circle cx="173" cy="99" r="12" /><circle cx="353" cy="95" r="12" />
      <path className={s.faintStroke} d="M 90 32 153 78 M 194 84 258 39 M 290 36 338 78" />
    </> : <>
      <path className={s.drawStroke} d="M 32 67 H 392" />
      <circle cx="62" cy="67" r="11" /><circle cx="166" cy="67" r="11" /><circle cx="270" cy="67" r="11" /><circle cx="374" cy="67" r="11" />
      <path d="M 62 54 V 25 M 166 79 V 108 M 270 54 V 25 M 374 79 V 108" />
      <path className={s.faintStroke} d="M 42 20 H 82 M 146 113 H 186 M 250 20 H 290 M 354 113 H 394" />
    </>)}
    {spread === 6 && (left ? <>
      <circle cx="210" cy="65" r="23" />
      <circle cx="50" cy="20" r="10" /><circle cx="365" cy="20" r="10" /><circle cx="50" cy="111" r="10" /><circle cx="365" cy="111" r="10" />
      <path className={s.faintStroke} d="M 69 25 181 56 M 346 25 239 56 M 69 106 181 74 M 346 106 239 74" />
    </> : <>
      <circle cx="42" cy="65" r="18" /><circle className={s.finalNode} cx="198" cy="65" r="27" />
      <circle cx="366" cy="22" r="10" /><circle cx="366" cy="65" r="10" /><circle cx="366" cy="108" r="10" />
      <path className={s.drawStroke} d="M 60 65 H 171 M 225 65 H 321 M 321 22 V 108 M 321 22 H 356 M 321 65 H 356 M 321 108 H 356" />
      <path d="M 186 65 H 210 M 198 53 V 77" />
    </>)}
  </svg>;
}

function PageContent({ side, spread, active = false }) {
  const left = side === "left";
  const overview = spread === 0;
  const situation = overview ? null : situations[spread - 1];

  return <div className={`${s.pageContent} ${left ? s.leftContent : s.rightContent}`}>
    <div className={s.pageHeader}>
      <span>{left ? "БЕЗ ЕС КЛИНИКИ" : "С ЕС КЛИНИКОЙ"}</span>
      {!left && <Image src="/assets/clover.svg" width={19} height={19} alt="" />}
    </div>

    {overview ? <>
      <ol className={s.comparisonList}>
        {situations.map((item, index) => <li key={item.title}>
          <span>{left ? item.before : item.after}</span>
        </li>)}
      </ol>
    </> : <>
      <div className={s.detailTop}>
        <span>СЕМЕЙНОЕ МЕДИЦИНСКОЕ ДОСЬЕ</span>
      </div>
      <div className={s.detailBody}>
        <h2>{situation.title}</h2>
        <span className={s.detailRule} />
        <p>{left ? situation.before : situation.after}</p>
        <PageIllustration spread={spread} left={left} active={active} />
      </div>
      <div className={s.detailBottom}>
        <span>{spread}</span>
      </div>
    </>}
  </div>;
}

export default function CareDossier() {
  const [spread, setSpread] = useState(0);
  const [turn, setTurn] = useState(null);
  const [moving, setMoving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const gesture = useRef(null);
  const drag = useRef(null);
  const bookPages = useRef(null);
  const leaf = useRef(null);

  useEffect(() => {
    if (!turn || turn.manual) return;
    const frame = requestAnimationFrame(() => setMoving(true));
    const fallback = setTimeout(() => {
      setSpread(turn.to);
      setTurn(null);
      setMoving(false);
    }, 1350);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(fallback);
    };
  }, [turn]);

  useEffect(() => {
    if (!turn?.manual || (!moving && !canceling)) return;
    const fallback = setTimeout(() => {
      if (!canceling) setSpread(turn.to);
      setTurn(null);
      setMoving(false);
      setCanceling(false);
    }, 950);
    return () => clearTimeout(fallback);
  }, [turn, moving, canceling]);

  function goTo(target) {
    if (turn || target === spread || target < 0 || target > situations.length) return;
    if (window.matchMedia("(max-width: 760px), (prefers-reduced-motion: reduce)").matches) {
      setSpread(target);
      return;
    }
    setMoving(false);
    setTurn({ from: spread, to: target, direction: target > spread ? "forward" : "backward" });
  }

  function finishTurn(event) {
    if (!turn || event.target !== event.currentTarget || event.propertyName !== "transform") return;
    if (!canceling) setSpread(turn.to);
    setTurn(null);
    setMoving(false);
    setCanceling(false);
    setDragging(false);
  }

  function pointerDown(event) {
    if (event.pointerType !== "mouse") {
      gesture.current = event.clientX;
      return;
    }
    if (event.button !== 0 || turn || window.matchMedia("(max-width: 760px), (prefers-reduced-motion: reduce)").matches) return;
    const bounds = bookPages.current?.getBoundingClientRect();
    if (!bounds || event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) return;
    const direction = event.clientX >= bounds.left + bounds.width / 2 ? "forward" : "backward";
    const target = spread + (direction === "forward" ? 1 : -1);
    if (target < 0 || target > situations.length) return;
    drag.current = { pointerId: event.pointerId, startX: event.clientX, width: bounds.width / 2, direction, progress: 0 };
    setDragging(true);
    setMoving(false);
    setCanceling(false);
    setTurn({ from: spread, to: target, direction, manual: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function pointerMove(event) {
    const current = drag.current;
    if (!current || event.pointerId !== current.pointerId || !leaf.current) return;
    const distance = current.direction === "forward" ? current.startX - event.clientX : event.clientX - current.startX;
    current.progress = Math.max(0, Math.min(1, distance / (current.width * 1.1)));
    const angle = current.direction === "forward" ? -180 : 180;
    leaf.current.style.transition = "none";
    leaf.current.style.transform = `rotateY(${angle * current.progress}deg)`;
  }

  function pointerUp(event) {
    if (event.pointerType === "mouse") {
      const current = drag.current;
      if (!current || event.pointerId !== current.pointerId) return;
      drag.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      setDragging(false);
      if (!leaf.current || current.progress < .025) {
        setTurn(null);
        return;
      }
      const complete = current.progress >= .32;
      leaf.current.style.transition = complete
        ? "transform .78s cubic-bezier(.2,.73,.16,1)"
        : "transform .5s cubic-bezier(.2,.73,.16,1)";
      leaf.current.style.transform = `rotateY(${complete ? (current.direction === "forward" ? -180 : 180) : 0}deg)`;
      if (complete) setMoving(true);
      else setCanceling(true);
      return;
    }
    if (gesture.current === null) return;
    const distance = event.clientX - gesture.current;
    gesture.current = null;
    if (Math.abs(distance) < 65) return;
    goTo(spread + (distance < 0 ? 1 : -1));
  }

  function pointerCancel(event) {
    if (event.pointerType !== "mouse" || !drag.current) return;
    drag.current = null;
    setDragging(false);
    if (!leaf.current) {
      setTurn(null);
      return;
    }
    leaf.current.style.transition = "transform .5s ease";
    leaf.current.style.transform = "rotateY(0deg)";
    setCanceling(true);
  }

  const baseLeft = turn?.direction === "backward" ? turn.to : spread;
  const baseRight = turn?.direction === "forward" ? turn.to : spread;
  const currentTitle = spread === 0 ? "Все семь ситуаций" : situations[spread - 1].title;

  return <main className={s.page}>
    <header className={s.header}>
      <a href="/care-plan-variants" className={s.back}>← К вариантам плана</a>
      <span className={s.brand}><Image src="/assets/clover.svg" width={22} height={22} alt="" /> ЕС Клиника</span>
      <span className={s.headerNote}>Семейное медицинское досье</span>
    </header>

    <div className={s.shell}>
      <div className={s.intro}>
        <p className={s.eyebrow}>Интерактивный прототип · персональный план</p>
        <h1>Внедрить единую систему управления здоровьем</h1>
        <p>Откройте любой пункт досье. На каждой паре страниц слева остаётся ситуация без ЕС Клиники, справа — то, как её решает постоянная медицинская команда.</p>
      </div>

      <nav className={s.index} aria-label="Развороты досье">
        <button type="button" className={spread === 0 ? s.activeIndex : ""} aria-current={spread === 0 ? "page" : undefined} onClick={() => goTo(0)} disabled={Boolean(turn)}>
          <strong>Все пункты</strong>
        </button>
        {situations.map((item, index) => <button key={item.title} type="button" className={spread === index + 1 ? s.activeIndex : ""} aria-current={spread === index + 1 ? "page" : undefined} onClick={() => goTo(index + 1)} disabled={Boolean(turn)}>
          <strong>{item.title}</strong>
        </button>)}
      </nav>

      <div className={`${s.bookScene} ${dragging ? s.dragging : ""}`} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerCancel}>
        <Image className={s.bookPhoto} src="/care-concepts/care-folio-blank.png" alt="" fill sizes="(max-width: 760px) 100vw, 1500px" priority />
        <div className={s.bookPages} ref={bookPages}>
          <div className={`${s.pageSheet} ${s.leftSheet}`}><PageContent side="left" spread={baseLeft} active={!turn} /></div>
          <div className={`${s.pageSheet} ${s.rightSheet}`}><PageContent side="right" spread={baseRight} active={!turn} /></div>
          <span className={s.spine} aria-hidden="true" />
          {turn && <div
            ref={leaf}
            className={`${s.turningLeaf} ${turn.direction === "forward" ? s.turnForward : s.turnBackward} ${moving ? s.leafMoving : ""}`}
            onTransitionEnd={finishTurn}
            aria-hidden="true"
          >
            <div className={`${s.leafFace} ${s.leafFront}`}>
              <PageContent side={turn.direction === "forward" ? "right" : "left"} spread={turn.from} />
            </div>
            <div className={`${s.leafFace} ${s.leafBack}`}>
              <PageContent side={turn.direction === "forward" ? "left" : "right"} spread={turn.to} />
            </div>
          </div>}
        </div>
      </div>

      <div className={s.bookFooter}>
        <span className={s.caption}>Зажмите страницу левой кнопкой мыши и потяните её через корешок.</span>
        <div className={s.pager}>
          <button type="button" onClick={() => goTo(spread - 1)} disabled={spread === 0 || Boolean(turn)} aria-label="Предыдущий разворот">←</button>
          <span>{currentTitle}</span>
          <button type="button" onClick={() => goTo(spread + 1)} disabled={spread === situations.length || Boolean(turn)} aria-label="Следующий разворот">→</button>
        </div>
      </div>
    </div>
  </main>;
}
