/** @jsxImportSource @emotion/react */
import { Button, Link } from '../../ui';
import {
  Protocol,
  TokenDTO,
  TokenListingDTO,
  TokenOwnershipDTO,
  WalletType
} from '@fanbase/shared';
import React, { useEffect, useState } from 'react';
import { getCommunityUrl, getDisplayName, getProfileUrl } from '../../utils';

import ApiClient from '../../modules/api/ApiClient';
import CreateTokenListing from '../../components/CreateTokenListing';
import Head from 'next/head';
import Modal from '../../ui/Modal';
import SpinnerSvg from '../../public/images/spinner.svg';
import TokenCommunities from '../../components/TokenCommunities';
import TokenHolders from '../../components/TokenHolders';
import TokenListings from '../../components/TokenListings';
import { css } from '@emotion/react';
import { setTimeout } from 'timers';
import styled from '@emotion/styled';
import useAuthentication from '../../modules/auth/useAuthentication';
import usePagination from '../../modules/api/usePagination';
import { useRouter } from 'next/router';
import useWeb3 from '../../modules/web3/useWeb3';

const TokenContainer = styled.div`
  width: 100%;
  padding-bottom: 50px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;

  > div {
    flex-grow: 1;
  }

  > * + * {
    margin-top: 20px;
  }
`;

const TokenMain = styled.div`
  width: 100%;
  max-width: 700px;
  flex-basis: 50%;

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

const PreviewContainer = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 100% 100%;
    border-radius: 10px;
  }
`;

const Section = ({
  title,
  children
}: {
  title?: string;
  children: React.ReactElement;
}) => {
  const SectionHeading = styled.h2`
    margin-bottom: 20px;
  `;

  return (
    <div
      css={css`
        height: fit-content;
        background-color: #fafafa;
        padding: 30px 20px;
        white-space: pre-wrap;
        border-radius: 30px;

        @media screen and (min-width: 500px) {
          padding: 50px 30px;
        }
      `}
    >
      {title && <SectionHeading>{title}</SectionHeading>}
      {children}
    </div>
  );
};

export default function TokenPage() {
  const router = useRouter();
  const { currentUser } = useAuthentication();

  const web3 = useWeb3();

  const { id, o } = router.query;

  const [token, setToken] = useState<TokenDTO>();
  const [isOwn, setOwn] = useState(false);
  const [ownership, setOwnership] = useState<TokenOwnershipDTO>();

  const [minting, setMinting] = useState(false);
  const [creatingListing, setCreatingListing] = useState(false);

  const {
    data: listings,
    loadMore: loadMoreListings,
    hasMore: hasMoreListings
  } = usePagination<TokenListingDTO>(
    (count: number, page: number, ...args) =>
      ApiClient.instance.getListingsForToken(...args, count || 5, page),
    [token?.id]
  );

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
      router.replace({ query: { o: ownership.id } }, undefined, {
        scroll: false
      });
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

          const tx = await web3.ethereum.buildMintTokenTx(
            currentUser.wallet.address,
            token.supply,
            token.metadataUri,
            token.fees,
            approval.data,
            approval.expiry,
            approval.salt,
            approval.signature
          );

          hash = await web3.ethereum.sendTx(tx);
        }

        setExecuted(true);

        await web3.awaitTxConfirmation(hash);

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
    <div className="container boxed wider">
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
              <Section title="Description">
                <p>{token.description}</p>
              </Section>
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

            {token.communities && token.communities.length > 0 && (
              <Section title="Communities">
                <TokenCommunities
                  communities={token.communities}
                  onSelected={(community) =>
                    router.push(getCommunityUrl(community))
                  }
                />
              </Section>
            )}

            {listings && listings.length > 0 && (
              <Section title="Market listings">
                <TokenListings
                  listings={listings}
                  currentUserId={currentUser?.id}
                  hasMore={hasMoreListings}
                  loadMore={loadMoreListings}
                />
              </Section>
            )}
          </TokenMain>
          {token.minted && (
            <Section title="Holders">
              <TokenHolders
                token={token.id}
                selected={ownership}
                setSelected={(o: TokenOwnershipDTO) => setOwnership(o)}
                currentUser={currentUser}
                listForSale={() => {
                  setCreatingListing(true);
                }}
              />
            </Section>
          )}
        </TokenContainer>
      )}
    </div>
  );
}
