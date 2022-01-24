/** @jsxImportSource @emotion/react */
import { Button, TextArea } from '../ui';
import {
  CommunityDTO,
  JoinChannelData,
  MessageDTO,
  MessageType,
  SendMessageData
} from '@fest/shared';
import React, { useEffect, useRef, useState } from 'react';

import { ApiClient } from '../modules/api';
import Head from 'next/head';
import HouseSocketProvider from '../modules/house/HouseSocketProvider';
import { Socket } from 'socket.io-client';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import useAuthentication from '../modules/auth/useAuthentication';
import useHouseSocket from '../modules/house/useHouseSocket';
import usePagination from '../modules/api/usePagination';
import { useRouter } from 'next/router';

export const CommunityList = ({
  initial,
  user,
  selected,
  onSelect,
  showing = true
}: {
  user: string;
  selected?: CommunityDTO;
  initial?: string;
  showing?: boolean;
  onSelect: (community: CommunityDTO) => void;
}) => {
  const { data } = usePagination<CommunityDTO>((count: number, page: number) =>
    ApiClient.instance.getCommunitiesForUser(user, count, page)
  );

  useEffect(() => {
    if (selected) return;
    const initialCommunity = data.find((item) => item.id == initial);
    if (initialCommunity) onSelect(initialCommunity);
  }, [data]);

  return showing ? (
    <div
      css={css`
        width: 100%;
        max-width: 300px;
        height: 100vh;
        background-color: #fefefe;
        padding-top: 20px;
        border-right: 1px solid #eee;

        @media screen and (max-width: 800px) {
          max-width: 100%;
        }
      `}
    >
      <h5
        css={css`
          padding: 10px;
          margin-bottom: 20px;
        `}
      >
        Your communities
      </h5>
      {data.map((c) => {
        return (
          <div
            key={c.id}
            onClick={() => onSelect(c)}
            css={css`
              width: 100%;
              min-height: 50px;
              padding: 10px;
              display: flex;
              align-items: center;
              border-bottom: 1px solid #eee;
              cursor: pointer;

              &:hover {
                background-color: #f5f5f5;
              }

              background-color: ${c.id == selected?.id ? '#fefefe' : '#fff'};
              font-weight: ${c.id == selected?.id ? 'bold' : 'normal'};
            `}
          >
            {c.name}
          </div>
        );
      })}
    </div>
  ) : null;
};

const ComposerActions = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

const Composer = ({ onSubmit }: { onSubmit: (message: string) => void }) => {
  const [message, setMessage] = useState<string>();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        onSubmit(message);
        setMessage('');
      }}
      css={css`
        width: 450px;
        padding: 30px 10px;
        background-color: #fff;
        display: flex;
        flex-direction: column;
        position: fixed;
        bottom: 20px;
        border-radius: 20px;

        textarea {
          height: 50px;
          min-height: 50px;
          max-height: 100px;
        }

        > * + * {
          margin-top: 10px;
        }

        @media screen and (max-width: 800px) {
          width: 100%;
        }
      `}
    >
      <TextArea
        placeholder="Write your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key == 'Enter' && !e.shiftKey) {
            e.preventDefault();

            onSubmit(message);
            setMessage('');
          }
        }}
      />
      <ComposerActions>
        <Button type="submit" color="primary" size="smaller">
          Send
        </Button>
      </ComposerActions>
    </form>
  );
};

