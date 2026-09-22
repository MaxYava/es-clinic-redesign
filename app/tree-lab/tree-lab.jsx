"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./tree-lab.module.css";
import { bonsaiStages } from "./bonsai-stages";

const chapters = [
  { number: "01", title: "Ваша личная медицинская команда", description: "Семейный врач, педиатр, медицинская сестра и куратор. Команда, которая знает историю вашей семьи и остаётся рядом.", detail: "Постоянный контакт. Общий контекст.", point: .32 },
  { number: "02", title: "Экспертиза и лечение", description: "Профильные специалисты, ведущие эксперты и второе мнение. Решения складываются в единый план здоровья.", detail: "Нужная экспертиза в нужный момент.", point: .65 },
  { number: "03", title: "Когда ситуация сложная", description: "Сопровождение госпитализации, сложного лечения и организация экстренной помощи. Вы не остаётесь один на один с медицинской системой.", detail: "Поддержка на каждом этапе.", point: 1 },
];
const growthStages = [
  { file: "01-seed", title: "Семечко", caption: "Начало истории", position: "50% 93%" },
  { file: "02-sprout", title: "Росток", caption: "Первые листья", position: "50% 93%" },
  { file: "03-sapling", title: "Саженец", caption: "Основа будущей кроны", position: "50% 93%" },
  { file: "04-young-tree", title: "Молодое дерево", caption: "Ветви и листва", position: "50% 93%" },
  { file: "05-buds", title: "Бутоны", caption: "Перед цветением", position: "50% 93%" },
  { file: "06-bloom", title: "Цветение", caption: "Полная крона", position: "50% 93%" },
];
const stageName = p => p < .065 ? "Семечко" : p < .26 ? "Первые листья" : p < .48 ? "Саженец" : p < .72 ? "Рост кроны" : p < .88 ? "Раскрытие бутонов" : "Цветение";
const photoSeries = [
  { id: "photoreal-reverse", label: "Фотосерия · полный рост", directory: "photoreal-reverse", archive: "photoreal-reverse.zip", guide: "REVERSE-GUIDE.md", description: "Полная последовательность: семечко → росток → саженец → молодое дерево → бутоны → цветение. Все ранние стадии созданы от финального дерева.", stages: growthStages },
  { id: "classic-reverse", label: "Ранняя серия · полный рост", directory: "classic-reverse", archive: "classic-reverse.zip", guide: "REVERSE-GUIDE.md", description: "Добавлены семечко, росток и саженец. Шесть стадий роста одного дерева; понравившиеся кадры 04–06 сохранены.", stages: growthStages },
  { id: "photoreal-young20", label: "Фотосерия · новые 04–05", directory: "photoreal-young20", archive: "photoreal-young20.zip", guide: "YOUNG20-GUIDE.md", description: "Новое молодое дерево с умеренно прореженной листвой (задание: −20%). Пятый кадр с почками создан на его основе." },
  { id: "classic-young20", label: "Ранняя серия · новые 04–05", directory: "classic-young20", archive: "classic-young20.zip", guide: "YOUNG20-GUIDE.md", description: "Новое молодое дерево с умеренно прореженной листвой (задание: −20%). Пятый кадр с почками создан на его основе." },
  { id: "photoreal-sparse", label: "Фотосерия · разреженный кадр 05", directory: "photoreal-sparse", archive: "photoreal-sparse.zip", guide: "SPARSE-VIDEO-GUIDE.md", description: "Кадр 05 переделан из кадра 06: прореженная листва, закрытые почки и более тонкий ствол. Финальный кадр сохранён без изменений." },
  { id: "classic-sparse", label: "Ранняя серия · разреженный кадр 05", directory: "classic-sparse", archive: "classic-sparse.zip", guide: "SPARSE-VIDEO-GUIDE.md", description: "Кадр 05 переделан из кадра 06: меньше листьев, закрытые почки и более тонкий изогнутый ствол. Финальный кадр сохранён без изменений." },
  { id: "bonsai-story", label: "Бонсай · 6 стадий роста", directory: "bonsai-story", archive: "bonsai-story.zip", guide: "bonsai-story/VIDEO-GUIDE.md", subject: "китайский вяз в горшке", description: "Новая серия по мотивам настоящего музейного бонсая: семечко, росток, саженец и три стадии формирования дерева. Художественное сжатие многолетнего выращивания.", stages: bonsaiStages },
  { id: "photoreal-matched", label: "Фотосерия · листва 05–06", directory: "photoreal-matched", archive: "photoreal-matched.zip", guide: "REVISION-VIDEO-GUIDE.md", description: "Предпоследний кадр пересоздан из финального с заданием сохранить листву и заменить только цветки на бутоны." },
  { id: "classic-matched", label: "Ранняя серия · листва 05–06", directory: "classic-matched", archive: "classic-matched.zip", guide: "REVISION-VIDEO-GUIDE.md", description: "Новый кадр с бутонами на основе финального цветущего дерева. Предыдущая редакция доступна рядом." },
  { id: "photoreal-refined", label: "Фотосерия · обновлённая", directory: "photoreal-refined", archive: "photoreal-refined.zip", guide: "REVISION-VIDEO-GUIDE.md", description: "Кадры 05 и 06 созданы заново: более лёгкая крона и спокойная листва. Первые четыре стадии сохранены." },
  { id: "classic-refined", label: "Ранняя серия · обновлённая", directory: "classic-refined", archive: "classic-refined.zip", guide: "REVISION-VIDEO-GUIDE.md", description: "Новые бутоны и цветение для дерева с изогнутым стволом. Первые четыре стадии сохранены." },
  { id: "bonsai", label: "Бонсай · предыдущий образец", directory: "bonsai-photo", archive: "bonsai-photo.zip", guide: "REVISION-VIDEO-GUIDE.md", subject: "бонсай в керамическом горшке", description: "Отдельный фотографический образец: извилистый ствол и раздельные группы листвы. Пока один кадр, без стадий роста.", stages: [{ file: "01-bonsai", title: "Бонсай", caption: "Извилистый ствол · горшок" }] },
  { id: "photoreal", label: "Фотосерия · версия 02", directory: "photoreal", archive: "magnolia-photoreal-keyframes.zip", guide: "photoreal/VIDEO-GUIDE.md", description: "Последняя сохранённая серия. Исходные кадры до новой переработки." },
  { id: "classic", label: "Ранняя серия · версия 01", directory: "stages", archive: "magnolia-keyframes.zip", guide: "VIDEO-GUIDE.md", description: "Более ранняя версия дерева. Исходные кадры сохранены для сравнения." },
];

