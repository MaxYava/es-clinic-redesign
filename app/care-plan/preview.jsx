"use client";

import Image from "next/image";
import { useState } from "react";
import copy from "../data/copy.json";
import s from "./preview.module.css";

const steps = [
  { title: "Выбор специалиста", subtitle: "От поиска к точному маршруту" },
  { title: "История семьи", subtitle: "От разрозненных данных к досье" },
  { title: "Передача контекста", subtitle: "Историю не приходится повторять" },
  { title: "Медицинские мнения", subtitle: "От разногласий к общей картине" },
  { title: "Сроки и динамика", subtitle: "Наблюдение по плану" },
  { title: "Организация", subtitle: "Одно окно для семьи" },
  { title: "Следующий шаг", subtitle: "Сопровождение до результата" },
].map((step, index) => ({ ...step, before: copy[39 + index * 2], after: copy[40 + index * 2] }));

// The same paper holds seven different arrangements; the content is real text and remains crisp at every size.
const plans = [
  {
    before: {
      nodes: [[110, 215, "Семья", "person"], [460, 75, "Врач 01", "doctor"], [460, 180, "Врач 02", "doctor"], [460, 285, "Врач 03", "doctor"], [760, 180, "Кому доверять?", "question"]],
      links: [[0, 1], [0, 2], [0, 3]],
    },
    after: {
      nodes: [[110, 215, "Семья", "person"], [415, 215, "Медицинская команда", "hub"], [750, 215, "Нужный специалист", "doctor"]],
      links: [[0, 1], [1, 2]],
    },
  },
  {
    before: {
      nodes: [[98, 84, "Анализы", "file"], [362, 261, "Снимки", "file"], [440, 59, "Заключения", "file"], [737, 220, "Назначения", "file"], [95, 280, "История", "file"]],
      links: [],
    },
    after: {
      frame: "folder",
      nodes: [[200, 210, "Анализы", "file"], [410, 210, "Заключения", "file"], [620, 210, "Назначения", "file"]],
      links: [],
    },
  },
  {
    before: {
      nodes: [[100, 215, "Семья", "person"], [520, 55, "Врач 01", "doctor"], [520, 180, "Врач 02", "doctor"], [520, 305, "Врач 03", "doctor"]],
      links: [[0, 1], [0, 2], [0, 3]],
      annotation: "Снова рассказывать всю историю",
    },
    after: {
      nodes: [[80, 215, "Семья", "person"], [365, 215, "Постоянный врач", "doctor"], [715, 215, "Новый специалист", "doctor"]],
      links: [[0, 1], [1, 2]],
      annotation: "История и динамика передаются вместе с пациентом",
    },
  },
  {
    before: {
      nodes: [[110, 85, "Мнение 01", "opinion"], [395, 155, "Мнение 02", "opinion"], [685, 95, "Мнение 03", "opinion"], [395, 315, "Что выбрать?", "question"]],
      links: [[0, 3], [1, 3], [2, 3]],
    },
    after: {
      nodes: [[95, 65, "Лечащий врач", "doctor"], [95, 285, "Второе мнение", "doctor"], [395, 175, "Консилиум", "hub"], [720, 175, "Целостная картина", "result"]],
      links: [[0, 2], [1, 2], [2, 3]],
    },
  },
  {
    before: {
      nodes: [[75, 67, "Проверить", "calendar"], [385, 305, "Пересдать", "calendar"], [620, 75, "Повторный визит", "calendar"], [120, 300, "Не забыть", "calendar"]],
      links: [],
      annotation: "Сроки нужно держать в памяти",
    },
    after: {
      frame: "timeline",
      nodes: [[95, 175, "Проверить", "milestone"], [315, 175, "Пересдать", "milestone"], [535, 175, "Оценить", "milestone"], [755, 175, "Наблюдать", "milestone"]],
      links: [[0, 1], [1, 2], [2, 3]],
    },
  },
  {
    before: {
      nodes: [[415, 175, "Семья", "person"], [80, 50, "Запись", "task"], [715, 55, "Обследование", "task"], [80, 310, "Выезд", "task"], [715, 300, "Госпитализация", "task"]],
      links: [[0, 1], [0, 2], [0, 3], [0, 4]],
    },
    after: {
      nodes: [[60, 175, "Семья", "person"], [350, 175, "Медицинский менеджер", "hub"], [745, 50, "Записи", "task"], [745, 175, "Обследования", "task"], [745, 300, "Лечение", "task"]],
      links: [[0, 1], [1, 2], [1, 3], [1, 4]],
    },
  },
  {
    before: {
      nodes: [[80, 175, "Семья", "person"], [390, 50, "Вариант 01", "question"], [390, 175, "Вариант 02", "question"], [390, 300, "Вариант 03", "question"], [750, 175, "Что дальше?", "question"]],
      links: [[0, 1], [0, 2], [0, 3]],
    },
    after: {
      nodes: [[45, 175, "Семья", "person"], [315, 175, "Следующий шаг", "hub"], [590, 175, "Сопровождение", "doctor"], [815, 175, "Результат", "result"]],
      links: [[0, 1], [1, 2], [2, 3]],
    },
  },
];

