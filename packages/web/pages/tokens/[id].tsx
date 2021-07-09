import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { setTimeout } from 'timers';

import styled from '@emotion/styled';
import { Contracts } from '@fanbase/eth-contracts';
import {
    getExpiryDate, Protocol, randomNumericString, TokenDTO, TokenOwnershipDTO, WalletType
} from '@fanbase/shared';

import TokenHolders from '../../components/TokenHolders';
import ApiClient from '../../modules/api/ApiClient';
import useAuthentication from '../../modules/auth/useAuthentication';
import EthereumClient from '../../modules/ethereum/EthereumClient';
import useEthereum from '../../modules/ethereum/useEthereum';
import SpinnerSvg from '../../public/images/spinner.svg';
import { Button, Link } from '../../ui';
import Modal from '../../ui/Modal';
import { getDisplayName, getProfileUrl, getTokenOwnershipUrl } from '../../utils';

const TokenContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;

  @media screen and (max-width: 500px) {
    flex-direction: column-reverse;
  }
`;

const TokenInfo = styled.div`
  width: 100%;
  max-width: 500px;
  flex: 1;

  > * + * {
    margin-top: 20px;
  }
`;

const TokenHeading = styled.div`
  > * + * {
    margin-top: 5px;
  }
`;

const TokenCreatorCard = styled.div`
  margin-top: 10px;
  padding: 20px 0;
  display: flex;
  align-items: center;
  border-radius: 10px;

  .token-creator-info {
    > * + * {
      margin-top: 5px;
    }
  }

  > * + * {
    margin-left: 20px;
  }
`;

const Avatar = styled.div`
  min-width: 50px;
  min-height: 50px;
`;

const TokenActions = styled.div`
  width: 100%;
  margin-top: 20px;
  padding: 30px;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  border-radius: 30px;

  > * + * {
    margin-top: 10px;
  }
`;

const TokenHoldersContainer = styled.div`
  width: 100%;
  min-width: 200px;
  margin-left: 30px;
  flex: 0.4;

  @media screen and (max-width: 500px) {
    margin: 30px 0;
  }
`;

const PreviewContainer = styled.div`
  position: relative;
  width: 100%;
  height: 250px;
  max-height: auto;
  border-radius: 10px;
  overflow: hidden;
