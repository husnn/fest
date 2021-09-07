import Fortmatic from 'fortmatic';
import Web3 from 'web3';

import Contracts from '@fanbase/eth-contracts';
import {
    ApproveSpender, ApproveTokenMarket, BuyToken, CancelTokenListing, ListTokenForSale, MintToken,
    SignOffer, TransferToken, WithdrawMarketEarnings
} from '@fanbase/eth-transactions';
import { TokenDTO } from '@fanbase/shared';

export default class EthereumClient {
  private isInitialized = false;

  web3: Web3 = new Web3(process.env.NEXT_PUBLIC_ETH_PROVIDER);

  static instance: EthereumClient;

  constructor() {
    EthereumClient.instance = this;
    return this;
  }

  async initWeb3(): Promise<void> {
    if (typeof window !== 'undefined') {
      let provider: any;
      const ethereum = (window as any).ethereum;

      if (ethereum) {
        ethereum.web3 = this.web3;
        provider = ethereum;
      } else {
        const fm = new Fortmatic(process.env.NEXT_PUBLIC_FORTMATIC_API_KEY, {
          rpcUrl: process.env.NEXT_PUBLIC_ETH_PROVIDER,
          chainId: parseInt(process.env.NEXT_PUBLIC_ETH_CHAIN)
        });

        provider = fm.getProvider();
      }

      this.isInitialized = true;
      this.web3.setProvider(provider);

      Contracts.init(this.web3);
    }
  }

  async getERC20Balance(
    contractAddr: string,
    account: string
  ): Promise<number> {
    if (!contractAddr || !account) return;

    const abi = [
      {
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      }
    ];

    const contract = new this.web3.eth.Contract(abi as any, contractAddr);

    const balance = await contract.methods.balanceOf(account).call();

    return parseFloat(Web3.utils.fromWei(balance, 'ether'));
  }

  async getEtherBalance(account: string): Promise<number> {
    const balance = await this.web3.eth.getBalance(account);
    return parseFloat(Web3.utils.fromWei(balance, 'ether'));
  }

  async getAccount(): Promise<string> {
    if (!this.isInitialized) await this.initWeb3();

    const ethereum = (window as any).ethereum;

    if (ethereum) {
      await ethereum.request({ method: 'eth_requestAccounts' });
    }

    return await this.web3.eth.getCoinbase();
  }

  async signMessage(message: string, address: string) {
    return this.web3.eth.personal.sign(message, address, '');
  }

  async signOffer(
    seller: string,
    contract: string,
    id: string,
    quantity: number,
    currency: string,
    price: string,
    expiry: number,
    salt: string
  ): Promise<void> {
    const buyer = await this.getAccount();

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();
    const nonce = await this.web3.eth.getTransactionCount(buyer, 'pending');

    const tx = new SignOffer({
      offer: {
        buyer,
        seller,
        token: contract,
        tokenId: id,
        quantity,
        currency,
        price,
        expiry
      },
      salt
    }).build(buyer, networkId, chainId, nonce);

    this.web3.eth.call(tx.txData);
  }

  async getMarketEarnings(contract: string, wallet?: string): Promise<string> {
    const marketContract = Contracts.Contracts.Market.get();

    try {
      const balance = await marketContract.methods
        .getBalance(contract, wallet)
        .call();

      return balance;
    } catch (err) {
      console.log(err);
    }
  }

  async withdrawEarnings(
    currencyContract: string,
    amountInWei: string,
    marketContract?: string
  ): Promise<string> {
    const account = await this.getAccount();

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();

    const nonce = await this.web3.eth.getTransactionCount(account, 'pending');

    const txData = {
      currencyContract,
      amount: amountInWei
    };

    const tx = new WithdrawMarketEarnings(txData, marketContract).build(
      account,
      networkId,
      chainId,
      nonce,
      385000
    );

    return this.sendTransaction(tx);
  }

  async buyTokenListing(
    listingAddress: string,
    listingId: string,
    quantity: number
  ): Promise<string> {
    const account = await this.getAccount();

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();
    const nonce = await this.web3.eth.getTransactionCount(account, 'pending');

    const txData = {
      listingId,
      quantity
    };

    const tx = new BuyToken(txData, listingAddress).build(
      account,
      networkId,
      chainId,
      nonce,
      385000
    );

    return this.sendTransaction(tx);
  }

