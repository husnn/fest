import { PostgresConfig } from '@fanbase/postgres';

export const appConfig = {
  protocol: 'http',
  host: process.env.HOST || '0.0.0.0',
  port: parseInt(process.env.CONSOLE_PORT || process.env.PORT) || 5002
};

export const postgresConfig: PostgresConfig = {
  uri: process.env.PG_URL || process.env.DATABASE_URL,
  host: process.env.PG_HOST || process.env.RDS_HOSTNAME || '127.0.0.1',
  port: parseInt(process.env.PG_PORT || process.env.RDS_PORT) || 5432,
  database: process.env.PG_DATABASE || process.env.RDS_DB_NAME || 'postgres',
  username: process.env.PG_USER || process.env.RDS_USERNAME || 'postgres',
  password: process.env.PG_PASSWORD || process.env.RDS_PASSWORD || 'postgres'
};

export const mailConfig = {
  from: {
    noreply: process.env.MAIL_FROM_NO_REPLY
  },
  sendgrid: {
    apiUrl: process.env.SENDGRID_API_KEY
  }
};
