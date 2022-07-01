export type DiscordConfig = {
  clientId: string;
  clientSecret: string;
  redirectUrl?: string;
  botToken: string;
};

export const defaultConfig: DiscordConfig = {
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  botToken: process.env.DISCORD_BOT_TOKEN
};
