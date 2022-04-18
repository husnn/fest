import { Price } from '@fest/shared';
import UseCase from '../../base/UseCase';
import TokenTrade from '../../entities/TokenOffer';
import {
  TokenOwnershipRepository,
  UserRepository,
  WalletRepository
} from '../../repositories';
import TokenOfferRepository from '../../repositories/TokenOfferRepository';
import Result from '../../Result';
import MailService from '../../services/MailService';

type MakeOfferInput = {
  buyer: string;
  ownership: string;
  quantity: number;
  price: Price;
  signature: string;
};

type MakeOfferOutput = {
  id: string;
};

export class MakeOffer extends UseCase<MakeOfferInput, MakeOfferOutput> {
  private offerRepository: TokenOfferRepository;
  private ownershipRepository: TokenOwnershipRepository;
  private walletRepository: WalletRepository;
  private userRepository: UserRepository;
  private mailService: MailService;

  constructor(
    offerRepository: TokenOfferRepository,
    ownershipRepository: TokenOwnershipRepository,
    walletRepository: WalletRepository,
    userRepository: UserRepository,
    mailService: MailService
  ) {
    super();

    this.offerRepository = offerRepository;
    this.ownershipRepository = ownershipRepository;
    this.walletRepository = walletRepository;
    this.userRepository = userRepository;
    this.mailService = mailService;
  }

  getOfferExpiryDate(): Date {
    const date = new Date();
    date.setHours(date.getHours() + 24);
    return date;
  }

  async exec(data: MakeOfferInput): Promise<Result<MakeOfferOutput>> {
    const expiry = this.getOfferExpiryDate();

    // TODO: Check buyer's balance
    // TODO: Verify signature

    const offer = new TokenTrade({
      senderId: data.buyer,
      ownershipId: data.ownership,
      quantity: data.quantity,
      price: data.price,
      expiry,
      signature: data.signature
    });

    const offerCreated = await this.offerRepository.create(offer);
    const ownership = await this.ownershipRepository.get(data.ownership);
    const ownerWallet = await this.walletRepository.get(ownership.walletId);
    const owner = await this.userRepository.get(ownerWallet.ownerId);

    // TODO: Send email

    return Result.ok({ id: offerCreated.id });
  }
}

export default MakeOffer;
