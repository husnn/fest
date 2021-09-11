import { Protocol } from '../enums';

export type Blockchain = {
  protocol: Protocol;
  chainId: number;
  networkId: number;
};
