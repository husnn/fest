import TokenAttributes from './TokenAttributes';
import { TokenType } from '../enums';

export interface TokenMetadata {
  type: TokenType;
  name: string;
  description?: string;
  image?: string;
  external_url?: string;
  youtube_url?: string;
  attributes?: TokenAttributes;
}

export default TokenMetadata;
