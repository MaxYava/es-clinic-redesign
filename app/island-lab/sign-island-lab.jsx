"use client";

import { useState } from "react";
import Image from "next/image";
import s from "./sign-island-lab.module.css";

const before = "Самостоятельно ищете врача и пытаетесь понять, кому можно доверять";
const after = "Команда подбирает специалиста под конкретную задачу и отвечает за медицинскую маршрутизацию";

export default function SignIslandLab() {
  const [living, setLiving] = useState(false);

  return (
    <main className={s.page}>
      <header className={s.header}>
        <a href="/" className={s.back}>← На главную</a>
        <span className={s.brand}>✣ ЕС Клиника</span>
        <span className={s.labTag}>Локальный визуальный тест</span>
      </header>
      <div className={s.intro}>
        <p className={s.eyebrow}>Один вариант для проверки идеи</p>
        <h1>Внедрить единую систему управления здоровьем</h1>
        <p className={s.explain}>Каменный остров с настоящей деревянной табличкой. Наведите курсор или нажмите на остров, чтобы увидеть вариант с ЕС Клиникой.</p>
      </div>
      <section className={s.showcase} aria-label="Сравнение с ЕС Клиникой и без неё">
        <div className={s.state} aria-hidden="true">
          <span className={!living ? s.selected : ""}>Без ЕС Клиники</span>
          <span className={s.rule}><span className={living ? s.ruleActive : ""} /></span>
          <span className={living ? s.selected : ""}>С ЕС Клиникой</span>
        </div>
        <button
          className={`${s.artwork} ${living ? s.livingState : ""}`}
          type="button"
          aria-pressed={living}
          aria-label={`${living ? "С ЕС Клиникой. " + after : "Без ЕС Клиники. " + before}. Нажмите, чтобы сменить состояние.`}
          onPointerEnter={(event) => { if (event.pointerType === "mouse") setLiving(true); }}
          onPointerLeave={(event) => { if (event.pointerType === "mouse") setLiving(false); }}
          onClick={(event) => { if (event.nativeEvent.pointerType !== "mouse") setLiving((value) => !value); }}
        >
          <Image className={`${s.island} ${s.bare}`} src="/island-lab/sign-bare-engraved.webp" alt="" width={1400} height={933} sizes="(max-width: 700px) 650px, 1000px" priority />
          <Image className={`${s.island} ${s.green}`} src="/island-lab/sign-living.webp" alt="" width={1400} height={933} sizes="(max-width: 700px) 650px, 1000px" priority />
          <span className={s.lettering} aria-hidden="true">{after}</span>
        </button>
        <p className={s.hint}>Наведите на остров · на телефоне нажмите</p>
      </section>
      <p className={s.footer}>Пробный блок доступен только на этой странице. Блок на главной пока не изменён.</p>
    </main>
  );
}
