import { Protocol } from '../enums';

export interface TokenChainData {
  protocol: Protocol;
  contract: string;
  name: string;
  symbol: string;
  id: string;
  creator: string;
  transaction: string;
}

export default TokenChainData;
