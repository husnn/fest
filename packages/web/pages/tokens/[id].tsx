import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import { Contracts } from '@fanbase/eth-contracts';
import { MintToken } from '@fanbase/eth-transactions';
import { Protocol, Token } from '@fanbase/shared';

import ApiClient from '../../modules/api/ApiClient';
import EthereumClient from '../../modules/ethereum/EthereumClient';

export default function TokenPage () {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;
    ApiClient.instance?.getToken(id as string).then(async (token: Token) => {
      console.log(token);

      const approval = await ApiClient.instance.approveMint(Protocol.ETHEREUM, 100);
      console.log(approval);

      const tokenContractAddr = Contracts.Token.getAddress();

      const creator = await EthereumClient.instance.getAddress();

      console.log('Sender: ' + creator);

      const tx = new MintToken(tokenContractAddr, {
        creator,
        quantity: '100',
        metadataUri: '',
        fees: [],
        data: approval.data,
        salt: approval.salt,
        signature: approval.signature
      }).build(creator, 0);

      const web3 = EthereumClient.instance.web3;

      try {
        web3.eth.sendTransaction(tx.tx);
      } catch (err) {
        console.log('Err: ' + err);
      }
    });
  }, []);

  return (
    <div>
      <Head>
        <title>{id}</title>
      </Head>
      <div className="top-fans">
        <div className="quantity-owned"></div>
        <div className="bio"></div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {}
  };
};
