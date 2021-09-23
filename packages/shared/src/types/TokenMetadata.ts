import { TokenType } from '../enums';
import TokenAttributes from './TokenAttributes';

export interface TokenMetadata {
  type: TokenType;
  name: string;
  description?: string;
  image?: string;
  external_url?: string;
  attributes?: TokenAttributes;
}

export default TokenMetadata;
