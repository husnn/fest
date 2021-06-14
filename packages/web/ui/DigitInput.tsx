import React, { createRef, useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';

import { colors, corners } from '../styles/constants';

type DigitInputProps = {
  length?: number;
  onDelete: () => void;
  onEnter: (code: string) => void;
};

const DigitInputForm = styled.div`
  width: 100%;
  padding: 15px;
  background-color: ${colors.blueLightest};
  border: 1px solid #ccc;
  border-radius: ${corners.sm};

  display: flex;
  flex-direction: row;
  // justify-content: space-around;
  // gap: 30px;

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const DigitInputBox = styled.input`
  max-width: 40px;
  height: 35px;
  margin: 5px;
  color: #555;
  font-weight: bold;
  font-size: 14pt;
  text-align: center;
  border: 0;
  outline: none;
  border-radius: ${corners.xs};
  box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1);
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
      focusIndex += 1;
    } else {
      newCode = code.slice(0, -1);
      focusIndex -= 1;
      onDelete();
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
          inputMode="numeric"
          autoComplete="off"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleInput(e.target.value, i)
          }
          autoFocus={i == 0}
        />
      ))}
    </DigitInputForm>
  );
};

export default DigitInput;
