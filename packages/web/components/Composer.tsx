/** @jsxImportSource @emotion/react */
import React, { useEffect, useRef, useState } from 'react';
import {
  getPreferredCommunityId,
  setPreferredCommunity,
  truncateText
} from '../utils';

import { Button } from '../ui';
import { CommunityDTO } from '@fanbase/shared';
import ContentEditable from 'react-contenteditable';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

const CommunitySelector = ({
  initial,
  communities,
  onSelect
}: {
  initial?: CommunityDTO;
  communities: CommunityDTO[];
  onSelect: (communitY: CommunityDTO) => void;
}) => {
  const [selected, setSelected] = useState<CommunityDTO>(initial);

  useEffect(() => {
    const newSelected = !initial ? getPreferredCommunity() : initial;

    setSelected(newSelected);
    onSelect(newSelected);
  }, [communities]);

  const getPreferredCommunity = () => {
    const storedKey = getPreferredCommunityId();

    let preferred: CommunityDTO;

    if (communities?.length > 0) {
      if (storedKey) preferred = communities.find((c) => c.id === storedKey);
      if (!preferred) preferred = communities[0];
    }

    return preferred;
  };

  return (
    <Button
      size="smaller"
      color="normal"
      onClick={() => {
        const currentIndex = communities.findIndex(
          (c) => c.id === selected?.id
        );
        const nextIndex =
          currentIndex < communities.length - 1 ? currentIndex + 1 : 0;

        setSelected(communities[nextIndex]);
        onSelect(communities[nextIndex]);

        setPreferredCommunity(communities[nextIndex]);
      }}
    >
      {selected?.name && truncateText(selected.name, 15)}
    </Button>
  );
};

const Box = styled.div`
  max-width: 500px;
`;

const InputArea = styled.div`
  display: flex;
  flex-direction: column;
  white-space: pre;
  border-radius: 5px;

  @media screen and (min-width: 500px) {
    padding: 20px 15px 0;
  }
`;

const Actions = styled.div`
  height: 60px;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ActionSide = styled.div`
  padding: 0 20px;
  display: flex;
  flex-direction: row;
  align-items: center;

  > * {
    margin: 0 10px;
  }

  > img {
    max-height: 20px;
    max-width: 20px;
    opacity: 0.5;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }
`;

const Composer = ({
  communities,
  onSubmit
}: {
  communities: CommunityDTO[];
  onSubmit: (text: string, communityId: string) => void;
}) => {
  const [html, setHtml] = useState<string>('');
  const htmlRef = useRef<string>('');

  const postCommunity = useRef<CommunityDTO>();

  useEffect(() => {
    htmlRef.current = html.trim();
  }, [html]);

  const submit = () => {
    if (htmlRef.current.length < 1) return;
    onSubmit(htmlRef.current, postCommunity.current.id);
    setHtml('');
  };

  return (
    <Box>
      <InputArea>
        <ContentEditable
          placeholder="Start by typing something..."
          html={html}
          onChange={(e) => setHtml(e.target.value)}
          onKeyDown={(e) => {
            if (e.key == 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          css={css`
            max-height: 100px;
            padding: 20px;
            font-size: 16px;
            outline: none;
            overflow-y: auto;
          `}
        />
        <Actions>
          <ActionSide>
            <img src="/images/ic-post-image-upload.png" />
          </ActionSide>
          <ActionSide>
            <CommunitySelector
              communities={communities}
              onSelect={(c) => (postCommunity.current = c)}
            />
            <img src="/images/ic-post-send.png" onClick={() => submit()} />
          </ActionSide>
        </Actions>
      </InputArea>
    </Box>
  );
};

export default Composer;
