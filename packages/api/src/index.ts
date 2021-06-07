import Postgres from '@fanbase/postgres';

import App from './App';
import { appConfig, postgresConfig } from './config';

Postgres.init(postgresConfig).then(() => {
  console.log('Connected to database.');
  new App(appConfig).start();
});
