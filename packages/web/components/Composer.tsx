/** @jsxImportSource @emotion/react */
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
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
  border-radius: 5px;

  @media screen and (min-width: 500px) {
    padding: 20px 15px 0;
  }
`;

const Actions = styled.div`
  min-height: 60px;
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

const MediaPreview = ({
  files,
  onRemove
}: {
  files: File[];
  onRemove: (index: number) => void;
}) => {
  return (
    <div
      css={css`
        width: auto;
        height: 100px;
        white-space: nowrap;
        padding: 5px;
        overflow-y: scroll;

        > * + * {
          margin-left: 5px;
        }
      `}
    >
      {files.map((f, i) => (
        <img
          key={i}
          src={window.URL.createObjectURL(f)}
          css={css`
            height: 100%;
            padding: 5px;
            border-radius: 20px;
            cursor: pointer;

            &:hover {
              opacity: 0.7;
            }
          `}
          onClick={() => onRemove(i)}
        />
      ))}
    </div>
  );
};

const Composer = ({
  selected,
  communities,
  onSubmit
}: {
  selected?: CommunityDTO;
  communities: CommunityDTO[];
  onSubmit: (text: string, media: File[], communityId: string) => void;
}) => {
  const elRef = useRef<HTMLElement>();

  const [html, setHtml] = useState<string>('');
  const textRef = useRef<string>('');

  const postCommunity = useRef<CommunityDTO>();

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  useEffect(() => {
    elRef.current.focus();
    textRef.current = stripHtml(html).trim();
  }, [html]);

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const mediaFileRef = useRef<File[]>();

  mediaFileRef.current = mediaFiles;

  const submit = () => {
    if (textRef.current.length < 1) return;
    onSubmit(textRef.current, mediaFileRef.current, postCommunity.current.id);
    setHtml('');
  };

  const fileInputRef = useRef<HTMLInputElement>();

  const handleMediaSelection = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files.length < 1) return;

    const updated = mediaFiles;

    for (const file of Array.from(files)) {
      if (!updated.find((f) => f.name === file.name && f.size === file.size))
        updated.push(file);
    }

    setMediaFiles([...updated]);
  };

  return (
    <Box>
      <InputArea>
        <ContentEditable
          innerRef={elRef}
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
            white-space: pre-wrap;
            overflow-y: auto;
          `}
        />
        {mediaFiles.length > 0 && (
          <Actions>
            <MediaPreview
              files={mediaFiles}
              onRemove={(index) => {
                mediaFiles.splice(index, 1);
                setMediaFiles([...mediaFiles]);
              }}
            />
          </Actions>
        )}
        <Actions>
          <ActionSide>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple={true}
              style={{ display: 'none' }}
              onChange={(e) => handleMediaSelection(e)}
            />
            <img
              src="/images/ic-post-image-upload.png"
              onClick={() => fileInputRef.current.click()}
            />
          </ActionSide>
          <ActionSide>
            <CommunitySelector
              initial={selected}
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
