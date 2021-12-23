export const appConfig = {
  protocol: 'http',
  host: process.env.HOST || '0.0.0.0',
  port: parseInt(process.env.CONSOLE_PORT || process.env.PORT) || 4000
};

export const mailConfig = {
  from: {
    noreply: process.env.MAIL_FROM_NO_REPLY
  },
  sendgrid: {
    apiUrl: process.env.SENDGRID_API_KEY
  }
};
