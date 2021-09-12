import Web3 from 'web3';

import FAN from './build/FAN.json';
import MarketWallet from './build/MarketWalletV1.json';
import Market from './build/OfferMarketV1.json';
import Token from './build/TokenV1.json';

export const getAddress = (name: string, network?: string) =>
  interfaces[name].networks[
    network || Object.keys(interfaces[name].networks)[0]
  ]?.address;

type ContractBuild = {
  abi: any;
  networks: any;
  [key: string]: any;
};

export const interfaces: { [key: string]: ContractBuild } = {
  FAN,
  Token,
  Market,
  MarketWallet
};

let network;

let web3Instance = new Web3(process.env.ETH_PROVIDER);

export const init = async (web3: Web3) => {
  web3Instance = web3;
  network = (await web3.eth.net.getId()).toString();
};

export const contractInstances: { [key: string]: any } = {};

const getContract = (name: keyof typeof interfaces, address?: string) => {
  const instanceKey = `${name}:${network}`;

  let instance = contractInstances[instanceKey];

  if (!instance) {
    address = address || getAddress(name as string, network);

    instance = new web3Instance.eth.Contract(
      interfaces[name].abi as any,
      address
    );

    contractInstances[instanceKey] = instance;

    console.log(`Instance of '${name}' at ${address}`);
  }

  return instance;
};

export const Contracts = {
  FAN: {
    get: (address?: string) => getContract('FAN', address)
  },
  Token: {
    get: (address?: string) => getContract('Token', address)
  },
  Market: {
    get: (address?: string) => getContract('Market', address)
  },
  MarketWallet: {
    get: (address?: string) => getContract('MarketWallet', address)
  }
};

export default { init, Contracts, contractInstances };
