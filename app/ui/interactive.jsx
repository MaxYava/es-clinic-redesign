"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";

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
            src="/assets/tishina.webp"
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
export function ContactButton({ label }) {
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
      <button className="button" onClick={() => ref.current.showModal()}>
        {label}
        <span aria-hidden="true">↗</span>
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
