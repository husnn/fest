import TokenAttribute from './TokenAttribute';

export interface TokenMetadata {
  type: string;
  name: string;
  description?: string;
  image?: string;
  external_url?: string;
  youtube_url?: string;
  attributes?: TokenAttribute[];
}

export default TokenMetadata;
