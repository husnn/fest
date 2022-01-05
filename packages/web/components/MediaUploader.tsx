import React, { useState } from 'react';

import { Button } from '../ui';
import Dropzone from 'react-dropzone';
import styled from '@emotion/styled';

const UploaderArea = styled.div`
  width:: 100%;
  min-height: 100px;
  height: auto;

  text-align: center;

  border: 2px dashed #ebebeb;
  border-radius: 20px;

  cursor: pointer;

  > div {
    width: 100%;
  }

  .placeholder {
    height: 100px;
    padding-bottom: 10px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .preview {
    height: auto;
    padding: 20px;

    img {
      width: 100%;
      border-radius: 10px;
    }
  }
`;

type MediaUploaderProps = {
  onRead: (file: File) => void;
};

export const MediaUploader = ({ onRead }: MediaUploaderProps) => {
  const [imageSrc, setImageSrc] = useState(undefined);

  return (
    <Dropzone
      multiple={false}
      accept="image/jpeg, image/png"
      onDrop={(files) => {
        if (files.length < 1) return;

        setImageSrc(URL.createObjectURL(files[0]));
        onRead(files[0]);
      }}
    >
      {({ getRootProps, getInputProps }) => (
        <UploaderArea {...getRootProps()}>
          <input {...getInputProps()} />
          {imageSrc ? (
            <div className="preview">
              <img src={imageSrc} />
            </div>
          ) : (
            <div className="placeholder">
              <label>Select media file or drop it here</label>
              <Button type="button" size="smaller">
                Choose file
              </Button>
            </div>
          )}
        </UploaderArea>
      )}
    </Dropzone>
  );
};

export default MediaUploader;
