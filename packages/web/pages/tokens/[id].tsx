import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { setTimeout } from 'timers';

import styled from '@emotion/styled';
import { Protocol, TokenDTO, TokenOwnershipDTO, WalletType } from '@fanbase/shared';

import CreateTokenListing from '../../components/CreateTokenListing';
import TokenHolders from '../../components/TokenHolders';
import TokenListings from '../../components/TokenListings';
import ApiClient from '../../modules/api/ApiClient';
import useAuthentication from '../../modules/auth/useAuthentication';
import EthereumClient from '../../modules/ethereum/EthereumClient';
import useEthereum from '../../modules/ethereum/useEthereum';
import SpinnerSvg from '../../public/images/spinner.svg';
import { Button, Link } from '../../ui';
import Modal from '../../ui/Modal';
import { getDisplayName, getProfileUrl } from '../../utils';

const TokenContainer = styled.div`
  width: 100%;
  padding-bottom: 50px;
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;

  @media screen and (max-width: 500px) {
    flex-direction: column-reverse;
  }
`;

const TokenMain = styled.div`
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
  margin-top: 20px;
  padding: 10px 0;
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
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  border-radius: 30px;

  > * + * {
    margin-top: 10px;
  }
`;

const TokenHoldersContainer = styled.div`
  width: 100%;
  min-width: 300px;
  margin-left: 30px;
  flex: 0.5;

  @media screen and (max-width: 500px) {
    margin: 30px 0;
  }
`;

const PreviewContainer = styled.div`
  position: relative;
  width: 100%;
  height: auto;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 100% 100%;
    border-radius: 10px;
  }
`;

export default function TokenPage() {
  const router = useRouter();
  const { currentUser } = useAuthentication();

  useEthereum();

  const { id, o } = router.query;

  const [token, setToken] = useState<TokenDTO>();
  const [isOwn, setOwn] = useState(false);
  const [ownership, setOwnership] = useState<TokenOwnershipDTO>();

  const [minting, setMinting] = useState(false);
  const [creatingListing, setCreatingListing] = useState(false);

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
      router.push({ query: { o: ownership.id } }, undefined, { scroll: false });
  }, [token, ownership]);

  const MintToken = ({ onExecuted }: { onExecuted: () => void }) => {
    const [executing, setExecuting] = useState(false);
    const [executed, setExecuted] = useState(false);

    const execute = async () => {
      setExecuting(true);

      try {
        let hash;

        if (currentUser.wallet.type == WalletType.INTERNAL) {
          hash = await ApiClient.instance?.mintToken(
            token.id,
            Protocol.ETHEREUM
          );
        } else {
          const approval = await ApiClient.instance.approveMint(
            token.id,
            Protocol.ETHEREUM
          );

          hash = await EthereumClient.instance?.mintToken(
            token,
            approval.data,
            approval.expiry,
            approval.salt,
            approval.signature
          );
        }

        setExecuted(true);

        await EthereumClient.instance.checkTxConfirmation(hash);

        onExecuted();
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

  return (
    <div className="boxed">
      <Head>
        <title>{token?.name || id}</title>
      </Head>

      {minting && (
        <MintToken
          onExecuted={() => {
            setTimeout(() => {
              router.reload();
            }, 1000);
          }}
        />
      )}

      {creatingListing && (
        <Modal
          show={creatingListing}
          requestClose={() => setCreatingListing(false)}
          title="List your token for sale"
          cancel="Cancel"
        >
          <CreateTokenListing
            token={token}
            ownership={ownership}
            onSuccess={() => {
              setTimeout(() => {
                router.reload();
              }, 1000);
            }}
          />
        </Modal>
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
                listForSale={() => {
                  setCreatingListing(true);
                }}
              />
            </TokenHoldersContainer>
          )}
          <TokenMain>
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

            <PreviewContainer>
              <img src={token.image || '/images/token-sample-1.jpg'} />
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

            {token.description && (
              <p style={{ whiteSpace: 'pre-line' }}>{token.description}</p>
            )}

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

            <TokenListings token={token} />
          </TokenMain>
        </TokenContainer>
      )}
    </div>
  );
}
