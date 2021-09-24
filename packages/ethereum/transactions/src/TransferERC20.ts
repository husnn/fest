import Transaction from './Transaction';
import Web3 from 'web3';

export class TransferERC20 extends Transaction {
  constructor(web3: Web3, currency: string, to: string, amount: string) {
    const abi = [
      {
        constant: false,
        inputs: [
          {
            name: '_to',
            type: 'address'
          },
          {
            name: '_value',
            type: 'uint256'
          }
        ],
        name: 'transfer',
        outputs: [
          {
            name: '',
            type: 'bool'
          }
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      }
    ];

    const contract = new web3.eth.Contract(abi as any, currency);

    const txData = contract.methods.transfer(to, amount).encodeABI();

    super(currency, txData);
  }
}

export default TransferERC20;
