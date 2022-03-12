import Web3 from 'web3';
import Fest from './build/Fest.json';
import Market from './build/ListingMarketV1.json';
import Token from './build/TokenV1.json';
import currencies from './currencies';

type ContractBuild = {
  abi: any;
  networks: any;
  [key: string]: any;
};

const interfaces: { [key: string]: ContractBuild } = {
  Token,
  Market,
  Fest
};

const contractInstances: { [key: string]: any } = {};

const getAddress = (name: string, network?: number) =>
  interfaces[name].networks[
    network.toString() || Object.keys(interfaces[name].networks)[0]
  ]?.address;

const get = (name: keyof typeof interfaces, address?: string) => {
  const instanceKey = `${name}:${network}`;

  let instance = contractInstances[instanceKey];

  if (!instance) {
    address = address || getAddress(name as string, network);

    // console.log(`${name} contract at ${address}`);

    instance = new web3Instance.eth.Contract(
      interfaces[name].abi as any,
      address
    );

    contractInstances[instanceKey] = instance;
  }

  return instance;
};

let web3Instance: Web3, network: number;

const init = async (web3: Web3) => {
  web3Instance = web3 || new Web3(process.env.ETH_PROVIDER);
  network = await web3Instance.eth.net.getId();

  Object.keys(interfaces).forEach((x) => get(x));

  return contractInstances;
};

export default { init, get, currencies };
