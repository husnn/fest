import {
  EthereumService,
  TokenListing,
  TokenListingRepository,
  TokenRepository,
  WalletRepository
} from '@fanbase/core';
import { Protocol, TokenListingStatus } from '@fanbase/shared';

import Job from './Job';

export type TokenListForSaleJob = {
  protocol: Protocol;
  tx: string;
  contract: string;
  id: string;
  seller: string;
  token: string;
  tokenId: string;
  quantity: number;
  currency: string;
  priceAmount: string;
};

export default class TokenListForSale extends Job<TokenListForSaleJob> {
  constructor(props: TokenListForSaleJob) {
    super(props);
  }

  async execute(
    tokenRepository: TokenRepository,
    walletRepository: WalletRepository,
    listingRepository: TokenListingRepository,
    ethereumService: EthereumService
  ): Promise<void> {
    try {
      const token = await tokenRepository.findByChainData({
        protocol: this.props.protocol,
        contract: this.props.token,
        id: this.props.tokenId
      });

      const wallet = await walletRepository.findByAddress(
        this.props.protocol,
        this.props.seller
      );

      const price = await ethereumService.priceFromERC20Amount(
        this.props.currency,
        this.props.priceAmount
      );

      const trade = new TokenListing({
        protocol: this.props.protocol,
        sellerId: wallet.ownerId,
        tokenId: token.id,
        quantity: this.props.quantity,
        available: this.props.quantity,
        price,
        chain: {
          contract: this.props.contract,
          id: this.props.id,
          tx: this.props.tx
        },
        status: TokenListingStatus.Active
      });

      await listingRepository.create(trade);
    } catch (err) {
      console.log(err);
    }
  }
}
