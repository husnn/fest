import { ThemeProvider } from '@emotion/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import CookieConsent, { Cookies } from 'react-cookie-consent';
import Header from '../components/Header';
import ApiClient from '../modules/api/ApiClient';
import AxiosClient from '../modules/api/AxiosClient';
import AuthProvider from '../modules/auth/AuthProvider';
import HeaderProvider from '../modules/navigation/HeaderProvider';
import Web3Provider from '../modules/web3/Web3Provider';
import { colors } from '../styles/constants';
import '../styles/globals.scss';
import DefaultTheme from '../styles/themes/DefaultTheme';
import { isDevelopment, isProduction } from '../utils';

const axiosClient = new AxiosClient();
new ApiClient(axiosClient);

const gId = isProduction ? 'G-MEG80DK4ED' : 'G-FD42M526LN';

const ccStatusStorageKey = 'cookie-consent-given';

function FestApp({ Component, pageProps, router }: AppProps) {
  const [requireCookieConsent, setRequireCookieConsent] = useState(true);

  useEffect(() => {
    const ccStorageKey = 'cookie-consent-required';

    const required = localStorage.getItem(ccStorageKey);
    if (required != null) {
      setRequireCookieConsent(required === 'true');
      return;
    }

    axiosClient
      .instance({ baseURL: '/', url: 'api/locale' })
      .then((res) => {
        setRequireCookieConsent(!!res.data.isEurope);
        localStorage.setItem(ccStorageKey, res.data.isEurope);
      })
      .catch((err) => console.log(err));
  }, []);

  const injectAnalyticsCode = requireCookieConsent
    ? !!Cookies.get(ccStatusStorageKey)
    : true;

  return (
    <ThemeProvider theme={DefaultTheme}>
      {!isDevelopment && injectAnalyticsCode && (
        <Head>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${gId}`}
          ></script>
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              
              gtag('config', '${gId}');
            `}
          </script>
        </Head>
      )}
      <AuthProvider>
        <Web3Provider>
          <HeaderProvider>
            {router.pathname !== '/' && <Header />}
            <Component {...pageProps} />
          </HeaderProvider>
        </Web3Provider>
      </AuthProvider>
      {requireCookieConsent && (
        <CookieConsent
          location="bottom"
          buttonText="Accept"
          cookieName={ccStatusStorageKey}
          style={{
            padding: '1% 5%',
            display: 'flex',
            alignItems: 'center',
            background: colors.black
          }}
          buttonStyle={{
            padding: '5px 15px',
            backgroundColor: colors.blue,
            color: colors.blueLighter,
            fontSize: '11pt',
            borderRadius: 20
          }}
          expires={150}
          acceptOnScroll
          onAccept={() => {
            location.reload();
          }}
        >
          We have a cookie monster to feed 🍪
          <br />
          <span style={{ fontSize: 12, marginTop: 5, display: 'block' }}>
            It will make sure you have a better experience on this site. By
            continuing, you&apos;re agreeing to our use of cookies.
          </span>
        </CookieConsent>
      )}
    </ThemeProvider>
  );
}

export default FestApp;
