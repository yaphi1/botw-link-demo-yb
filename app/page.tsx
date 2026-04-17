'use client';

import styles from './page.module.css';
import Scene from './Scene';

export default function Home() {
  return (
    <div className={styles.page}>
      <main>
        <Scene />
      </main>
    </div>
  );
}
