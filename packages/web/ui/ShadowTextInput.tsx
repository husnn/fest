import React, { useEffect, useState } from 'react';
import { TextInput, TextInputProps } from './TextInput';

import styled from '@emotion/styled';

const ShadowInputBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: right;

  input {
    padding-right: 50px;
  }
`;

const ShadowText = styled.span<{clickable: boolean;}>`
  position: absolute;
  margin-right: 15px;
  font-weight: bold;
  cursor: ${(props) => props.clickable ? 'pointer' : 'auto'};
  opacity: 0.3;
`;

export type ShadowOption = {
  id: string;
  text: string;
  data: any;
}

interface ShadowTextInputProps extends TextInputProps {
  text?: string;
  options?: ShadowOption[];
  optionSelected?: (option: ShadowOption) => void;
}

export const ShadowTextInput = (props: ShadowTextInputProps) => {
  const [option, setOption] = useState<ShadowOption>({
    id: 'default',
    text: props.text,
    data: false
  });

  const [hasOptions, setHasOptions] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (props.options?.length > 0) {
      setOption(props.options[index]);
      setHasOptions(true);
    }
  }, [props.options]);

  const cycleOptions = () => {
    if (!hasOptions) return;

    let newIndex = index;

    index < props.options.length - 1
      ? newIndex++
      : newIndex = 0;

    setOption(props.options[newIndex]);
    setIndex(newIndex);

    props.optionSelected
      ? props.optionSelected(props.options[newIndex])
      : null;
  };

  return (
    <ShadowInputBox>
      <TextInput {...props} />
      <ShadowText clickable={hasOptions} onClick={() => cycleOptions()}>
        {option.text}
      </ShadowText>
    </ShadowInputBox>
  );
};

export default ShadowTextInput;
