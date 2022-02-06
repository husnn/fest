import React, { createRef, useRef, useState } from 'react';

import styled from '@emotion/styled';

import { corners } from '../styles/constants';

type DigitInputProps = {
  length?: number;
  onDelete?: () => void;
  onEnter: (code: string) => void;
};

const DigitInputForm = styled.div`
  width: 100%;

  display: flex;
  flex-direction: row;

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const DigitInputBox = styled.input`
  max-width: 35px;
  height: 40px;
  margin-left: 5px;
  padding: 0 !important;
  color: #555;
  font-weight: bold;
  font-size: 11pt;
  text-align: center;
  border: 0;
  outline: none;
  border-radius: ${corners.xs};
`;

const DigitInput: React.FC<DigitInputProps> = ({
  length = 4,
  onDelete,
  onEnter
}: DigitInputProps) => {
  const [code, setCode] = useState('');

  const inputRefs = useRef(
    [...Array(length)].map(() => createRef<HTMLInputElement>())
  );

  const handleInput = (value: string, key: number) => {
    let focusIndex = key;
    let newCode: string;

    if (value) {
      newCode = code.concat(value);
      focusIndex += value.length;
    } else {
      newCode = code.slice(0, -1);
      focusIndex -= 1;
      onDelete ? onDelete() : null;
    }

    setCode(newCode);

    if (newCode.length == length) {
      onEnter(newCode);
      return;
    }

    if (focusIndex >= 0 && focusIndex < length) {
      inputRefs.current[focusIndex].current.focus();
    }
  };

  return (
    <DigitInputForm>
      {[...Array(length)].map((e, i) => (
        <DigitInputBox
          type="number"
          key={i}
          maxLength={1}
          ref={inputRefs.current[i]}
          value={code[i]}
          inputMode="numeric"
          autoComplete="off"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            e.target.value.length > 0 ? handleInput(e.target.value, i) : null
          }
          onKeyDown={(e) => {
            if (e.key === 'Backspace') handleInput(null, i);
          }}
          autoFocus={i == 0}
        />
      ))}
    </DigitInputForm>
  );
};

export default DigitInput;
