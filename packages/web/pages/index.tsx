import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import useAuthentication from '../modules/auth/useAuthentication';
import { headerLinks, useHeader } from '../modules/navigation';
import styles from '../styles/Home.module.css';

export default function Home() {
  const router = useRouter();
  const { setLinks } = useHeader();
  const { isAuthenticated, clearAuth } = useAuthentication();

  useEffect(() => {
    setLinks([
      headerLinks.Login({
        isAuthenticated,
        onClick: () => {
          isAuthenticated ? clearAuth() : router.push('/login');
        }
      })
    ]);
  }, [isAuthenticated]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Fanbase</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </div>
  );
}