function PlanNode({ node, after }) {
  const [x, y, label, kind] = node;
  const width = kind === "person" ? 120 : kind === "hub" ? 240 : kind === "result" ? 190 : 185;
  const height = kind === "person" ? 98 : 78;
  const cx = x + width / 2;
  return <g className={s.node} data-kind={kind} data-after={after}>
    <rect x={x} y={y} width={width} height={height} rx={kind === "person" ? 49 : 9} />
    {kind === "person" && <g className={s.personIcon}><circle cx={x + 27} cy={y + 35} r="10" /><path d={`M ${x + 9} ${y + 68} Q ${x + 27} ${y + 41} ${x + 45} ${y + 68}`} /></g>}
    {kind === "file" && <path className={s.fileCorner} d={`M ${x + width - 34} ${y} V ${y + 21} H ${x + width - 12}`} />}
    {kind === "calendar" && <path className={s.calendarLine} d={`M ${x + 13} ${y + 21} H ${x + width - 13}`} />}
    <text x={kind === "person" ? x + 62 : cx} y={y + height / 2 + 6} textAnchor={kind === "person" ? "start" : "middle"}>{label}</text>
    {(kind === "hub" || kind === "result") && <circle className={s.seal} cx={x + width - 14} cy={y + 13} r="4" />}
  </g>;
}

