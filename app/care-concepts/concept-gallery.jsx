"use client";

import Image from "next/image";
import { useState } from "react";
import s from "./concept-gallery.module.css";

const before = "Самостоятельно ищете врача и пытаетесь понять, кому можно доверять";
const after = "Команда подбирает специалиста под конкретную задачу и отвечает за медицинскую маршрутизацию";

const concepts = [
  {
    id: "plan",
    title: "Персональный план",
    image: "/care-concepts/care-plan-diptych.png",
    alt: "Бумажный медицинский план: множество маршрутов превращаются в один понятный путь",
    note: "Физический план на столе: множество равнозначных направлений собирается в один маршрут — к специалисту, обследованию и сопровождению.",
    badge: "Рекомендуемый вариант",
  },
  {
    id: "dossier",
    title: "Досье семьи",
    image: "/care-concepts/family-dossier-refined.png",
    alt: "Разрозненные медицинские документы становятся упорядоченным семейным досье",
    note: "Разрозненные заключения и снимки укладываются в единое семейное досье с выбранным специалистом и последовательностью действий.",
  },
  {
    id: "route",
    title: "Маршрут помощи",
    image: "/care-concepts/care-route-diptych.png",
    alt: "Настенная схема медицинской помощи с подсвеченным маршрутом к специалисту",
    note: "Архитектурный рельеф в клинике: из нескольких медицинских направлений мягко проявляется один продуманный путь.",
  },
  {
    id: "door",
    title: "Открытая дверь",
    image: "/care-concepts/consultation-door-diptych.png",
    alt: "Одна из дверей клиники открывается в кабинет подобранного врача",
    note: "Закрытая дверь в кабинеты сменяется конкретным приглашением к врачу. Самая человечная и буквальная метафора.",
  },
];

export default function ConceptGallery() {
  const [selected, setSelected] = useState("plan");
  const [living, setLiving] = useState(false);
  const concept = concepts.find((item) => item.id === selected);

  return <main className={s.page}>
    <header className={s.header}>
      <a href="/" className={s.back}>← На главную</a>
      <span className={s.brand}>✣ ЕС Клиника</span>
      <span className={s.lab}>Локальные визуальные концепции</span>
    </header>

    <div className={s.shell}>
      <div className={s.intro}>
        <p className={s.eyebrow}>Визуальное исследование</p>
        <h1>Внедрить единую систему управления здоровьем</h1>
        <p>Четыре способа показать переход от самостоятельного поиска к медицинскому маршруту с ЕС Клиникой. Наведите на изображение или нажмите на него.</p>
      </div>

      <nav className={s.tabs} aria-label="Варианты визуального решения">
        {concepts.map((item, index) => <button
          key={item.id}
          type="button"
          className={`${s.tab} ${selected === item.id ? s.activeTab : ""}`}
          aria-pressed={selected === item.id}
          onClick={() => { setSelected(item.id); setLiving(false); }}
        >
          <span className={s.tabNumber}>0{index + 1}</span>
          {item.title}
        </button>)}
      </nav>

      <section className={s.feature} aria-label={concept.title}>
        <div className={s.details}>
          <span className={s.kicker}>{concept.badge || "Вариант концепции"}</span>
          <h2>{concept.title}</h2>
          <p className={s.note}>{concept.note}</p>
          {concept.id === "plan" && <a className={s.fullPreview} href="/care-plan">Открыть крупный прототип ↗</a>}
          <div className={s.state} aria-hidden="true">
            <span className={!living ? s.current : ""}>Без ЕС Клиники</span>
            <span className={s.rule}><span className={living ? s.ruleActive : ""} /></span>
            <span className={living ? s.current : ""}>С ЕС Клиникой</span>
          </div>
          <div className={s.copy} aria-live="polite">
            <p className={living ? s.hiddenCopy : ""}>{before}</p>
            <p className={!living ? s.hiddenCopy : ""}>{after}</p>
          </div>
          <span className={s.hint}>Наведите на изображение · на телефоне нажмите</span>
        </div>

        <button
          className={`${s.visual} ${living ? s.living : ""}`}
          type="button"
          aria-pressed={living}
          aria-label={`${concept.title}. ${living ? "С ЕС Клиникой. " + after : "Без ЕС Клиники. " + before}. Нажмите для смены состояния.`}
          onPointerEnter={(event) => { if (event.pointerType === "mouse") setLiving(true); }}
          onPointerLeave={(event) => { if (event.pointerType === "mouse") setLiving(false); }}
          onClick={(event) => { if (event.nativeEvent.pointerType !== "mouse") setLiving(value => !value); }}
        >
          <span className={s.beforeImage}><Image src={concept.image} alt="" fill sizes="(max-width: 900px) 200vw, 1400px" priority /></span>
          <span className={s.afterImage}><Image src={concept.image} alt="" fill sizes="(max-width: 900px) 200vw, 1400px" /></span>
          <span className={s.imageCaption}>{living ? "С ЕС Клиникой" : "Без ЕС Клиники"}</span>
        </button>
      </section>
    </div>
  </main>;
}
