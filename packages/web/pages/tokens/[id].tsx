import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import { Contracts } from '@fanbase/eth-contracts';
import { MintToken } from '@fanbase/eth-transactions';
import { Protocol, Token } from '@fanbase/shared';

import ApiClient from '../../modules/api/ApiClient';
import EthereumClient from '../../modules/ethereum/EthereumClient';
import useEthereum from '../../modules/ethereum/useEthereum';
import { Button } from '../../ui';

export default function TokenPage() {
  const router = useRouter();
  const eth = useEthereum();

  const { id } = router.query;

  const mintToken = () => {
    ApiClient.instance?.getToken(id as string).then(async (token: Token) => {
      const approval = await ApiClient.instance.approveMint(
        Protocol.ETHEREUM,
        token.id
      );

      const web3 = EthereumClient.instance.web3;

      web3.eth.net.getId().then(async (id: number) => {
        const tokenContractAddr = Contracts.Token.getAddress(id.toString());
        const creator = await EthereumClient.instance.getAddress();

        const tx = new MintToken(tokenContractAddr, {
          creator,
          supply: token.supply,
          fees: [],
          data: approval.data,
          expiry: approval.expiry,
          salt: approval.salt,
          signature: approval.signature
        }).build(creator, 0);

        try {
          web3.eth.sendTransaction(tx.tx);
        } catch (err) {
          console.log(err);
        }
      });
    });
  };

  return (
    <div className="boxed">
      <Head>
        <title>{id}</title>
      </Head>
      <div className="top-fans">
        <div className="quantity-owned"></div>
        <div className="bio"></div>
      </div>
      <Button
        onClick={() => {
          mintToken();
        }}
      >
        Mint token
      </Button>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {}
  };
};
