import Image from "next/image";
import copy from "./data/copy.json";
import faqs from "./data/faqs.json";
import partners from "./data/partners.json";
import {
  EditorProvider,
  Editable,
  EditablePhoto,
  EditorLauncher,
} from "./ui/editor";
import { VideoCard, ContactButton } from "./ui/interactive";

const Text = ({ n, as = "p", className = "" }) => (
  <Editable id={`copy-${n}`} as={as} className={className}>
    {copy[n]}
  </Editable>
);
const Photo = ({ name, alt, className = "" }) => (
  <EditablePhoto
    id={`photo-${name}`}
    src={`/assets/${name}.webp`}
    alt={alt}
    className={className}
  />
);
const Mark = () => (
  <Image src="/assets/clover.svg" width={30} height={30} alt="" />
);
const stages = [
  [20, null],
  [22, 23],
  [24, 25],
  [26, 27],
  [28, 29],
  [30, 31],
  [32, 33],
  [34, 35],
];
const groups = [
  { title: 62, items: [[63, 64, 65], [66], [67], [68], [69, 70]] },
  {
    title: 71,
    items: [
      [72, 73],
      [74, 75],
      [76, 77],
      [78, 79],
    ],
  },
  {
    title: 80,
    items: [
      [81, 82, 83],
      [84, 85],
    ],
  },
];
const doctors = [
  { image: "tishina", name: 55, url: "https://es-clinic.ru/doctor-tishina" },
  { image: "frolov", name: 56, url: "https://es-clinic.ru/doctor-frolov" },
  { image: "utin", name: 57, role: 58, url: "https://es-clinic.ru/vrachi" },
];

