import Web3 from 'web3';

import Transaction from './Transaction';

export class ApproveSpender extends Transaction {
  constructor(
    web3: Web3,
    erc20Address: string,
    spenderAddress: string,
    amount: string
  ) {
    const abi = [
      {
        constant: false,
        inputs: [
          {
            name: '_spender',
            type: 'address'
          },
          {
            name: '_value',
            type: 'uint256'
          }
        ],
        name: 'approve',
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

    const contract = new web3.eth.Contract(abi as any, erc20Address);

    const txData = contract.methods.approve(spenderAddress, amount).encodeABI();

    super(erc20Address, txData);
  }
}

export default ApproveSpender;