function LivingTree({ progress, reduced, version, viewAngle }) {
  const host = useRef(null);
  const instance = useRef(null);
  const latest = useRef({ progress, reduced, viewAngle });
  const [status, setStatus] = useState("loading");
  latest.current = { progress, reduced, viewAngle };
  useEffect(() => {
    let cancelled = false;
    const source = version === 3 ? import("./tree-scene-bonsai") : import("./tree-scene-v2");
    source.then(async ({ createTreeScene }) => {
      if (cancelled) return;
      try {
        const created = await createTreeScene(host.current, () => { if (!cancelled) setStatus("fallback"); });
        if (cancelled) { created.dispose(); return; }
        instance.current = created;
        instance.current.setProgress(latest.current.progress, latest.current.reduced);
        instance.current.setView?.(latest.current.viewAngle);
        setStatus("ready");
      } catch { if (!cancelled) setStatus("fallback"); }
    }).catch(() => { if (!cancelled) setStatus("fallback"); });
    return () => { cancelled = true; instance.current?.dispose(); instance.current = null; };
  }, [version]);
  useEffect(() => { instance.current?.setProgress(progress, reduced); }, [progress, reduced]);
  useEffect(() => { instance.current?.setView?.(viewAngle); }, [viewAngle]);
  return <div className={styles.treeViewport} role="img" aria-label={`Цветущее дерево. ${stageName(progress)}.`}>
    <div className={styles.canvasHost} ref={host} data-scene-status={status} />
    {status === "loading" && <span className={styles.loading}>Дерево просыпается…</span>}
    {status === "fallback" && <div className={styles.fallback}><img src={version === 3 ? "/tree-lab/bonsai-fallback.png" : "/tree-lab/stages/06-bloom.png"} alt={version === 3 ? "Цветущий бонсай" : "Цветущая магнолия"} /><span>Статичный вид: 3D недоступно на этом устройстве.</span></div>}
  </div>;
}