`;

export default function TokenPage() {
  const router = useRouter();
  const eth = useEthereum();
  const { currentUser } = useAuthentication();

  const { id, o } = router.query;

  const [token, setToken] = useState<TokenDTO>();
  const [isOwn, setOwn] = useState(false);
  const [ownership, setOwnership] = useState<TokenOwnershipDTO>();

  const [minting, setMinting] = useState(false);

  useEffect(() => {
    if (!id) return;

    ApiClient.instance?.getToken(id as string).then(async (token: TokenDTO) => {
      setToken(token);
    });
  }, [id]);

  useEffect(() => {
    if (!ownership && o) {
      ApiClient.instance
        ?.getTokenOwnership(id as string, o as string)
        .then(async (ownership: TokenOwnershipDTO) => {
          setOwnership(ownership);
        });
    }
  }, [o]);

  useEffect(() => {
    setOwn(currentUser && ownership?.walletId == currentUser?.wallet.id);
    if (ownership)
      router.push(
        {
          pathname: getTokenOwnershipUrl(ownership)
        },
        undefined,
        { shallow: true }
      );
  }, [token, ownership]);

  const MintToken = ({ onExecuted }: { onExecuted: () => void }) => {
    const [executing, setExecuting] = useState(false);
    const [executed, setExecuted] = useState(false);

    const execute = async () => {
      setExecuting(true);

      try {
        if (currentUser.wallet.type == WalletType.INTERNAL) {
          await ApiClient.instance?.mintToken(token.id, Protocol.ETHEREUM);
        } else {
          const approval = await ApiClient.instance.approveMint(
            token.id,
            Protocol.ETHEREUM
          );

          await EthereumClient.instance.mintToken(
            token,
            approval.data,
            approval.expiry,
            approval.salt,
            approval.signature
          );
        }

        onExecuted();
        setExecuted(true);
      } catch (err) {
        console.log(err);
      }

      setExecuting(false);
    };

    return !executed ? (
      <Modal
        show={true}
        title="Are you sure?"
        description="This cannot be undone."
        ok="Confirm"
        onOkPressed={() => execute()}
        okEnabled={!executing}
        cancel="Cancel"
        requestClose={() => setMinting(false)}
      >
        <p>Mint this token.</p>
      </Modal>
    ) : (
      <Modal
        show={true}
        title="All done."
        description="The transaction has been sent. It may take a few seconds for it to be
      processed. You may close this now."
        cancel="Close"
        requestClose={() => setMinting(false)}
      >
        <SpinnerSvg fill="#000" />
        <span style={{ marginLeft: 10, fontSize: 14, verticalAlign: 'top' }}>
          Processing...
        </span>
      </Modal>
    );
  };

  const giveToken = async () => {
    const account = await eth.getAccount();

    Contracts.Token.get()
      .methods.safeTransferFrom(
        account,
        '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0',
        token.chain?.id,
        1,
        []
      )
      .send({ from: account });
  };

  const listForSale = async () => {
    const expiry = getExpiryDate().getTime();
    const salt = randomNumericString();

    console.log(token.chain.creator);

    let hash = await Contracts.Market.get()
      .methods.getSaleAuthorizationHash(
        token.chain.creator,
        token.chain.contract,
        token.chain.id,
        1,
        '0x9561C133DD8580860B6b7E504bC5Aa500f0f06a7',
        100000,
        expiry,
        salt
      )
      .call();

    const accounts = await EthereumClient.instance.web3.eth.getAccounts();

    // await Contracts.Market.get()
    //   .methods.setTokenApproval(token.chain.contract, true)
    //   .send({ from: accounts[0] });

    // console.log('approved token');

    // await Contracts.Market.get()
    //   .methods.setCurrencyApproval(
    //     '0x9561C133DD8580860B6b7E504bC5Aa500f0f06a7',
    //     true
    //   )
    //   .send({ from: accounts[0] });

    // console.log('approved currency');

    hash = EthereumClient.instance.web3.eth.accounts.sign(
      hash,
      process.env.ETH_MARKET_ADMIN_PK
    );

    console.log(hash);

    await Contracts.Token.get()
      .methods.setApprovalForAll(
        Contracts.MarketWallet.get().options.address,
        true
      )
      .send({ from: token.chain.creator });

    await Contracts.Market.get()
      .methods.sell(
        token.chain.creator,
        token.chain.contract,
        token.chain.id,
        1,
        '0x9561C133DD8580860B6b7E504bC5Aa500f0f06a7',
        100000,
        expiry,
        salt,
        hash.signature
      )
      .send({
        from: token.chain.creator
      });

    console.log('listed token');
  };

  return (
    <div className="boxed">
      <Head>
        <title>{token?.name || id}</title>
      </Head>

      {minting && (
        <MintToken
          onExecuted={() => {
            setTimeout(() => {
              setMinting(false);
              setTimeout(() => {
                router.reload();
              }, 500);
            }, 2000);
          }}
        />
      )}

      {token && (
        <TokenContainer>
          {token.minted && (
            <TokenHoldersContainer>
              <h3>Top holders</h3>
              <TokenHolders
                token={token.id}
                selected={ownership}
                setSelected={(o: TokenOwnershipDTO) => setOwnership(o)}
                currentUser={currentUser}
              />
            </TokenHoldersContainer>
          )}
          <TokenInfo>
            <TokenHeading>
              <h1>{token?.name}</h1>
              <h3>
                {token?.supply}{' '}
                <span style={{ fontWeight: 'normal', fontSize: '11pt' }}>
                  in total
                </span>
              </h3>
              {/* {ownership && <p>Owned: {ownership?.quantity}</p>} */}
            </TokenHeading>

            {token.description && <p>{token.description}</p>}

            <PreviewContainer>
              <Image
                src="/images/token-sample-1.jpg"
                layout="fill"
                objectFit="cover"
              />
            </PreviewContainer>

            <TokenCreatorCard>
              <Avatar className="avatar"></Avatar>
              <div className="token-creator-info">
                <Link href={getProfileUrl({ id: token.creatorId })}>
                  <h4>{getDisplayName(token.creator)}</h4>
                </Link>
                <p className="small">{token.creator.bio}</p>
              </div>
            </TokenCreatorCard>

            {token?.creatorId == currentUser?.id && !token?.minted && (
              <TokenActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => {
                    setMinting(true);
                  }}
                >
                  Mint token
                </Button>
              </TokenActions>
            )}

            {isOwn && (
              <TokenActions>
                <Button
                  size="small"
                  onClick={() => {
                    giveToken();
                  }}
                >
                  Give to 0xFF...09f0
                </Button>
              </TokenActions>
            )}
          </TokenInfo>
        </TokenContainer>
      )}
    </div>
  );
}
