/** @jsxImportSource @emotion/react */
import { Button, Link } from '../../ui';
import {
  Protocol,
  TokenDTO,
  TokenListingDTO,
  TokenOwnershipDTO,
  TokenType
} from '@fest/shared';
import React, { useEffect, useState } from 'react';
import {
  getDisplayName,
  getHomeUrl,
  getImageUrl,
  getProfileUrl
} from '../../utils';

import ApiClient from '../../modules/api/ApiClient';
import CreateTokenListing from '../../components/CreateTokenListing';
import Head from 'next/head';
import Modal from '../../ui/Modal';
import SpinnerSvg from '../../public/images/spinner.svg';
import TokenHolders from '../../components/TokenHolders';
import TokenListings from '../../components/TokenListings';
import { css } from '@emotion/react';
import { setTimeout } from 'timers';
import styled from '@emotion/styled';
import useAuthentication from '../../modules/auth/useAuthentication';
import usePagination from '../../modules/api/usePagination';
import { useRouter } from 'next/router';
import useWeb3 from '../../modules/web3/useWeb3';
import TokenAttributes from '../../ui/TokenAttributes';

const TokenContainer = styled.div`
  width: 100%;
  padding-bottom: 50px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;

  > div {
    flex-grow: 1;
  }

  > * + * {
    margin-top: 30px;
  }
`;

const TokenMain = styled.div`
  width: 100%;
  min-width: 300px;
  max-width: 700px;
  flex-basis: 50%;

  > * + * {
    margin-top: 30px;
  }
`;

const TokenHeading = styled.div`
  .exclusive {
    font-weight: 700;
    background: linear-gradient(to right, #30cfd0 0%, #330867 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  > * + * {
    margin-top: 5px;
  }
`;

const TokenCreatorCard = styled.div`
  margin-top: 30px;
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
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 20px;

  img {
    max-width: 100%;
    max-height: 500px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 10px;
  }
`;

const Section = ({
  title,
  children,
  noPadding = false,
  noBackground = false
}: {
  title?: string;
  noPadding?: boolean;
  noBackground?: boolean;
  children: React.ReactElement;
}) => {
  const SectionHeading = styled.h3`
    margin-bottom: 20px;
  `;

  return (
    <div
      css={css`
        height: fit-content;
        background-color: ${noBackground ? 'none' : '#fafafa'};
        padding: ${noPadding ? '0' : '30px 20px'};
        white-space: pre-wrap;
        border-radius: 30px;

        @media screen and (min-width: 500px) {
          padding: ${noPadding ? '0' : '50px 30px'};
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
        const hash = await ApiClient.instance?.mintToken(
          token.id,
          Protocol.ETHEREUM
        );

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

  const isExclusive = token?.supply == 1;

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
              <h3
                {...(isExclusive && {
                  className: 'exclusive'
                })}
              >
                {isExclusive ? (
                  'Exclusive'
                ) : (
                  <React.Fragment>
                    {token?.supply}
                    <span style={{ fontWeight: 'normal', fontSize: '11pt' }}>
                      {' '}
                      in total
                    </span>
                  </React.Fragment>
                )}
              </h3>
            </TokenHeading>

            {token.type == TokenType.YT_VIDEO && (
              <Section noPadding noBackground>
                <Link
                  target="_blank"
                  href={token.youtubeUrl}
                  css={css`
                    width: fit-content;
                    padding: 10px 20px;
                    color: #0a0a0a;
                    background-color: #fafafa;
                    display: flex;
                    align-items: center;
                    border-radius: 10px;

                    p {
                      margin-top: 3px;
                    }

                    > * + * {
                      margin-left: 10px;
                    }
                  `}
                >
                  <img src="/images/ic-youtube.png" width={20} />
                  <p>YouTube Video</p>
                </Link>
              </Section>
            )}

            <PreviewContainer
              style={{ padding: !token.image ? '50px 25px' : 0 }}
            >
              {token.image ? (
                <img src={getImageUrl(token.image)} />
              ) : (
                <img src={'/images/ic-token.svg'} width={200} />
              )}
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

            {token?.minted && (
              <TokenActions>
                <Button
                  color="secondary"
                  onClick={() => router.push(getHomeUrl(token.communities[0]))}
                >
                  Go to community feed
                </Button>
              </TokenActions>
            )}

            {token.attributes && <TokenAttributes attrs={token.attributes} />}

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

            {/* {token.communities && token.communities.length > 0 && (
              <Section title='Communities'>
                <TokenCommunities
                  communities={token.communities}
                  onSelected={(community) => router.push(getHomeUrl(community))}
                />
              </Section>
            )} */}

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
            <Section title="Owners">
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
