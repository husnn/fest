import Token from './build/TokenV1.json';

export const Contracts = {
  Token: {
    interface: Token.abi,
    getAddress: (networkId?: string) =>
      Token.networks[networkId || Object.keys(Token.networks)[0]]?.address
  }
};
