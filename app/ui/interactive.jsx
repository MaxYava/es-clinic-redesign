"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";

export function ProcessStep({ heading, children, variant = "process" }) {
  const detailsRef = useRef(null);
  const contentRef = useRef(null);
  const animationRef = useRef(null);
  const targetOpen = useRef(false);
  useEffect(() => () => animationRef.current?.cancel(), []);
  const toggle = (event) => {
    event.preventDefault();
    const details = detailsRef.current;
    const content = contentRef.current;
    const from = details.open ? content.getBoundingClientRect().height : 0;
    const opacity = details.open ? Number(getComputedStyle(content).opacity) : 0;
    animationRef.current?.cancel();
    targetOpen.current = !targetOpen.current;
    const opening = targetOpen.current;
    details.open = true;
    details.dataset.expanded = String(opening);
    const to = opening ? content.scrollHeight : 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      details.open = opening;
      return;
    }
    const animation = content.animate(
      [{ height: `${from}px`, opacity }, { height: `${to}px`, opacity: opening ? 1 : 0 }],
      { duration: variant === "process" ? 480 : 560, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "both" },
    );
    animationRef.current = animation;
    animation.onfinish = () => {
      details.open = opening;
      animation.cancel();
      animationRef.current = null;
    };
  };
  return (
    <details className={`${variant}-step`} ref={detailsRef}>
      <summary onClick={toggle}>
        {heading}
        <span className={variant === "process" ? "process-expand" : "faq-expand"} aria-hidden="true"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M7 2v10M2 7h10" /></svg></span>
      </summary>
      <div className={variant === "process" ? "process-content" : "faq-content"} ref={contentRef}><div className={variant === "contract" ? "contract-answer" : variant === "process" ? "process-description" : "faq-answer"}>{children}</div></div>
    </details>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);
  return (
    <header className={`header reference-header${scrolled || menuOpen ? " scrolled" : ""}`}>
      <div className="header-left">
        <button ref={menuButton} className="menu-button" aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"} aria-expanded={menuOpen} aria-controls="header-menu" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
        <span className="header-address">Москва, Барыковский переулок, д. 4, стр. 3</span>
      </div>
      <a className="header-brand" href="#home" aria-label="ЕС Клиника – на главную">
        <Image className="header-shield" src="/assets/official-hero-shield.svg" width={35} height={40} alt="" />
      </a>
      <div className="header-actions">
        <a className="header-phone" href="tel:+74958681857">+7 (495) 868-18-57</a>
        <a className="header-telegram" href="https://telegram.me/esclinic_bot" target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.27 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" /></svg></a>
        <a className="header-telegram header-whatsapp" href="https://wa.me/79671330849" target="_blank" rel="noopener noreferrer" aria-label="Написать в WhatsApp"><Image src="/assets/official-hero-whatsapp.svg" width={20} height={20} alt="" /></a>
        <a className="header-mobile-phone" href="tel:+74958681857" aria-label="Позвонить в ЕС Клинику"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 3h4l2 6-2 2a14 14 0 0 0 5 5l2-2 6 2v4C11 22 2 13 4 3Z" /></svg></a>
        <details className="header-mobile-contact">
          <summary aria-label="Связаться с клиникой"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.5C6.75 3.5 2.5 7.02 2.5 11.35c0 2.06.99 3.93 2.6 5.3-.12 1.2-.55 2.28-1.25 3.15 1.5-.18 2.83-.66 3.86-1.32 1.36.53 2.88.82 4.29.82 5.25 0 9.5-3.52 9.5-7.85S17.25 3.5 12 3.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="8.4" cy="11.3" r="1.05" fill="currentColor" /><circle cx="12" cy="11.3" r="1.05" fill="currentColor" /><circle cx="15.6" cy="11.3" r="1.05" fill="currentColor" /></svg></summary>
          <div className="header-contact-menu"><a href="https://telegram.me/esclinic_bot" target="_blank" rel="noopener noreferrer">Telegram</a><a href="https://wa.me/79671330849" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="tel:+74958681857">Позвонить</a></div>
        </details>
      </div>
      <nav id="header-menu" className="header-dropdown" aria-label="Основная навигация" hidden={!menuOpen}>
        {[["#approach", "Наш подход"], ["#process", "Как это работает"], ["#team", "Врачи"], ["#contract", "Сопровождение"], ["#contacts", "Контакты"]].map(([href, label]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
      </nav>
    </header>
  );
}

export function VideoCard() {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="video-card">
      {playing ? (
        <video
          src="/assets/daria-tishina-web.mp4"
          controls
          autoPlay
          playsInline
          preload="none"
          aria-label="Дарья Тишина о Медицинском Family Office"
        />
      ) : (
        <>
          <Image
            src="/assets/daria-enhanced.webp"
            unoptimized
            alt="Дарья Сергеевна Тишина"
            fill
            sizes="(max-width: 760px) 90vw, 420px"
          />
          <button
            className="video-play"
            onClick={() => setPlaying(true)}
            aria-label="Смотреть видео с Дарьей Тишиной"
          >
            <span aria-hidden="true">▶</span>
          </button>
          <div className="video-caption">
            Дарья Тишина<span>Медицинский директор ЕС Клиники</span>
          </div>
        </>
      )}
    </div>
  );
}
export function ContactButton({ label, hero = false, className = "button" }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const close = (e) => {
      if (e.target === dialog) dialog.close();
    };
    dialog.addEventListener("click", close);
    return () => dialog.removeEventListener("click", close);
  }, []);
  return (
    <>
      <button className={className} onClick={() => ref.current.showModal()}>
        {label}
        {hero ? <svg className="contact-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg> : <span aria-hidden="true">↗</span>}
      </button>
      <dialog ref={ref} className="contact-dialog">
        <div>
          <button
            className="dialog-close"
            aria-label="Закрыть"
            onClick={() => ref.current.close()}
          >
            ×
          </button>
          <h2>Познакомимся?</h2>
          <p>Обсудите сопровождение вашей семьи с командой ЕС Клиники.</p>
          <a className="button" href="tel:+74958681857">
            +7 (495) 868-18-57 ↗
          </a>
          <a
            className="text-link"
            href="https://telegram.me/esclinic_bot"
            target="_blank"
            rel="noopener noreferrer"
          >
            Написать в Telegram ↗
          </a>
          <small>
            В локальном прототипе заявки не отправляются. Ссылки ведут в
            реальные каналы клиники.
          </small>
        </div>
      </dialog>
    </>
  );
}