export default function TreeLab() {
  const [method, setMethod] = useState("live");
  const [modelVersion, setModelVersion] = useState(3);
  const [viewIndex, setViewIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [frame, setFrame] = useState(4);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") !== "frames") return;
    setMethod("frames");
    const requested = photoSeries.find(item => item.id === params.get("series"));
    if (requested) setSeriesId(requested.id);
    const requestedFrame = Number(params.get("frame"));
    const count = (requested?.stages || growthStages).length;
    if (Number.isInteger(requestedFrame) && requestedFrame >= 1 && requestedFrame <= count) setFrame(requestedFrame - 1);
  }, []);
  const [seriesId, setSeriesId] = useState("classic-reverse");
  const series = photoSeries.find(item => item.id === seriesId);
  const stages = series.stages || growthStages;
  const frameSource = file => `/tree-lab/${series.directory}/${file}.png`;
  const selectSeries = id => {
    const next = photoSeries.find(item => item.id === id);
    setFrame(value => Math.min(value, (next.stages || growthStages).length - 1));
    setSeriesId(id);
  };
  const section = useRef(null);
  const pRef = useRef(0);
  const animation = useRef(0);
  const chapter = progress < .12 ? -1 : progress < .46 ? 0 : progress < .76 ? 1 : 2;
  const sceneProgress = reduced && !playing ? [0, .32, .65, 1][chapter + 1] : progress;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (method !== "live") return;
    let scheduled = 0;
    const update = () => {
      scheduled = 0;
      if (!section.current) return;
      const rect = section.current.getBoundingClientRect();
      const value = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
      pRef.current = value;
      setProgress(value);
    };
    const scroll = () => { if (!scheduled) scheduled = requestAnimationFrame(update); };
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    update();
    return () => { cancelAnimationFrame(scheduled); window.removeEventListener("scroll", scroll); window.removeEventListener("resize", scroll); };
  }, [method]);

  const stop = () => { cancelAnimationFrame(animation.current); animation.current = 0; setPlaying(false); };
  useEffect(() => {
    const interrupt = event => {
      if (event?.type === "touchstart" && event.target.closest("button, input, a")) return;
      cancelAnimationFrame(animation.current); animation.current = 0; setPlaying(false);
    };
    const keys = event => { if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Escape"].includes(event.key)) interrupt(); };
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("keydown", keys);
    const hidden = () => { if (document.hidden) interrupt(); };
    document.addEventListener("visibilitychange", hidden);
    return () => { interrupt(); window.removeEventListener("wheel", interrupt); window.removeEventListener("touchstart", interrupt); window.removeEventListener("keydown", keys); document.removeEventListener("visibilitychange", hidden); };
  }, []);

  const seek = value => {
    if (!section.current) return;
    const rect = section.current.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + rect.top + value * (rect.height - window.innerHeight), behavior: "instant" });
    pRef.current = value; setProgress(value);
  };
  const play = () => {
    if (playing) { stop(); return; }
    const start = pRef.current > .99 ? 0 : pRef.current;
    seek(start); setPlaying(true);
    const began = performance.now();
    const tick = time => {
      const next = Math.min(1, start + (time - began) / 20000);
      seek(next);
      if (next < 1) animation.current = requestAnimationFrame(tick);
      else { animation.current = 0; setPlaying(false); }
    };
    animation.current = requestAnimationFrame(tick);
  };
  const selectMethod = value => { stop(); setMethod(value); };

  return <main className={styles.lab}>
    <header className={styles.header}>
      <a href="/" className={styles.brand}>ЕС Клиника<span>Медицинский Family Office</span></a>
      <span className={styles.edition}>Дерево заботы <span> / </span> Исследование движения</span>
      <a href="/" className={styles.back}>На сайт ↗</a>
    </header>
    <div className={styles.intro}>
      <div><p className={styles.eyebrow}>От семечка до цветения</p><h1>Забота, которая растёт.</h1></div>
      <p className={styles.introText}>Одна история. Два способа её рассказать.<br />Прокрутите страницу — и дайте дереву вырасти.</p>
    </div>
    <div className={styles.methodBar} role="tablist" aria-label="Способ анимации" onKeyDown={event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === "Home" ? "live" : event.key === "End" ? "frames" : method === "live" ? "frames" : "live";
      selectMethod(next); document.getElementById(`${next}-tab`).focus();
    }}>
      <button role="tab" id="live-tab" tabIndex={method === "live" ? 0 : -1} aria-selected={method === "live"} aria-controls="live-panel" onClick={() => selectMethod("live")} className={method === "live" ? styles.selectedTab : ""}><span>01</span> Живое дерево <small>3D + прокрутка</small></button>
      <button role="tab" id="frames-tab" tabIndex={method === "frames" ? 0 : -1} aria-selected={method === "frames"} aria-controls="frames-panel" onClick={() => selectMethod("frames")} className={method === "frames" ? styles.selectedTab : ""}><span>02</span> Кадры для видео <small>Прозрачные PNG</small></button>
    </div>

    {method === "live" ? <div id="live-panel" role="tabpanel" aria-labelledby="live-tab">
      <section className={styles.scrollStory} ref={section} aria-label="Рост дерева при прокрутке">
        <div className={styles.stickyScene}>
          <div className={styles.sceneTop}><div className={styles.modelChoice} role="group" aria-label="Сравнить модели"><button aria-pressed={modelVersion === 3} onClick={() => { stop(); setModelVersion(3); }}>Бонсай</button><button aria-pressed={modelVersion === 2} onClick={() => { stop(); setModelVersion(2); }}>Предыдущая модель</button></div><button className={styles.matureView} onClick={() => { stop(); seek(1); }}>Взрослое дерево ↗</button></div>
          <div className={styles.composition}>
            <div className={styles.art}>
              <div className={styles.halo} />
              <LivingTree key={modelVersion} version={modelVersion} progress={sceneProgress} reduced={reduced} viewAngle={[-.06, .50, -.50][viewIndex]} />
              <div className={styles.specimen}><span>{modelVersion === 3 ? "Бонсай · Исследование формы III" : "Botanical study · II"}</span><small>{stageName(sceneProgress)}</small></div>
              {modelVersion === 3 && <button className={styles.rotateView} aria-label="Изменить ракурс бонсая" onClick={() => setViewIndex((viewIndex + 1) % 3)}>Ракурс {viewIndex + 1} / 3 <span>↻</span></button>}
            </div>
            <div className={styles.storyContent}>
              <p className={styles.eyebrow}>Что входит в годовой контракт</p>
              <div className={styles.chapterStack}>
                <article className={`${styles.chapter} ${chapter === -1 ? styles.activeChapter : ""}`} aria-hidden={chapter !== -1}>
                  <span className={styles.chapterNumber}>Начало</span><h2>Большое начинается<br />с малого.</h2><p>От профилактики и повседневных вопросов до сложного лечения — команда рядом с вашей семьёй.</p><span className={styles.chapterDetail}>Прокрутите, чтобы продолжить ↓</span>
                </article>
                {chapters.map((item, i) => <article key={item.number} className={`${styles.chapter} ${chapter === i ? styles.activeChapter : ""}`} aria-hidden={chapter !== i}>
                  <span className={styles.chapterNumber}>{item.number} / 03</span><h2>{item.title}</h2><p>{item.description}</p><span className={styles.chapterDetail}>{item.detail}</span>
                </article>)}
              </div>
              <nav className={styles.chapterNav} aria-label="Три пункта контракта">{chapters.map((item, i) => <button key={item.number} onClick={() => { stop(); seek(item.point); }} aria-label={item.title} aria-current={chapter === i ? "step" : undefined} className={chapter === i ? styles.activeDot : ""}><span>{item.number}</span><i /></button>)}</nav>
            </div>
          </div>
          <div className={styles.controls}>
            <button onClick={play} className={styles.play} aria-label={playing ? "Остановить анимацию" : "Смотреть рост дерева"}>{playing ? "Ⅱ" : "▷"}<span>{playing ? "Пауза" : progress > .99 ? "Ещё раз" : "Смотреть рост"}</span></button>
            <label className={styles.scrubber}><span className={styles.srOnly}>Рост дерева</span><input aria-label="Рост дерева" type="range" min="0" max="1000" value={Math.round(progress * 1000)} onChange={event => { stop(); seek(Number(event.target.value) / 1000); }} style={{ "--progress": `${progress * 100}%` }} /><span>{String(Math.round(progress * 100)).padStart(2, "0")}%</span></label>
            <span className={styles.scrollHint}>Прокручивайте страницу <span>↓</span></span>
          </div>
        </div>
      </section>
      <div className={styles.afterword}><p className={styles.eyebrow}>Способ 01</p><h2>Живое движение.<br />Каждый этап — под вашим управлением.</h2><p>Потяните ползунок назад: дерево вернётся к семечку. Во втором варианте — отдельная серия ключевых кадров для создания видео.</p><button className={styles.textButton} onClick={() => { selectMethod("frames"); window.scrollTo({ top: 0, behavior: "instant" }); }}>Открыть кадры для видео ↗</button></div>
    </div> : <section id="frames-panel" role="tabpanel" aria-labelledby="frames-tab" className={styles.framesPanel}>
      <div className={styles.frameHeader}><div><p className={styles.eyebrow}>Способ 02 · Коллекция кадров</p><h2>Естественная форма.<br />Фотографические детали.</h2></div><a href={`/tree-lab/${series.archive}`} download className={styles.downloadAll}>Скачать все кадры <span>↓ ZIP</span></a></div>
      <div className={styles.seriesChoice} role="group" aria-label="Версия фотосерии">
        {photoSeries.map(item => <button key={item.id} aria-pressed={seriesId === item.id} onClick={() => selectSeries(item.id)}>{item.label}</button>)}
      </div>
      <p className={styles.seriesDescription} aria-live="polite">{series.description} Выберите серию и этап роста для сравнения.</p>
      <div className={`${styles.frameViewer} ${dark ? styles.darkViewer : ""}`}>
        <div className={styles.viewerLabel}><span>{String(frame + 1).padStart(2, "0")} / {String(stages.length).padStart(2, "0")} — {stages[frame].title}</span><button onClick={() => setDark(!dark)} aria-pressed={dark}>{dark ? "Светлый фон ◯" : "Тёмный фон ●"}</button></div>
        <img className={styles.largeFrame} src={frameSource(stages[frame].file)} alt={`${stages[frame].title}: ${series.subject || "магнолия"} на прозрачном фоне`} width="1254" height="1254" />
        <span className={styles.alphaLabel}>PNG · прозрачный фон · {series.label}</span>
        <a className={styles.downloadFrame} href={frameSource(stages[frame].file)} download>Скачать этот кадр ↓</a>
      </div>
      <div className={styles.frameStrip} aria-label="Этапы роста">{stages.map((item, i) => <button key={item.file} onClick={() => setFrame(i)} aria-pressed={i === frame} className={i === frame ? styles.activeFrame : ""}><span className={styles.thumbNumber}>0{i + 1}</span><img src={frameSource(item.file)} alt="" width="220" height="220" loading="lazy" /><strong>{item.title}</strong><small>{item.caption}</small></button>)}</div>
      <div className={styles.frameNotes}><div><p className={styles.eyebrow}>Для следующего шага</p><h3>{stages.length === 1 ? "Бонсай: отдельный образец для выбора формы." : `${stages.length} кадров для видеопереходов.`}</h3><p>Создавайте переходы между соседними стадиями, сохраняя камеру и положение основания. Сначала проверьте один переход: генерация может слегка менять форму ветвей.</p></div><div><p>В архиве — кадры выбранной серии и материалы для дальнейшей работы. Серию магнолии можно оценить отдельно от 3D-бонсая. Прозрачность исходных кадров не гарантирует прозрачность готового видео.</p><a className={styles.textButton} href={`/tree-lab/${series.guide}`} download>Скачать инструкцию и промпты ↗</a></div></div>
    </section>}
    <footer className={styles.footer}><span>ЕС Клиника</span><span>Дерево заботы · Два варианта для сравнения</span><a href="/">Вернуться на сайт ↗</a></footer>
  </main>;
}
