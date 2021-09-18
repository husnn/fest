/* eslint-disable @typescript-eslint/no-empty-interface */

export interface EthereumTx {
  txData;

  signAndSerialize(privateKey: string): string;
}

export default EthereumTx;
