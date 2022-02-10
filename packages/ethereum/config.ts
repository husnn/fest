import contracts from '@fest/eth-contracts';
import {
  Currency,
  EthereumService,
  ProtocolConfig,
  TokenStandard
} from '@fest/shared';

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

const toCurrencies = async (service: EthereumService, addresses: string[]) =>
  Promise.all(
    addresses.map(async (address) => {
      return {
        ...(await service.getERC20Info(address)),
        contract: address
      };
    })
  );

export const generate = async (
  service: EthereumService
): Promise<ProtocolConfig> => {
  const tokenContract = contracts.get('Token');
  const marketContract = contracts.get('Market');

  const currencyAddresses: string[] = [
    ...contracts.currencies.getForNetwork(service.chainId)
  ];

  if (!isProduction)
    currencyAddresses.push(contracts.get('Fest').options.address);

  const currencies: Currency[] = await toCurrencies(service, currencyAddresses);

  const currenciesSupported: Currency[] = [];

  for (const currency of currencies) {
    if (
      await marketContract.methods.isCurrencyApproved(currency.contract).call()
    ) {
      currenciesSupported.push(currency);
    }
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
      wallet: contracts.get('MarketWallet').options.address,
      defaultCurrency: currenciesSupported[0],
      currenciesSupported,
      fees: {
        buy: await marketContract.methods.buyerFeePct().call(),
        sell: await marketContract.methods.sellerFeePct().call()
      },
      limits: {
        maxPrice: await marketContract.methods.maxTokenPrice().call(),
        minPrice: await marketContract.methods.minTokenPrice().call(),
        maxQuantity: await marketContract.methods.maxListingQuantity().call()
      },
      percentageScale: await marketContract.methods.hundredPct().call()
    },
    currencies
  };

  return config;
};
