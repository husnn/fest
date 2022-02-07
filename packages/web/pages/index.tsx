/** @jsxImportSource @emotion/react */
import { Button, Link } from '../ui';
import { css } from '@emotion/react';
import React, { useEffect } from 'react';

import Fade from 'react-reveal/Fade';
import Flash from 'react-reveal/Flash';
import Head from 'next/head';
import { getCurrentUser } from '../modules/auth/authStorage';
import router from 'next/router';
import styles from '../styles/Home.module.scss';
import { useHeader } from '../modules/navigation';

export default function Home() {
  useHeader(['profile', 'login']);

  useEffect(() => {
    if (getCurrentUser()) router.push('/home');
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <div className="full-width">
      <Head>
        <title>Fest</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <h1 className={styles.mainHeading}>
          Build your own{' '}
          <span style={{ whiteSpace: 'nowrap' }}>NFT-backed</span>
          <span style={{ display: 'block' }}>community</span>
        </h1>
        <Link href="/waitlist">
          <Button color="primary" size="small">
            Get early access
          </Button>
        </Link>
        <img
          src={'images/cube-illustration-1.svg'}
          style={{ marginTop: 30, maxWidth: 200 }}
        />
      </div>
      <div className={`${styles.sectionGrey} ${styles.fullWidth}`}>
        <span>
          <h2 className={styles.sectionTitle}>Let your work be supported</h2>
          <p className={styles.description}>by those who truly appreciate it</p>
        </span>
        <Link
          href="https://www.notion.so/Lightpaper-v0-1-1563dc476d2a422e85addaadcb8c1cda"
          target="blank"
        >
          <Button color="normal" style={{ margin: '0 auto' }} size="small">
            Read lightpaper
          </Button>
        </Link>
      </div>
      <div className={styles.section}>
        <div
          className={`${styles.splitSection} ${styles.nonReversing}`}
          style={{ margin: '20px 0 50px' }}
        >
          <Fade>
            <h1>Features</h1>
          </Fade>
          <Fade big bottom>
            <div
              className={styles.featureBlock}
              css={css`
                width: 500px;
              `}
            >
              <ul>
                <li>
                  <h3>Zero crypto knowledge required</h3>
                </li>
                <li>
                  <h3>Free minting and transactions*</h3>
                </li>
                <li>
                  <h3>No crypto knowledge required</h3>
                </li>
              </ul>
            </div>
          </Fade>
        </div>
        <h2 className={styles.sectionTitleLeft}>Connect with your top fans</h2>
        <div className={styles.splitSection} style={{ marginTop: 20 }}>
          <Fade big bottom>
            <div>
              <img src={'images/mint-illustration-1.svg'} />
            </div>
          </Fade>
          <Fade bottom cascade>
            <div className={styles.featureBlock}>
              <h3 className={styles.subheadingDescription}>
                Launch rare collectibles
              </h3>
              <p>
                You could turn your first YouTube video into a verified NFT and
                auction it.
              </p>
              <span>
                <p style={{ display: 'block', marginTop: 20, opacity: '0.7' }}>
                  Earn lifetime royalties on each sale
                </p>
                <div style={{ display: 'flex', gap: 30, opacity: '0.3' }}>
                  <h2 className={styles.sectionTitle}>+10%</h2>
                  <h2 className={styles.sectionTitle}>+20%</h2>
                  <h2 className={styles.sectionTitle}>+30%</h2>
                </div>
              </span>
            </div>
          </Fade>
        </div>
        <div className={styles.splitSection} style={{ marginTop: 30 }}>
          <Fade bottom cascade>
            <div className={styles.featureBlock}>
              <h3 className={styles.subheadingDescription}>
                Share exclusive content
              </h3>
              <p>
                Share unique content with different people based on which
                token(s) they own.
              </p>
            </div>
          </Fade>
          <Fade big bottom>
            <div>
              <img
                src={'images/share-content-illustration-1.svg'}
                // style={{ transform: 'scaleX(-1)' }}
              />
            </div>
          </Fade>
        </div>
      </div>
      <Fade big bottom>
        <div
          className={styles.featureBlock}
          css={css`
            width: 500px;
          `}
        >
          <h1>Roadmap</h1>
          <ul>
            <li>
              <h3>
                Shopify integration to limit exclusive merch drops to NFT
                holders
              </h3>
            </li>
            <li>
              <h3>Adsense revenue share from YouTube videos</h3>
            </li>
            <li>
              <h3>Discord bot that restricts server to token holders</h3>
            </li>
          </ul>
        </div>
      </Fade>
      <div
        className={`${styles.section} ${styles.fullWidth}`}
        style={{ background: '#000D20' }}
      >
        <span>
          <Flash fraction={1} delay={200}>
            <h2 className={styles.sectionTitle} style={{ color: '#fff' }}>
              Build a stronger connection
            </h2>
          </Flash>
          <p className={styles.description} style={{ color: '#fff' }}>
            It&apos;s impossible to connect with everyone,
            <br />
            prioritize those who love you the most.
          </p>
        </span>
        {/* <Link href="/login">
          <Button color="secondary" size="small">
            Get started
          </Button>
        </Link> */}
      </div>
      <div className={styles.section}>
        <Fade delay={500}>
          <span>
            <h3
              className={styles.subheadingDescription}
              style={{ opacity: 0.3 }}
            >
              Fest is...
            </h3>
            <h2 className={styles.sectionTitle} style={{ marginTop: 5 }}>
              A home for your community
            </h2>
            <p className={styles.description}>
              Create your own starting today.
            </p>
          </span>
          <Link href="/login">
            <Button color="secondary" size="small">
              Get started
            </Button>
          </Link>
        </Fade>
      </div>
      <div className={styles.footer}>
        <div className={styles.footerWrapper}>
          <p>&copy; {currentYear} Fest</p>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
