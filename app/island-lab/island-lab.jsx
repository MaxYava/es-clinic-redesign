"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./island-lab.module.css";

const before = "Самостоятельно ищете врача и пытаетесь понять, кому можно доверять";
const after = "Команда подбирает специалиста под конкретную задачу и отвечает за медицинскую маршрутизацию";

const islands = [
  { id: "a", name: "Светлая плита", note: "Надпись на верхней каменной плоскости" },
  { id: "b", name: "Тёмная скала", note: "Надпись на передней грани" },
  { id: "c", name: "Тёплый массив", note: "Надпись на каменной вставке" },
];

function Island({ variant, index }) {
  const [active, setActive] = useState(false);

  return (
    <article className={`${styles.island} ${styles[`variant${variant.id.toUpperCase()}`]} ${active ? styles.active : ""}`}>
      <div className={styles.caption}>
        <span className={styles.number}>0{index + 1} / 03</span>
        <h2>{variant.name}</h2>
        <p>{variant.note}</p>
      </div>
      <button
        className={styles.artwork}
        type="button"
        aria-pressed={active}
        aria-label={`${variant.name}. ${active ? "С ЕС Клиникой. " + after : "Без ЕС Клиники. " + before}. Нажмите, чтобы сменить состояние.`}
        onPointerEnter={(event) => { if (event.pointerType === "mouse") setActive(true); }}
        onPointerLeave={(event) => { if (event.pointerType === "mouse") setActive(false); }}
        onClick={(event) => {
          if (event.nativeEvent.pointerType !== "mouse") setActive((value) => !value);
        }}
      >
        <span className={styles.halo} aria-hidden="true" />
        <Image className={`${styles.rock} ${styles.bare}`} src={`/island-lab/${variant.id}-bare.webp`} alt="" width={1100} height={733} sizes="(max-width: 700px) 100vw, 660px" priority={index === 0} />
        <Image className={`${styles.rock} ${styles.living}`} src={`/island-lab/${variant.id}-living.webp`} alt="" width={1100} height={733} sizes="(max-width: 700px) 100vw, 660px" priority={index === 0} />
        <span className={styles.inscription} aria-hidden="true">
          <span className={styles.before}>{before}</span>
          <span className={styles.after}>{after}</span>
        </span>
        <span className={styles.wind} aria-hidden="true"><i /><i /><i /></span>
      </button>
      <div className={styles.state} aria-hidden="true">
        <span>Без ЕС Клиники</span>
        <span className={styles.line}><span /></span>
        <span>С ЕС Клиникой</span>
      </div>
    </article>
  );
}

export default function IslandLab() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.back}>← На главную</a>
        <span className={styles.brand}>✣ ЕС Клиника</span>
        <span className={styles.labTag}>Локальный визуальный тест</span>
      </header>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Исследование визуального языка</p>
        <h1>Внедрить единую систему управления здоровьем</h1>
        <p className={styles.explain}>Три варианта одного сюжета и одной пары текстов. Наведите курсор на остров, чтобы увидеть, как камень оживает вместе с медицинским сопровождением.</p>
      </div>
      <div className={styles.stage}>
        <span className={styles.orbit} aria-hidden="true" />
        {islands.map((variant, index) => <Island key={variant.id} variant={variant} index={index} />)}
      </div>
      <p className={styles.footer}>Пробная страница для выбора направления. На главной странице блок пока не изменён.</p>
    </main>
  );
}
