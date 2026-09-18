"use client";
import { useEffect, useRef, useState } from "react";
import data from "../data/contact-widget.json";
import "./contact-widget.css";

export function ContactWidget() {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const button = useRef(null);
  useEffect(() => {
    const outside = event => { if (!root.current?.contains(event.target)) setOpen(false); };
    const escape = event => { if (event.key === "Escape" && open) { setOpen(false); button.current?.focus(); } };
    document.addEventListener("click", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("click", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div ref={root} className={`esc-fab${open ? " is-open" : ""}`}>
    <div className="esc-fab__list" id="floating-contacts" aria-hidden={!open}>
      {data.anchors.map(item => <a key={item.label} className="esc-fab__item" href={item.href} aria-label={item.label} tabIndex={open ? 0 : -1} target={item.href.startsWith("https:") ? "_blank" : undefined} rel="noopener noreferrer" onClick={() => setOpen(false)} dangerouslySetInnerHTML={{ __html: item.svg }} />)}
    </div>
    <button ref={button} className="esc-fab__btn" type="button" aria-controls="floating-contacts" aria-expanded={open} aria-label={open ? "Закрыть контакты" : "Связаться с нами"} onClick={() => setOpen(value => !value)}>
      <span className="esc-fab__ic esc-fab__ic--phone" dangerouslySetInnerHTML={{ __html: data.phone }} />
      <span className="esc-fab__ic esc-fab__ic--close" dangerouslySetInnerHTML={{ __html: data.close }} />
    </button>
  </div>;
}
