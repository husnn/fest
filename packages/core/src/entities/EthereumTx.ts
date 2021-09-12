/* eslint-disable @typescript-eslint/no-empty-interface */

export interface EthereumTx {
  signAndSerialize(privateKey: string): string;
}

export default EthereumTx;
