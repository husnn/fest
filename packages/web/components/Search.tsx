/** @jsxImportSource @emotion/react */

import React, { useEffect, useState } from 'react';
import { TextInput } from '../ui';
import { useDebouncedCallback } from 'use-debounce';
import { ApiClient } from '../modules/api';
import { SearchResponse, SearchResultDTO, UserDTO } from '@fest/shared';
import {
  getDisplayName,
  getLocalObject,
  getProfileUrl,
  saveLocalObject
} from '../utils';
import router from 'next/router';
import styled from '@emotion/styled';
import { Avatar } from './Avatar';
import { css } from '@emotion/react';

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ResultContainer = styled.div`
  width: 100%;
  max-width: 300px;

  position: absolute;
  top: 80px;

  padding: 10px 0;
  background: #fff;

  display: flex;
  flex-direction: column;

  border-radius: 15px;
  box-shadow: 4px 8px 20px 4px rgba(0, 0, 0, 0.05);

  @media screen and (max-width: 500px) {
    max-width: unset;
    left: 0;
    right: 0;
  }
`;

const UserRow = styled.div`
  width: 100%;
  height: 60px;

  padding: 0 20px;

  display: flex;
  align-items: center;

  transition: all 500ms;
  cursor: pointer;

  > * + * {
    margin-left: 10px;
  }

  &:hover {
    background: #f5f5f5;
  }
`;

const UserNames = styled.div`
  flex-direction: column;

  > p:nth-of-type(2) {
    font-size: 9pt;
    opacity: 0.7;
  }
`;

const RECENT_SEARCH_KEY = 'recent_search';

export const Search = React.memo(() => {
  const [text, setText] = useState('');
  const [showing, setShowing] = useState(false);
  const [users, setUsers] = useState<UserDTO[]>(
    getLocalObject<SearchResultDTO>(RECENT_SEARCH_KEY)?.users || []
  );

  useEffect(() => debounced(text), [text]);

  const debounced = useDebouncedCallback(
    (value) => {
      if (value.length < 3) {
        const recent = getLocalObject<SearchResultDTO>(RECENT_SEARCH_KEY);
        setUsers(recent ? recent.users : []);
        return;
      }
      ApiClient.getInstance()
        .search(value)
        .then((res: SearchResponse) => {
          setUsers(res.body[0].users);
          setShowing(true);
        })
        .catch((err) => console.log(err));
    },
    // delay in ms
    300
  );

  return (
    <SearchContainer>
      <TextInput
        css={css`
          padding: 10px 20px !important;
          border-radius: 20px !important;
          opacity: 0.7;

          transition: opacity 300ms;

          &:hover {
            opacity: 0.9;
          }
          &:focus {
            opacity: 1;
          }
        `}
        placeholder="Search users..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setShowing(true)}
        onBlur={() => setTimeout(() => setShowing(false), 100)}
      />
      {showing && (
        <ResultContainer>
          {users.map((u, i) => (
            <UserRow
              key={i}
              onClick={() => {
                setShowing(false);

                let recent = getLocalObject<SearchResultDTO>(RECENT_SEARCH_KEY);

                if (recent) {
                  recent.users = recent.users.filter((el) => el.id !== u.id);
                  recent.users.unshift(u);
                } else {
                  recent = new SearchResultDTO({ users: [u] });
                }

                recent = saveLocalObject<SearchResultDTO>(
                  RECENT_SEARCH_KEY,
                  recent
                );
                setUsers(recent.users);

                router.push(getProfileUrl(u));
              }}
            >
              <Avatar user={u} size={40} />
              <UserNames>
                <p>{getDisplayName(u)}</p>
                {u.name && u.username && <p>@{u.username}</p>}
              </UserNames>
            </UserRow>
          ))}
        </ResultContainer>
      )}
    </SearchContainer>
  );
});

export default Search;
