"use client";

import Image from "next/image";
import { useState } from "react";
import copy from "../data/copy.json";
import s from "./variants.module.css";

const steps = [
  "Выбор специалиста",
  "История семьи",
  "Передача контекста",
  "Медицинские мнения",
  "Сроки и динамика",
  "Организация",
  "Следующий шаг",
].map((title, index) => ({
  title,
  before: copy[39 + index * 2],
  after: copy[40 + index * 2],
}));

const versions = [
  { title: "Атлас", motion: "Проявление", detail: "Один лист. Схема и смысл меняются прямо на нём." },
  { title: "Досье", motion: "Перелистывание", detail: "Личный медицинский документ с мягким поворотом страницы." },
  { title: "Маршрут", motion: "Движение по линии", detail: "Все семь ситуаций — части одного непрерывного пути." },
];

function Clover({ className = "" }) {
  return <Image className={className} src="/assets/clover.svg" width={25} height={25} alt="" />;
}

function Motif({ index, guided }) {
  const shared = {
    0: {
      before: <><circle cx="65" cy="119" r="16" /><path d="M 82 119 C 150 119 149 35 244 35 M 82 119 H 244 M 82 119 C 150 119 149 203 244 203" /><circle cx="258" cy="35" r="14" /><circle cx="258" cy="119" r="14" /><circle cx="258" cy="203" r="14" /></>,
      after: <><circle cx="65" cy="119" r="16" /><path d="M 82 119 H 174 H 259" /><circle cx="174" cy="119" r="19" /><circle cx="259" cy="119" r="23" /><path d="m 249 119 7 7 14 -18" /></>,
    },
    1: {
      before: <><rect x="35" y="47" width="77" height="103" rx="3" transform="rotate(-14 35 47)" /><rect x="150" y="25" width="77" height="103" rx="3" transform="rotate(9 150 25)" /><rect x="219" y="118" width="77" height="103" rx="3" transform="rotate(-7 219 118)" /><path d="M 49 75 H 93 M 49 90 H 84 M 163 54 H 208 M 163 70 H 197 M 234 143 H 278" /></>,
      after: <><path d="M 40 68 H 124 L 143 85 H 292 V 210 H 40 Z" /><path d="M 40 99 H 292 M 78 134 H 250 M 78 158 H 225 M 78 182 H 237" /><circle cx="263" cy="69" r="18" /><path d="m 255 69 6 6 11 -14" /></>,
    },
    2: {
      before: <><circle cx="52" cy="120" r="22" /><path d="M 76 120 C 123 120 135 39 197 39 M 76 120 H 197 M 76 120 C 123 120 135 201 197 201" /><rect x="197" y="18" width="86" height="43" rx="18" /><rect x="197" y="99" width="86" height="43" rx="18" /><rect x="197" y="180" width="86" height="43" rx="18" /><path d="M 211 40 H 265 M 211 121 H 265 M 211 202 H 265" /></>,
      after: <><circle cx="47" cy="120" r="20" /><path d="M 67 120 H 128 M 213 120 H 270" /><rect x="128" y="73" width="85" height="94" rx="4" /><path d="M 145 97 H 196 M 145 116 H 196 M 145 135 H 183" /><circle cx="280" cy="120" r="24" /></>,
    },
    3: {
      before: <><path d="M 34 39 H 120 L 143 65 L 120 90 H 34 Z M 177 26 H 273 L 291 51 L 273 77 H 177 Z M 75 151 H 185 L 210 177 L 185 204 H 75 Z" /><path d="M 52 64 H 105 M 195 51 H 262 M 95 178 H 174" /></>,
      after: <><path d="M 37 40 H 130 M 37 119 H 130 M 37 198 H 130 M 130 40 C 203 40 179 119 226 119 M 130 119 H 226 M 130 198 C 203 198 179 119 226 119" /><circle cx="247" cy="119" r="30" /><path d="m 235 119 9 9 18 -22" /></>,
    },
    4: {
      before: <><rect x="31" y="36" width="86" height="77" rx="6" transform="rotate(-9 31 36)" /><rect x="204" y="41" width="86" height="77" rx="6" transform="rotate(8 204 41)" /><rect x="105" y="150" width="86" height="77" rx="6" transform="rotate(-5 105 150)" /><path d="M 44 61 H 103 M 216 66 H 275 M 119 175 H 176" /></>,
      after: <><path d="M 35 127 H 291" /><circle cx="56" cy="127" r="12" /><circle cx="128" cy="127" r="12" /><circle cx="202" cy="127" r="12" /><circle cx="275" cy="127" r="12" /><path d="M 56 99 V 127 M 128 127 V 160 M 202 99 V 127 M 275 127 V 160 M 41 82 H 71 M 113 179 H 143 M 187 82 H 217 M 260 179 H 290" /></>,
    },
    5: {
      before: <><circle cx="163" cy="120" r="19" /><path d="M 143 110 60 48 M 182 110 264 48 M 143 130 60 192 M 182 130 264 192" /><circle cx="53" cy="44" r="16" /><circle cx="272" cy="44" r="16" /><circle cx="53" cy="196" r="16" /><circle cx="272" cy="196" r="16" /></>,
      after: <><circle cx="45" cy="120" r="20" /><path d="M 65 120 H 137 M 201 120 H 250 M 252 120 V 47 M 252 120 V 194" /><circle cx="169" cy="120" r="32" /><circle cx="276" cy="45" r="17" /><circle cx="276" cy="120" r="17" /><circle cx="276" cy="196" r="17" /><path d="M 153 120 H 185 M 169 104 V 136" /></>,
    },
    6: {
      before: <><circle cx="47" cy="120" r="17" /><path d="M 64 120 H 139 M 139 120 C 180 120 168 40 253 40 M 139 120 H 253 M 139 120 C 180 120 168 200 253 200" /><circle cx="267" cy="40" r="12" /><circle cx="267" cy="120" r="12" /><circle cx="267" cy="200" r="12" /></>,
      after: <><circle cx="37" cy="120" r="15" /><path d="M 52 120 H 293" /><circle cx="121" cy="120" r="14" /><circle cx="207" cy="120" r="14" /><circle cx="293" cy="120" r="20" /><path d="m 285 120 6 6 12 -15" /></>,
    },
  };
  const drawing = shared[index];
  return <svg className={`${s.motif} ${guided ? s.motifGuided : ""}`} viewBox="0 0 330 240" role="img" aria-label={guided ? "Схема с ЕС Клиникой" : "Схема без ЕС Клиники"}>
    <g className={s.motifBefore}>{drawing.before}</g>
    <g className={s.motifAfter}>{drawing.after}</g>
  </svg>;
}

