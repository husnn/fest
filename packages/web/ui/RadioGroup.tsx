import React from 'react';

import styled from '@emotion/styled';

export type RadioOption = {
  id: string;
  label: string;
};

type RadioProps = {
  category: string;
  options: RadioOption[];
  selected?: RadioOption;
  onSelect: (option: RadioOption) => void;
};

const RadioGroupContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
`;

const Radio = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const RadioButton = styled.input`
  width: 15px;
`;

export const RadioGroup: React.FC<RadioProps> = ({
  category,
  options,
  selected,
  onSelect
}: RadioProps) => {
  return (
    <RadioGroupContainer>
      {options.map((option: RadioOption, index: number) => (
        <Radio key={index}>
          <RadioButton
            type="radio"
            id={option.id}
            name={category}
            value={option.id}
            onChange={() => {
              onSelect(option);
            }}
            checked={selected && selected.id == option.id}
          />
          <label htmlFor={option.id}>{option.label}</label>
        </Radio>
      ))}
    </RadioGroupContainer>
  );
};

export default RadioGroup;
