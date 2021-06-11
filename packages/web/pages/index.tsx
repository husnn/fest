import Head from 'next/head';
import { useEffect } from 'react';

import { useHeader } from '../modules/navigation';
import styles from '../styles/Home.module.css';

export default function Home() {
  useHeader(['profile', 'login']);

  useEffect(() => {}, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Fanbase</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </div>
  );
}
