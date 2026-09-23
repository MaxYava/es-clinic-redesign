"use client";

import { useState } from "react";
import s from "./precise-island.module.css";

const before = "Самостоятельно ищете врача и пытаетесь понять, кому можно доверять";
const after = "Команда подбирает специалиста под конкретную задачу и отвечает за медицинскую маршрутизацию";

export default function PreciseIsland() {
  const [living, setLiving] = useState(false);

  return <main className={s.page}>
    <header className={s.header}>
      <a href="/" className={s.back}>← На главную</a>
      <span className={s.brand}>✣ ЕС Клиника</span>
      <span className={s.labTag}>Локальный визуальный тест</span>
    </header>

    <div className={s.intro}>
      <p className={s.eyebrow}>Парящий остров · высеченная табличка</p>
      <h1>Внедрить единую систему управления здоровьем</h1>
      <p className={s.explain}>Наведите на остров: камень оживёт, а надпись на табличке покажет, что меняется с ЕС Клиникой.</p>
    </div>

    <section className={s.showcase} aria-label="Сравнение с ЕС Клиникой и без неё">
      <div className={s.state} aria-hidden="true">
        <span className={!living ? s.selected : ""}>Без ЕС Клиники</span>
        <span className={s.rule}><span className={living ? s.ruleActive : ""} /></span>
        <span className={living ? s.selected : ""}>С ЕС Клиникой</span>
      </div>

      <div className={s.stage}>
        <button
          className={`${s.artwork} ${living ? s.livingState : ""}`}
          type="button"
          aria-pressed={living}
          aria-label={`${living ? "С ЕС Клиникой. " + after : "Без ЕС Клиники. " + before}. Нажмите, чтобы сменить состояние.`}
          onPointerEnter={(event) => { if (event.pointerType === "mouse") setLiving(true); }}
          onPointerLeave={(event) => { if (event.pointerType === "mouse") setLiving(false); }}
          onClick={(event) => { if (event.nativeEvent.pointerType !== "mouse") setLiving(value => !value); }}
        >
          <img className={s.bare} src="/island-lab/generated-stone-bare-warm.png" alt="" draggable="false" />
          <img className={s.green} src="/island-lab/generated-stone-living-warm.png" alt="" draggable="false" />
        </button>
      </div>
      <p className={s.hint}>Наведите на остров · на телефоне нажмите</p>
    </section>
  </main>;
}