  async listForSale(
    token: TokenDTO,
    quantity: number,
    currency: string,
    price: number,
    expiry: number,
    salt: string,
    signature: string
  ): Promise<string> {
    const account = await this.getAccount();

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();
    const nonce = await this.web3.eth.getTransactionCount(account, 'pending');

    const txData = {
      seller: account,
      tokenContract: token.chain.contract,
      tokenId: token.chain.id,
      quantity,
      currencyContract: currency,
      price,
      expiry,
      salt,
      signature
    };

    const tx = new ListTokenForSale(txData).build(
      account,
      networkId,
      chainId,
      nonce,
      385000
    );

    return this.sendTransaction(tx);
  }

  async checkMarketApproval(address?: string): Promise<boolean> {
    const account = address || (await this.getAccount());

    const tokenContract = Contracts.Contracts.Token.get();
    const marketWalletContract = Contracts.Contracts.MarketWallet.get();

    const isApproved = await tokenContract.methods
      .isApprovedForAll(account, marketWalletContract.options.address)
      .call();

    return isApproved;
  }

  async giveToken(
    token: TokenDTO,
    to: string,
    quantity: number
  ): Promise<string> {
    const account = await this.getAccount();

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();
    const nonce = await this.web3.eth.getTransactionCount(account, 'pending');

    const txData = {
      from: account,
      to,
      id: token.chain.id,
      quantity
    };

    const tx = new TransferToken(txData).build(
      account,
      networkId,
      chainId,
      nonce
    );

    return this.sendTransaction(tx);
  }

  async approveMarket(): Promise<string> {
    const account = await this.getAccount();

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();
    const nonce = await this.web3.eth.getTransactionCount(account, 'pending');

    const tx = new ApproveTokenMarket().build(
      account,
      networkId,
      chainId,
      nonce
    );

    return this.sendTransaction(tx);
  }

  async getApprovedAllowance(
    erc20Address: string,
    spenderAddress: string
  ): Promise<string> {
    const account = await this.getAccount();

    const abi = [
      {
        constant: true,
        inputs: [
          {
            name: '_owner',
            type: 'address'
          },
          {
            name: '_spender',
            type: 'address'
          }
        ],
        name: 'allowance',
        outputs: [
          {
            name: '',
            type: 'uint256'
          }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      }
    ];

    const contract = new this.web3.eth.Contract(abi as any, erc20Address);

    const amount = await contract.methods
      .allowance(account, spenderAddress)
      .call();

    return amount;
  }

  async approveSpender(
    erc20Address: string,
    spenderAddress: string,
    amount: string
  ): Promise<string> {
    const account = await this.getAccount();

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();

    const nonce = await this.web3.eth.getTransactionCount(account, 'pending');

    const tx = new ApproveSpender(
      this.web3,
      erc20Address,
      spenderAddress,
      amount
    ).build(account, networkId, chainId, nonce);

    return this.sendTransaction(tx);
  }

  async cancelTokenListing(listingId: string): Promise<string> {
    const account = await this.getAccount();

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();
    const nonce = await this.web3.eth.getTransactionCount(account, 'pending');

    const txData = {
      tradeId: listingId
    };

    const tx = new CancelTokenListing(txData).build(
      account,
      networkId,
      chainId,
      nonce
    );

    return this.sendTransaction(tx);
  }

  async mintToken(
    token: TokenDTO,
    data: string,
    expiry: number,
    salt: string,
    signature: string
  ): Promise<string> {
    const account = await this.getAccount();

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();
    const nonce = await this.web3.eth.getTransactionCount(account, 'pending');

    const txData = {
      creator: account,
      supply: token.supply,
      fees: [],
      data,
      expiry,
      salt,
      signature
    };

    const tx = new MintToken(txData).build(account, networkId, chainId, nonce);

    return this.sendTransaction(tx);
  }

  async sendTransaction(tx): Promise<string> {
    return new Promise((resolve, reject) => {
      this.web3.eth.sendTransaction(tx.txData, (err: Error, hash: string) => {
        if (!err) resolve(hash);
        reject();
      });
    });
  }

  checkTxConfirmation(hash: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        this.web3.eth.getTransactionReceipt(hash, (err, receipt) => {
          console.log(receipt);

          if (err) {
            clearInterval(interval);
            reject();
          }

          if (receipt) {
            clearInterval(interval);
            resolve();
          }
        });
      }, 5000);
    });
  }
}
