import { InitConfig } from '@fanbase/shared';

import { ApiClient } from './modules/api';

const INIT_CONFIG = 'init_config';

export const fetchInitConfig = (): Promise<InitConfig> => {
  return new Promise((resolve, reject) => {
    try {
      const local = getConfig();

      if (local && new Date(local.expires) >= new Date()) {
        console.log('Using stored config.');
        resolve(local);
        return;
      }

      ApiClient.getInstance()
        .getInitConfig()
        .then((response) => {
          localStorage.setItem(INIT_CONFIG, JSON.stringify(response.body));
          resolve(response.body);
        });
    } catch (err) {
      reject(err);
    }
  });
};

export const getConfig = (): InitConfig => {
  const local: string = localStorage.getItem(INIT_CONFIG);

  try {
    return JSON.parse(local);
  } catch (err) {
    console.log(err);
  }

  return null;
};
