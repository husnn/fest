import '../styles/globals.css';

import { ThemeProvider } from '@emotion/react';

import Header from '../components/Header';
import ApiClient from '../modules/api/ApiClient';
import AxiosClient from '../modules/api/AxiosClient';
import AuthProvider from '../modules/auth/AuthProvider';
import EthereumClient from '../modules/ethereum/EthereumClient';
import HeaderProvider from '../modules/navigation/HeaderProvider';
import DefaultTheme from '../styles/themes/DefaultTheme';

import type { AppProps } from 'next/app';
const axiosClient = new AxiosClient();
new ApiClient(axiosClient);

new EthereumClient();

function FanbaseApp ({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={DefaultTheme}>
      <AuthProvider>
        <HeaderProvider>
          <Header />
          <Component {...pageProps} />
        </HeaderProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default FanbaseApp;
