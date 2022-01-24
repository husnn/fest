import React, { useState } from 'react';

import styled from '@emotion/styled';

const ButtonGroupTrigger = styled.button`
  width: 40px;
  height: 40px;
  display: inline-block;
  background-image: url('images/ic-more.png'});
  background-repeat: no-repeat;
  background-position: center;
  background-size: 16px;
  background-color: ${(props) => {
    return props.theme.color.light;
  }};
  border-radius: 50%;
  border: ${(props) => {
    return !props.color || props.color == 'normal' || props.color == 'ghost'
      ? '1px solid ' + '#AAA'
      : '0';
  }};
  transform: rotate(-90deg);
  transition: all 300ms ease-in-out;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    opacity: 0.8;
  }

  @media screen and (min-width: 400px) {
    display: none;
  }
`;

const ButtonGroupLine = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;

  @media screen and (min-width: 400px) {
    flex-direction: row-reverse;
  }
`;

const ButtonGroupContainer = styled.div<{
  open: boolean;
}>`
  display: flex;
  gap: 10px;

  @media screen and (max-width: 400px) {
    width: 100%;
    margin-top: 10px;
    padding: 20px 10px;
    background-color: #f0f8ff;
    display: ${(props) => (props.open ? 'flex' : 'none')};
    flex-direction: column;
    border-radius: 20px;
  }
`;

type ButtonGroupProps = {
  dropdown: React.ReactNode;
  children: React.ReactNode;
};

export const ButtonGroup = ({ dropdown, children }: ButtonGroupProps) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <div
      className="button-group"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}
    >
      <ButtonGroupLine>
        <ButtonGroupTrigger
          style={{ transform: `rotate(${isOpen ? '-360deg' : '-90deg'})` }}
          onClick={() => setOpen(!isOpen)}
        />
        {children}
        <ButtonGroupContainer open={isOpen}>{dropdown}</ButtonGroupContainer>
      </ButtonGroupLine>
    </div>
  );
};

export default ButtonGroup;
