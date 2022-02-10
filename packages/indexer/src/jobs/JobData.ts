import { Protocol } from '@fest/shared';

export interface JobData {
  protocol: Protocol;
  networkId: number;
  txHash: string;
}

export default JobData;
