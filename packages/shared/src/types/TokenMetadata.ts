import TokenAttributes from './TokenAttributes';

export interface TokenMetadata {
  type: string;
  name: string;
  description?: string;
  image?: string;
  external_url?: string;
  youtube_url?: string;
  attributes?: TokenAttributes;
}

export default TokenMetadata;
