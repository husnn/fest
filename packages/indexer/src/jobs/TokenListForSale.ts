import {
  TokenListing,
  TokenListingRepository,
  TokenRepository,
  WalletRepository
} from '@fest/core';
import { EthereumService, TokenListingStatus } from '@fest/shared';
import Job from './Job';
import JobData from './JobData';

export interface TokenListForSaleJob extends JobData {
  contract: string;
  id: string;
  seller: string;
  token: string;
  tokenId: string;
  quantity: number;
  currency: string;
  priceAmount: string;
  expiry: number;
  maxPerBuyer: number;
}

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
          tx: this.props.txHash
        },
        status: TokenListingStatus.Active
      });

      if (this.props.expiry > 0) {
        trade.expiry = new Date(this.props.expiry * 1000);
      }

      if (this.props.maxPerBuyer > 0)
        trade.maxPerBuyer = this.props.maxPerBuyer;

      await listingRepository.create(trade);
    } catch (err) {
      console.log(err);
    }
  }
}
