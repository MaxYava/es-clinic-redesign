"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Editable } from "./editor";
import { ContactButton } from "./interactive";
import s from "./original-first-screen.module.css";

const doctors = ["tishina", "frolov", "utin", "sorokin", "maksakov"];
const names = ["Дарья Тишина", "Павел Фролов", "Алексей Утин", "Глеб Сорокин", "Сергей Максаков"];
const links = [["approach", "Наш подход"], ["process", "Как это работает"], ["team", "Врачи"], ["contract", "Сопровождение"], ["contacts", "Контакты"]];
const Arrow = () => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;

export function RebuiltHero() {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 40);
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const close = e => { if (e.key === "Escape") { setMenu(false); menuRef.current?.focus(); } };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menu]);
  return (
    <section className={s.screen} aria-label="ЕС Клиника — Медицинский Family Office" data-hero-version="rebuilt">
      <header className={`${s.header} ${!scrolled && !menu ? s.dark : ""}`}>
        <div className={s.headerInner}>
          <div className={s.left}>
            <button className={s.menuButton} ref={menuRef} type="button" aria-label={menu ? "Закрыть меню" : "Открыть меню"} aria-expanded={menu} aria-controls="rebuilt-menu" onClick={() => setMenu(!menu)}><span className={s.burger}><span/><span/><span/></span></button>
            <Editable id="rebuilt-address" as="span" className={s.address}>Москва, Барыковский переулок, д. 4, стр. 3</Editable>
          </div>
          <a className={s.brand} href="#home" aria-label="ЕС Клиника — на главную"><Image src="/assets/official-hero-shield.svg" width={35} height={40} alt="" /></a>
          <div className={s.right}>
            <a className={s.mobileContact} href="https://telegram.me/esclinic_bot" target="_blank" rel="noopener noreferrer" aria-label="Связаться с клиникой"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11a8 8 0 0 1-8 8H8l-5 2 1.4-5A8 8 0 1 1 20 11Z" stroke="currentColor" strokeWidth="1.6"/><circle cx="8" cy="11" r="1" fill="currentColor"/><circle cx="12" cy="11" r="1" fill="currentColor"/><circle cx="16" cy="11" r="1" fill="currentColor"/></svg></a>
            <a className={s.phone} href="tel:+74958681857">+7 (495) 868-18-57</a>
            <a className={s.social} href="https://telegram.me/esclinic_bot" target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.27 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" /></svg></a>
            <a className={s.social} href="https://wa.me/79671330849" target="_blank" rel="noopener noreferrer" aria-label="Написать в WhatsApp"><Image src="/assets/official-hero-whatsapp.svg" width={20} height={20} alt="" /></a>
          </div>
          <nav id="rebuilt-menu" className={s.menu} aria-label="Основная навигация" hidden={!menu}>{links.map(([id, name]) => <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>{name}</a>)}</nav>
        </div>
      </header>
      <div className={s.decoration} aria-hidden="true"><Image src="/assets/official-hero-deco.svg" fill alt="" /></div>
      <div className={s.inner}>
        <div className={s.content}>
          <Editable id="rebuilt-eyebrow" className={s.eyebrow}><span className={s.eyeline}>Медицинский</span>{" "}<span className={s.eyeline}>Family Office</span></Editable>
          <h1 className={s.title}><Image src="/assets/official-hero-logo.svg" width={1000} height={116} alt="ЕС Клиника" priority /></h1>
          <div className={s.tagrow}>
            <div className={s.tagline}><Editable id="rebuilt-tagline-1">Системное управление здоровьем семьи.</Editable><Editable id="rebuilt-tagline-2">Непрерывно. Проактивно. Конфиденциально</Editable></div>
            <ContactButton label="Получить консультацию" hero className={s.cta} />
          </div>
        </div>
        <div className={s.mobileMark} aria-hidden="true"><Image src="/assets/clover.svg" width={26} height={26} alt="" /></div>
        <div className={s.mobilePhoto} aria-hidden="true" />
        <div className={s.card}>
          <div className={s.avatars}>
            {doctors.map((doctor, index) => <a key={doctor} href="#team" aria-label={names[index]} className={s.avatar}><Image src={`/assets/official-avatar-${doctor}.${doctor === "utin" ? "jpg" : "png"}`} width={50} height={50} unoptimized alt="" /></a>)}
            <a href="#team" aria-label="Вся команда" className={s.more}><Arrow /></a>
          </div>
          <Editable id="rebuilt-team-description">Постоянная медицинская команда, которая берёт заботу о вашем здоровье на себя</Editable>
        </div>
      </div>
    </section>
  );
}
