import React from 'react';
import styled from '@emotion/styled';

const Input = styled.input``;

export interface TextInputProps extends React.ComponentPropsWithoutRef<'input'> {
  placeholder?: string;
  value?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  placeholder,
  value,
  onChange,
  ...props
}: TextInputProps) => {
  return (
    <div className="text-input">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => (onChange ? onChange(e) : null)}
        {...props}
      />
    </div>
  );
};

export default TextInput;
