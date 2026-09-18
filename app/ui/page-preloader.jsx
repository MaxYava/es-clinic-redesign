import Image from "next/image";
import styles from "./page-preloader.module.css";

export function PagePreloader() {
  return (
    <div className={styles.overlay} aria-hidden="true" data-page-reveal="cross">
      <div className={styles.cross}><Image src="/assets/clover.svg" width={180} height={180} alt="" priority /></div>
    </div>
  );
}