function DiagramState({ state, after }) {
  const centers = state.nodes.map(([x, y, , kind]) => [x + (kind === "person" ? 60 : kind === "hub" ? 120 : kind === "result" ? 95 : 92), y + (kind === "person" ? 49 : 39)]);
  return <g className={after ? s.afterArt : s.beforeArt}>
    {state.frame === "folder" && <g className={s.folder}><rect x="130" y="83" width="745" height="280" rx="13" /><path d="M 130 130 H 875" /><text x="170" y="116">ЕДИНАЯ МЕДИЦИНСКАЯ ИСТОРИЯ СЕМЬИ</text></g>}
    {state.frame === "timeline" && <path className={s.timeline} d="M 110 214 H 860" />}
    {state.links.map(([from, to], i) => {
      const [x1, y1] = centers[from], [x2, y2] = centers[to];
      return <path key={i} className={after ? s.linkAfter : s.linkBefore} d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1} ${x2} ${y2}`} />;
    })}
    {state.nodes.map((node, i) => <PlanNode key={i} node={node} after={after} />)}
    {state.annotation && <text className={s.annotation} x="500" y="412" textAnchor="middle">{state.annotation}</text>}
  </g>;
}

function PlanSheet({ index, guided }) {
  const plan = plans[index];
  return <svg key={index} className={`${s.drawing} ${guided ? s.showAfter : ""}`} viewBox="0 0 1000 510" role="img" aria-label={`${steps[index].title}: ${guided ? steps[index].after : steps[index].before}`}>
    <text className={s.sheetHeader} x="35" y="38">ЕС КЛИНИКА / СЕМЕЙНЫЙ МЕДИЦИНСКИЙ ПЛАН</text>
    <text className={s.sheetHeader} x="965" y="38" textAnchor="end">{String(index + 1).padStart(2, "0")} / 07</text>
    <path className={s.sheetRule} d="M 35 57 H 965 M 35 465 H 965" />
    <g transform="translate(0 63) scale(1 .84)">
      <DiagramState state={plan.before} after={false} />
      <DiagramState state={plan.after} after />
    </g>
    <text className={s.sheetFooter} x="35" y="494">{steps[index].title.toUpperCase()}</text>
    <text className={s.sheetFooter} x="965" y="494" textAnchor="end">{guided ? "С ЕС КЛИНИКОЙ" : "БЕЗ ЕС КЛИНИКИ"}</text>
  </svg>;
}

export default function CarePlanPreview() {
  const [index, setIndex] = useState(0);
  const [locked, setLocked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const guided = locked || hovered;
  const step = steps[index];

  function selectStep(next) {
    setIndex(next);
    setLocked(false);
    setHovered(false);
  }

  return <main className={s.page}>
    <header className={s.header}>
      <a href="/care-concepts" className={s.back}>← Все концепции</a>
      <span className={s.brand}>✣ ЕС Клиника</span>
      <span className={s.lab}>Локальный прототип</span>
    </header>
    <div className={s.shell}>
      <div className={s.intro}>
        <p className={s.eyebrow}>Концепция · персональный медицинский план</p>
        <h1>Внедрить единую систему управления здоровьем</h1>
        <p>Семь ситуаций из жизни семьи. На каждом развороте плана видно, как меняется путь от вопроса к решению.</p>
      </div>
      <div className={s.workspace}>
        <nav className={s.stepNav} aria-label="Ситуации медицинского плана">
          <p className={s.navHeading}>Семь разворотов плана</p>
          {steps.map((item, i) => <button key={item.title} type="button" className={`${s.stepButton} ${index === i ? s.stepActive : ""}`} aria-current={index === i ? "step" : undefined} onClick={() => selectStep(i)}>
            <span className={s.stepNumber}>{String(i + 1).padStart(2, "0")}</span>
            <span><strong>{item.title}</strong><small>{item.subtitle}</small></span>
            <span className={s.stepArrow} aria-hidden="true">↗</span>
          </button>)}
        </nav>
        <div className={s.feature}>
          <div className={s.featureHead}>
            <span>{String(index + 1).padStart(2, "0")} / 07 · {step.title}</span>
            <div className={s.modeSwitch} aria-label="Режим сравнения">
              <button type="button" className={!guided ? s.modeActive : ""} aria-pressed={!guided} onClick={() => { setLocked(false); setHovered(false); }}>Без ЕС Клиники</button>
              <button type="button" className={guided ? s.modeActive : ""} aria-pressed={guided} onClick={() => { setLocked(true); setHovered(false); }}>С ЕС Клиникой</button>
            </div>
          </div>
          <button type="button" className={s.scene} aria-label={`${guided ? "С ЕС Клиникой" : "Без ЕС Клиники"}. Нажмите для смены состояния.`} aria-pressed={guided} onPointerEnter={event => { if (event.pointerType === "mouse" && !locked) setHovered(true); }} onPointerLeave={event => { if (event.pointerType === "mouse") setHovered(false); }} onClick={() => { setLocked(!locked); setHovered(false); }}>
            <Image src="/care-concepts/care-plan-blank.png" alt="" fill sizes="(max-width: 840px) 100vw, 1200px" priority />
            <PlanSheet index={index} guided={guided} />
            <span className={s.mobileDiagram}>
              {(guided ? plans[index].after.nodes : plans[index].before.nodes).map(([, , label, kind], i) => <span key={i} data-kind={kind}>{label}</span>)}
            </span>
          </button>
          <div className={s.comparisonCopy}>
            <div className={s.copySide}><span className={s.copyLabel}>Без ЕС Клиники</span><p className={guided ? s.dimmed : ""}>{step.before}</p></div>
            <span className={s.copyDivider} aria-hidden="true">→</span>
            <div className={s.copySide}><span className={s.copyLabel}>С ЕС Клиникой</span><p className={!guided ? s.dimmed : ""}>{step.after}</p></div>
          </div>
          <div className={s.bottomRow}>
            <span>Наведите на план, чтобы увидеть изменение. На телефоне нажмите.</span>
            <button type="button" onClick={() => selectStep((index + 1) % steps.length)}>Следующая ситуация <span aria-hidden="true">→</span></button>
          </div>
        </div>
      </div>
    </div>
  </main>;
}
