import { Protocol } from '../enums';

export interface TokenChainData {
  protocol: Protocol;
  contract: string;
  name: string;
  id: string;
  creator: string;
  txHash: string;
}

export default TokenChainData;