export default function Home() {
  return (
    <EditorProvider>
      <a className="skip" href="#approach">
        Перейти к содержимому
      </a>
      <header className="header">
        <a href="#home" aria-label="ЕС Клиника — на главную" className="brand">
          <Mark />
          <Image
            src="/assets/logo.svg"
            width={184}
            height={28}
            alt="ЕС Клиника"
          />
        </a>
        <nav aria-label="Основная навигация">
          <a href="#approach">Наш подход</a>
          <a href="#team">Врачи</a>
          <a href="#contract">Сопровождение</a>
          <a href="#contacts">Контакты</a>
        </nav>
        <a className="phone" href="tel:+74958681857">
          +7 (495) 868-18-57
        </a>
        <details className="mobile-menu">
          <summary aria-label="Открыть меню">☰</summary>
          <nav>
            <a href="#approach">Наш подход</a>
            <a href="#team">Врачи</a>
            <a href="#contract">Сопровождение</a>
            <a href="#contacts">Контакты</a>
          </nav>
        </details>
      </header>
      <main id="home">
        <section
          className="hero"
          aria-label="ЕС Клиника — Медицинский Family Office"
        >
          <EditablePhoto
            id="photo-hero"
            src="/assets/hero.webp"
            alt="Семья на консультации в ЕС Клинике"
            className="hero-photo"
            priority
          />
          <div className="hero-content">
            <Text n={1} className="hero-eyebrow" />
            <h1>
              <Image
                src="/assets/logo.svg"
                alt="ЕС Клиника"
                width={815}
                height={94}
                className="hero-logo"
                priority
              />
            </h1>
            <div className="hero-tagrow">
              <div>
                <Text n={2} />
                <Text n={3} />
              </div>
              <ContactButton label={copy[6]} />
            </div>
          </div>
          <div className="hero-card">
            <div className="avatars">
              {["tishina", "frolov", "sorokin", "maksakov"].map((d) => (
                <a
                  key={d}
                  href="#team"
                  aria-label="Перейти к медицинской команде"
                >
                  <Image
                    src={`/assets/${d}.webp`}
                    width={54}
                    height={54}
                    alt=""
                  />
                </a>
              ))}
              <a href="#team" aria-label="Вся команда">
                ↗
              </a>
            </div>
            <Text n={5} />
          </div>
        </section>
        <nav className="section-nav" aria-label="Разделы страницы">
          {[
            ["Наш подход", "approach", "✣"],
            ["Как это работает", "process", "◎"],
            ["Наши врачи", "team", "♧"],
            ["Годовой контракт", "contract", "≡"],
            ["История", "history", "◷"],
            ["Вопросы и ответы", "faq", "?"],
          ].map(([label, id, icon]) => (
            <a key={id} href={`#${id}`}>
              <span aria-hidden="true">{icon}</span>
              {label}
            </a>
          ))}
        </nav>

        <section className="section split intro" id="approach">
          <div>
            <Mark />
            <Text n={8} as="h2" />
            <Text n={9} className="lead" />
            <Text n={10} />
            <div className="capacity">
              <Mark />
              <Text n={11} />
            </div>
          </div>
          <VideoCard />
        </section>
        <section className="section split system" id="system">
          <Photo name="family" alt="Бабушка целует внука" />
          <div>
            <Mark />
            <Text n={13} as="h2" />
            <Text n={14} className="lead" />
            <Text n={15} />
          </div>
        </section>
        <section className="section split responsibility" id="responsibility">
          <div>
            <Mark />
            <Text n={16} className="statement" />
            <Text n={17} className="lead" />
          </div>
          <Photo
            name="reception"
            alt="Две сотрудницы за стойкой ресепшена ЕС Клиники"
          />
        </section>

        <section className="section" id="process">
          <div className="section-heading">
            <Text n={18} as="h2" />
            <Mark />
          </div>
          <div className="timeline">
            {stages.map(([title, body]) => (
              <article className="stage" key={title}>
                <div>
                  <Text n={title} as="h3" />
                  {body ? (
                    <Text n={body} />
                  ) : (
                    <a className="text-link" href="#contract">
                      Что входит в годовой контракт ↗
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="section comparison" id="comparison">
          <Text n={36} as="h2" />
          <div className="comparison-head">
            <Text n={37} as="h3" />
            <Text n={38} as="h3" />
          </div>
          {Array.from({ length: 7 }, (_, i) => (
            <div className="comparison-row" key={i}>
              <Text n={39 + i * 2} />
              <Text n={40 + i * 2} />
            </div>
          ))}
        </section>
        <section className="section team" id="team">
          <div className="section-heading">
            <Text n={53} as="h2" />
            <Mark />
          </div>
          <Text n={54} className="team-intro lead" />
          <div className="doctors">
            {doctors.map((d) => (
              <article key={d.image}>
                <Photo name={d.image} alt={copy[d.name].split("\n")[0]} />
                <Text n={d.name} className="doctor-caption" />
                {d.role && <Text n={d.role} />}
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  О враче ↗
                </a>
              </article>
            ))}
          </div>
          <a
            className="button"
            href="https://es-clinic.ru/vrachi"
            target="_blank"
            rel="noopener noreferrer"
          >
            {copy[59]} ↗
          </a>
        </section>
        <section className="section contract" id="contract">
          <Text n={60} as="h2" />
          <Text n={61} className="lead" />
          {groups.map((group) => (
            <details key={group.title} open>
              <summary>
                <Text n={group.title} as="span" />
                <span className="plus" aria-hidden="true">
                  +
                </span>
              </summary>
              <div className="services">
                {group.items.map((ids) => (
                  <article key={ids[0]}>
                    {ids.map((n, i) => (
                      <Text
                        n={n}
                        key={n}
                        as={i === 0 && !copy[n].includes("\n") ? "h4" : "p"}
                        className={
                          copy[n].includes("\n") ? "multiline-service" : ""
                        }
                      />
                    ))}
                  </article>
                ))}
              </div>
            </details>
          ))}
        </section>
        <section className="section partners" id="partners">
          <Text n={86} as="h2" />
          <div className="partner-grid">
            {partners.map((p) => (
              <div key={p.asset}>
                <Image
                  src={`/assets/partners/${p.asset}`}
                  width={180}
                  height={80}
                  sizes="(max-width: 600px) 40vw, 180px"
                  alt={p.name}
                  className="partner-logo"
                />
              </div>
            ))}
          </div>
        </section>
        <section className="section split" id="history">
          <div>
            <Mark />
            <Text n={88} as="h2" />
            <div className="stats">
              {[
                ["20 лет", "премиальной выездной медицины"],
                ["34", "направления диагностики и лечения"],
                ["100+", "партнёров"],
                ["380", "активных клиентов"],
              ].map(([n, label], i) => (
                <div key={i}>
                  <Editable id={`stat-${i}`} as="strong">
                    {n}
                  </Editable>
                  <Editable id={`stat-label-${i}`}>{label}</Editable>
                </div>
              ))}
            </div>
          </div>
          <Photo name="history" alt="Врач ЕС Клиники" />
        </section>
        <section className="loyalty">
          <Photo name="loyalty" alt="Семья — несколько поколений вместе" />
          <div>
            <Text n={90} as="h2" />
          </div>
        </section>
        <section className="section testimonial" id="reviews">
          <Text n={92} as="h2" />
          <div className="review-grid">
            <div>
              <Mark />
              <Text n={93} as="h3" />
              <Text n={94} />
            </div>
            <blockquote>
              <Text n={95} className="lead" />
              <details>
                <summary>
                  Читать отзыв полностью <span aria-hidden="true">+</span>
                </summary>
                {[96, 97, 98].map((n) => (
                  <Text n={n} key={n} />
                ))}
              </details>
            </blockquote>
          </div>
        </section>
        <section className="section faq" id="faq">
          <Text n={99} as="h2" />
          {faqs.map((faq, i) => (
            <details key={i}>
              <summary>
                <Editable id={`faq-${i}-question`} as="span">
                  {faq.question}
                </Editable>
                <span className="plus" aria-hidden="true">
                  +
                </span>
              </summary>
              <div>
                {faq.paragraphs.map((p, j) => (
                  <Editable id={`faq-${i}-${j}`} key={j}>
                    {p}
                  </Editable>
                ))}
              </div>
            </details>
          ))}
        </section>
        <section className="section split final-cta" id="consultation">
          <div>
            <Mark />
            <Text n={102} as="h2" />
            <Text n={103} />
            <Text n={104} />
            <ContactButton label={copy[105]} />
          </div>
          <Photo name="clinic" alt="Гостиная в ЕС Клинике" />
        </section>
      </main>
      <footer id="contacts">
        <div className="footer-top">
          <div>
            <Image
              src="/assets/logo.svg"
              width={230}
              height={35}
              alt="ЕС Клиника"
            />
            <p>Медицинский Family Office</p>
          </div>
          <div>
            <a href="tel:+74958681857">+7 (495) 868-18-57</a>
            <p>Москва, Барыковский переулок, д. 4, стр. 3</p>
            <a
              href="https://telegram.me/esclinic_bot"
              target="_blank"
              rel="noopener noreferrer"
            >
              Написать в Telegram ↗
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© ЕС Клиника, 2026</span>
          <a
            href="https://es-clinic.ru/legal"
            target="_blank"
            rel="noopener noreferrer"
          >
            Документы и правовая информация ↗
          </a>
          <span>Локальная версия для обсуждения</span>
        </div>
        <p className="disclaimer">
          Имеются противопоказания. Необходима консультация специалиста.
        </p>
      </footer>
      <a
        className="floating-contact"
        href="tel:+74958681857"
        aria-label="Позвонить в клинику"
      >
        ☎
      </a>
      <EditorLauncher />
    </EditorProvider>
  );
}
