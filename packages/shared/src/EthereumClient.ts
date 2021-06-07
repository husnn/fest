import { Token, Wallet } from './entities';

export interface EthereumClient {
  mintToken(token: Token, wallet: Wallet, signature: string): Promise<void>;
}

export default EthereumClient;