export const Feed = ({
  community,
  socket,
  messages,
  showComposer = false
}: {
  community: CommunityDTO;
  socket: Socket;
  jwt: string;
  messages: MessageDTO[];
  showComposer?: boolean;
}) => {
  const messagesEnd = useRef<HTMLDivElement>();

  const sendMessage = (text: string) => {
    text = text.trim();

    if (text.length === 0) return;

    const message = new MessageDTO({
      communityId: community.id,
      type: MessageType.CHAT,
      text
    });

    socket.emit('sendMessage', message, {
      communityId: community.id
    } as SendMessageData);

    if (messagesEnd?.current)
      messagesEnd.current.scrollIntoView({ behavior: 'smooth' });
  };

  const Message = ({ message }: { message: MessageDTO }) => {
    return (
      <div
        css={css`
          width: 100%;
          margin-bottom: 10px;
          padding: 20px;
          border-radius: 10px;
          background-color: #fefefe;

          &:first-of-type {
            margin-top: 100px;
          }

          &:last-of-type {
            margin-bottom: 50px;
          }
        `}
      >
        {message.text}
      </div>
    );
  };

  return (
    <div
      css={css`
        width: 100%;
        height: 100vh;
        padding: 0 10px;
        background-color: #f5f5f5;
        position: relative;
      `}
    >
      <div
        css={css`
          height: 100%;
          display: flex;
          padding-bottom: 200px;
          flex-direction: column;
          align-items: center;
          white-space: pre-wrap;
          overflow-y: auto;
        `}
      >
        {messages?.map((m, i) => {
          return <Message key={i} message={m} />;
        })}
        <span ref={messagesEnd} />
        {showComposer && (
          <Composer onSubmit={(message) => sendMessage(message)} />
        )}
      </div>
    </div>
  );
};

export const House = () => {
  const { currentUser } = useAuthentication();

  const [community, setCommunity] = useState<CommunityDTO>();
  const [jwt, setJwt] = useState<string>();

  const router = useRouter();
  const [initialCommunity, setInitialCommunity] = useState<string>();

  useEffect(() => {
    if (initialCommunity) return;
    setInitialCommunity(router.query.c as string);
  }, [router]);

  const [communityTokens, setCommunityTokens] = useState<{
    [community: string]: string;
  }>({});

  useEffect(() => {
    if (!community) return;

    const cached = communityTokens[community.id];
    if (cached) return setJwt(cached);

    console.log('Getting new token...');

    ApiClient.getInstance()
      .getCommunityToken(community.id)
      .then((res) => {
        setCommunityTokens((tokens) => {
          return {
            ...tokens,
            [community.id]: res.token
          };
        });
        setJwt(res.token);
      });
  }, [community]);

  const [communityMessages, setCommunityMessages] = useState<{
    [community: string]: MessageDTO[];
  }>({});

  const [newMessage, setNewMessage] = useState<MessageDTO>();

  const socket = useHouseSocket();

  const [communityListHidden, setCommunityListHidden] = useState(false);
  const [width, setWidth] = useState<number>(0);

  const showCommunityList = width >= 800 || !communityListHidden;

  useEffect(() => {
    const handleWindowSizeChange = () => setWidth(window.innerWidth);

    window.addEventListener('resize', handleWindowSizeChange);
    handleWindowSizeChange();

    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  useEffect(() => {
    if (!socket || !community || !jwt) return;
    socket.emit('join', {
      communityId: community.id,
      token: jwt
    } as JoinChannelData);
  }, [socket, jwt]);

  useEffect(() => {
    if (!socket) return;

    socket.on('newMessage', setNewMessage);

    return () => {
      socket.off('newMessage');
    };
  }, [socket]);

  useEffect(() => {
    if (!newMessage) return;
    setCommunityMessages({
      ...communityMessages,
      [community.id]: [
        ...(communityMessages[community.id]
          ? communityMessages[community.id]
          : []),
        newMessage
      ]
    });
  }, [newMessage]);

  return currentUser ? (
    <div
      className="container"
      css={css`
        padding: 0;
        display: flex;
        flex-direction: row;

        @media screen and (max-width: 800px) {
          flex-direction: column;
        }
      `}
    >
      {community && (
        <Head>
          <title>{community.name}</title>
        </Head>
      )}
      <CommunityList
        initial={initialCommunity}
        selected={community}
        user={currentUser.id}
        showing={showCommunityList}
        onSelect={(community: CommunityDTO) => {
          router.push({ query: { c: community.id } });
          setCommunity(community);
        }}
      />

      {community && (
        <Feed
          socket={socket}
          messages={communityMessages[community.id]}
          jwt={jwt}
          community={community}
          // showComposer={!showCommunityList || width >= 800}
          showComposer={true}
        />
      )}
    </div>
  ) : null;
};

export const HousePage = () => {
  return (
    <div>
      <Head>
        <title>House</title>
      </Head>
      <HouseSocketProvider>
        <House />
      </HouseSocketProvider>
    </div>
  );
};

export default HousePage;
