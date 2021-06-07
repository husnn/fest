export interface AppConfig {
  protocol: string;
  host: string;
  port: number;
  jwtSecret: string;
  apiVersion: string;
  clientUrl: string;
  [key: string]: any;
}
