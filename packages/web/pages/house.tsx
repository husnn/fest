/** @jsxImportSource @emotion/react */
import { Button, TextArea } from '../ui';
import {
  CommunityDTO,
  JoinChannelData,
  MessageDTO,
  MessageType,
  SendMessageData
} from '@fanbase/shared';
import React, { useEffect, useRef, useState } from 'react';

import { ApiClient } from '../modules/api';
import { Socket } from 'socket.io-client';
import { css } from '@emotion/react';
import useAuthentication from '../modules/auth/useAuthentication';
import useHouseSocket from '../modules/house/useHouseSocket';
import usePagination from '../modules/api/usePagination';

export const CommunityList = ({
  user,
  selected,
  onSelect
}: {
  user: string;
  selected?: CommunityDTO;
  onSelect: (community: CommunityDTO) => void;
}) => {
  const { data } = usePagination<CommunityDTO>((count: number, page: number) =>
    ApiClient.instance.getCommunitiesForUser(user, count, page)
  );

  return (
    <div
      css={css`
        width: 250px;
        height: 100vh;
        background-color: #fefefe;
        padding-top: 30px;
        border-right: 1px solid #eee;
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
  );
};

const Composer = ({ onSubmit }: { onSubmit: (message: string) => void }) => {
  const [message, setMessage] = useState<string>();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(message);
      }}
      css={css`
        width: inherit;
        padding: 30px 30px 50px;
        background-color: #fff;
        display: flex;
        flex-direction: row;
        position: fixed;
        bottom: 0;
        border-radius: 30px 30px 0 0;

        textarea {
          resize: none;
        }

        > * + * {
          margin-left: 20px;
        }

        &:before {
          width: inherit;
          content: '';

          position: fixed;
          margin-left: -30px;
          bottom: 160px;
          pointer-events: none;
          background-image: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 1) 100%
          );
          height: 4em;
        }
      `}
    >
      <TextArea
        rows={1}
        placeholder="Write your message..."
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button color="primary" type="submit">
        Send
      </Button>
    </form>
  );
};

export const Feed = ({
  community,
  socket,
  messages
}: {
  community: CommunityDTO;
  socket: Socket;
  jwt: string;
  messages: MessageDTO[];
}) => {
  const messagesEnd = useRef<HTMLDivElement>();

  const sendMessage = (text: string) => {
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
        background-color: #f5f5f5;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-bottom: 250px;
      `}
    >
      <div
        css={css`
          width: 600px;
        `}
      >
        <div
          css={css`
            padding: 50px 0;
          `}
        >
          {messages?.map((m, i) => {
            return <Message key={i} message={m} />;
          })}
        </div>
        <Composer onSubmit={(message) => sendMessage(message)} />
      </div>
    </div>
  );
};

export const HousePage = () => {
  const { currentUser } = useAuthentication();
  const [community, setCommunity] = useState<CommunityDTO>();
  const [jwt, setJwt] = useState<string>();
  const listening = useRef(false);

  useEffect(() => {
    if (!community) return;

    ApiClient.getInstance()
      .getCommunityToken(community.id)
      .then((res) => {
        setJwt(res.token);
      });
  }, [community]);

  const [communityMessages, setCommunityMessages] = useState<{
    [community: string]: MessageDTO[];
  }>({});

  const [newMessage, setNewMessage] = useState<MessageDTO>();

  const socket = useHouseSocket();

  useEffect(() => {
    if (!socket || !community || !jwt) return;
    socket.emit('join', {
      communityId: community.id,
      token: jwt
    } as JoinChannelData);
  }, [socket, jwt]);

  useEffect(() => {
    if (!socket || listening.current) return;

    socket.on('newMessage', setNewMessage);
    listening.current = true;

    return () => {
      socket.off('newMessage');
      listening.current = false;
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
      css={css`
        width: 100%;
        position: absolute;
        overflow: hidden;
        top: 80px;
        left: 0;
        display: flex;
        flex-direction: row;
      `}
    >
      <CommunityList
        selected={community}
        user={currentUser.id}
        onSelect={(community: CommunityDTO) => {
          setCommunity(community);
        }}
      />
      {community && (
        <Feed
          socket={socket}
          messages={communityMessages[community.id]}
          jwt={jwt}
          community={community}
        />
      )}
    </div>
  ) : null;
};

export default HousePage;