export default function Variants() {
  const [variant, setVariant] = useState(0);
  const [index, setIndex] = useState(0);
  const [locked, setLocked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const guided = locked || hovered;
  const step = steps[index];

  function selectStep(next) {
    setIndex(next);
    setHovered(false);
  }

  const interaction = {
    onPointerEnter: event => { if (event.pointerType === "mouse" && !locked) setHovered(true); },
    onPointerLeave: event => { if (event.pointerType === "mouse") setHovered(false); },
    onClick: () => { setLocked(!locked); setHovered(false); },
  };

  return <main className={s.page}>
    <header className={s.header}>
      <a href="/care-plan" className={s.back}>← Текущий прототип</a>
      <span className={s.brand}><Clover /> ЕС Клиника</span>
      <span className={s.lab}>Дизайн-лаборатория</span>
    </header>
    <div className={s.shell}>
      <div className={s.intro}>
        <p className={s.eyebrow}>Персональный медицинский план · развитие концепции</p>
        <h1>Один план. Три способа рассказать историю семьи.</h1>
        <p>Выберите подачу и переключайте ситуации. Слова остаются теми же; меняются материал, композиция и то, как следующий пункт входит в кадр.</p>
      </div>

      <div className={s.versionTabs} role="tablist" aria-label="Варианты оформления плана">
        {versions.map((item, i) => <button key={item.title} role="tab" type="button" aria-selected={variant === i} className={variant === i ? s.versionActive : ""} onClick={() => setVariant(i)}>
          <span className={s.versionIndex}>0{i + 1} / {item.motion}</span>
          <strong>{item.title}</strong>
          <small>{item.detail}</small>
        </button>)}
      </div>

      <div className={s.controls}>
        <div className={s.stageNav} aria-label="Пункты сравнения">
          {steps.map((item, i) => <button type="button" key={item.title} aria-current={index === i ? "step" : undefined} className={index === i ? s.stageActive : ""} onClick={() => selectStep(i)}>
            <span>{String(i + 1).padStart(2, "0")}</span><strong>{item.title}</strong>
          </button>)}
        </div>
        <div className={s.modeSwitch} aria-label="Состояние плана">
          <button type="button" aria-pressed={!guided} className={!guided ? s.modeActive : ""} onClick={() => { setLocked(false); setHovered(false); }}>Без ЕС Клиники</button>
          <button type="button" aria-pressed={guided} className={guided ? s.modeActive : ""} onClick={() => { setLocked(true); setHovered(false); }}>С ЕС Клиникой</button>
        </div>
      </div>

      {variant === 0 && <button type="button" className={`${s.scene} ${s.atlas}`} aria-label="Проявление содержания на листе. Нажмите для смены состояния." aria-pressed={guided} {...interaction}>
        <div className={s.atlasTop}><span>ЕС КЛИНИКА / ПЕРСОНАЛЬНЫЙ ПЛАН</span><span>{String(index + 1).padStart(2, "0")} / 07</span></div>
        <div className={s.atlasBody} key={index}>
          <div className={s.atlasCopy}>
            <span className={s.overline}>{guided ? "С ЕС КЛИНИКОЙ" : "БЕЗ ЕС КЛИНИКИ"}</span>
            <h2>{step.title}</h2>
            <div className={s.lineOfCopy}><p className={guided ? s.concealed : ""}>{step.before}</p><p className={!guided ? s.concealed : ""}>{step.after}</p></div>
          </div>
          <div className={s.atlasArt}><Motif index={index} guided={guided} /><span>0{index + 1}</span></div>
        </div>
        <div className={s.atlasFoot}><Clover /><span>Медицинский Family Office</span><span>План / {step.title}</span></div>
      </button>}

      {variant === 1 && <button type="button" className={`${s.scene} ${s.folio}`} aria-label="Перелистывание семейного досье. Нажмите для смены состояния." aria-pressed={guided} {...interaction}>
        <Image src="/care-concepts/care-folio-blank.png" alt="" fill sizes="(max-width: 760px) 100vw, 1450px" />
        <div className={s.folioSpread}>
          <div className={s.folioLeft} key={`left-${index}`}>
            <span className={s.folioKicker}>01 / БЕЗ ЕС КЛИНИКИ</span>
            <span className={s.folioNumber}>{String(index + 1).padStart(2, "0")}</span>
            <h2>{step.title}</h2>
            <p>{step.before}</p>
          </div>
          <div className={`${s.folioRight} ${guided ? s.folioRevealed : ""}`} key={`right-${index}`}>
            <span className={s.folioKicker}>02 / С ЕС КЛИНИКОЙ</span>
            <div className={s.folioEmblem}><Clover /></div>
            <Motif index={index} guided />
            <p>{step.after}</p>
          </div>
        </div>
        <span className={s.folioHint}>{guided ? "План открыт" : "Наведите, чтобы открыть решение"}</span>
      </button>}

      {variant === 2 && <button type="button" className={`${s.scene} ${s.route} ${guided ? s.routeGuided : ""}`} aria-label="Движение по маршруту. Нажмите для смены состояния." aria-pressed={guided} {...interaction}>
        <div className={s.routeHeader}><span>МЕДИЦИНСКИЙ ПЛАН СЕМЬИ</span><Clover /><span>07 СИТУАЦИЙ</span></div>
        <div className={s.routeTrack}><span className={s.routeProgress} style={{ width: `${((index + 1) / 7) * 100}%` }} />{steps.map((item, i) => <span key={item.title} className={i === index ? s.routeDotActive : ""} />)}</div>
        <div className={s.routeBody} key={index}>
          <span className={s.routeNumber}>{String(index + 1).padStart(2, "0")}</span>
          <div className={s.routeCopy}><span className={s.overline}>{guided ? "С ЕС КЛИНИКОЙ" : "БЕЗ ЕС КЛИНИКИ"}</span><h2>{step.title}</h2><p>{guided ? step.after : step.before}</p></div>
          <Motif index={index} guided={guided} />
        </div>
        <div className={s.routeFooter}><span>Постоянное сопровождение</span><span>ЕС Клиника ©</span></div>
      </button>}

      <div className={s.underScene}>
        <p><strong>{versions[variant].motion}.</strong> {versions[variant].detail} Наведение показывает состояние с ЕС Клиникой; нажатие фиксирует его. {variant === 1 && <a className={s.fullDossierLink} href="/care-dossier">Открыть полное досье с перелистыванием →</a>}</p>
        <div className={s.nextButtons}>
          <button type="button" onClick={() => selectStep((index + steps.length - 1) % steps.length)} aria-label="Предыдущий пункт">←</button>
          <span>{String(index + 1).padStart(2, "0")} / 07</span>
          <button type="button" onClick={() => selectStep((index + 1) % steps.length)} aria-label="Следующий пункт">→</button>
        </div>
      </div>
    </div>
  </main>;
}
