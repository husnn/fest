import contracts from '@fest/eth-contracts';
import { EthereumService, ProtocolConfig, TokenStandard } from '@fest/shared';
import { getForNetwork } from './currencies';

export const getTokenStandard = async (contract): Promise<TokenStandard> => {
  const tests = [
    {
      standard: TokenStandard.ERC721,
      interfaceId: '0x80ac58cd'
    },
    {
      standard: TokenStandard.ERC1155,
      interfaceId: '0xd9b67a26'
    }
  ];

  for (const test of tests) {
    const isSupported = await contract.methods
      .supportsInterface(test.interfaceId)
      .call();

    if (isSupported) return test.standard;
  }

  return TokenStandard.ERC20;
};

const isProduction = process.env.NODE_ENV === 'production';

export const generate = async (
  service: EthereumService
): Promise<ProtocolConfig> => {
  const tokenContract = contracts.get('Token');
  const marketContract = contracts.get('Market');
  const festContract = contracts.get('Fest');

  const currencies = [...getForNetwork(service.chainId)];

  if (!isProduction) {
    currencies.push({
      name: 'Fest',
      symbol: 'FEST',
      decimals: 18,
      contract: festContract.options.address
    });
  }

  const tokens = await Promise.all(
    [tokenContract].map(async (contract) => {
      return {
        type: await getTokenStandard(contract),
        contract: contract.options.address
      };
    })
  );

  const config: ProtocolConfig = {
    networkId: service.networkId,
    chainId: service.chainId,
    defaultToken: tokens[0],
    tokens,
    market: {
      contract: marketContract.options.address,
      defaultCurrency: currencies[0],
      currenciesSupported: currencies,
      fees: {
        buyerPct: 500,
        sellerPct: 500
      },
      percentageScale: await marketContract.methods.hundredPct().call()
    },
    currencies
  };

  return config;
};
