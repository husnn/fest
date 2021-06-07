import cors from 'cors';
import express, { Application, Router } from 'express';

import errorHandler from './middleware/errorHandler';
import initRoutes from './routes';
import { AppConfig } from './types/AppConfig';

class App {
  app: Application;
  config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;

    const app: Application = express();

    app.use(cors());

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    const router = Router();
    initRoutes(router);

    app.use('/v1', router);

    app.use(errorHandler);

    this.app = app;
  }

  getInstance = (): Application => this.app;

  onError(err: string) {
    console.log(`Could not start app. ${err}`);
  }

  start() {
    const { protocol, host, port } = this.config;

    this.app
      .listen(port, host, () => {
        console.log(`App running at ${protocol}://${host}:${port}`);
      })
      .on('error', this.onError);
  }
}

export default App;
