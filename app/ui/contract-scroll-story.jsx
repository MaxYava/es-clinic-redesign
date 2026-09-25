"use client";

import { useId, useState } from "react";
import copy from "../data/copy.json";
import styles from "./contract-scroll-story.module.css";

const groups = [
  { title: 62, items: [[63, 64, 65], [66], [67], [68], [69, 70]] },
  { title: 71, items: [[72, 73], [74, 75], [76, 77], [78, 79]] },
  { title: 80, items: [[81, 82, 83], [84, 85]] },
];

function Service({ ids }) {
  const [first, ...rest] = ids;
  const [heading, ...inlineBody] = copy[first].split("\n");
  return (
    <article className={styles.service}>
      <h4>{heading}</h4>
      {inlineBody.map((line, index) => <p key={`inline-${index}`}>{line}</p>)}
      {rest.map((id) => <p key={id}>{copy[id]}</p>)}
    </article>
  );
}

function groupTitle(group, index) {
  return `${index + 1}. ${copy[group.title].replace(/^\d+\.\s*/, "").replace(/\s*\n\s*/g, " ")}`;
}

function ContractGroup({ group, index }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const title = groupTitle(group, index);

  return (
    <article
      className={styles.panel}
      data-contract-panel={index + 1}
      data-expanded={expanded}
    >
      <button
        className={styles.panelHeading}
        type="button"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded((value) => !value)}
      >
        <h3>{title}</h3>
        <span className={styles.panelExpand} aria-hidden="true">+</span>
      </button>
      <div className={styles.panelDetails} id={contentId} aria-hidden={!expanded} inert={!expanded}>
        <div className={styles.panelDetailsInner}>
          <div className={styles.services}>
            {group.items.map((ids) => <Service ids={ids} key={ids[0]} />)}
          </div>
        </div>
      </div>
    </article>
  );
}

export function ContractScrollStory({ intro }) {
  return (
    <div className={styles.journey} data-contract-scroll-preview>
      <div className={styles.content}>
        <div className={styles.intro}>{intro}</div>
        <div className={styles.groups}>
          {groups.map((group, index) => (
            <article className={`${styles.panel} ${styles.staticPanel}`} key={group.title}>
              <div className={`${styles.panelHeading} ${styles.staticHeading}`}>
                <h3>{groupTitle(group, index)}</h3>
              </div>
              <div className={styles.services}>
                {group.items.map((ids) => <Service ids={ids} key={ids[0]} />)}
              </div>
            </article>
          ))}
        </div>
        <div className={styles.mobileGroups}>
          {groups.map((group, index) => <ContractGroup group={group} index={index} key={group.title} />)}
        </div>
      </div>
    </div>
  );
}
