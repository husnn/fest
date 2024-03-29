import React from 'react';
import Spinner from './Spinner';
import fontSize from '../styles/constants/fontSize';
import styled from '@emotion/styled';

type ButtonStyle = 'normal' | 'primary' | 'secondary' | 'ghost';

type ButtonSize = 'regular' | 'small' | 'smaller' | 'large';

const ButtonStyled = styled.button<ButtonProps>`
  height: ${(props) => (props.size === 'small' ? '40px' : 'auto')};
  max-height: 50px;
  padding: ${(props) => {
    let padding = '15px 30px';

    if (props.size === 'small') {
      padding = '10px 20px';
    } else if (props.size == 'smaller') {
      padding = '5px 15px';
    }

    return padding;
  }};
  color: ${(props) => {
    let color: string = props.theme.color.dark;

    if (props.color === 'primary') {
      color = props.theme.color.light;
    } else if (props.color === 'secondary') {
      color = props.theme.color.primary;
    }

    return color;
  }};
  background-color: ${(props) => {
    let color: string = props.theme.color.light;

    if (props.color) {
      switch (props.color) {
        default:
        case 'normal':
          color = props.theme.color.light;
          break;
        case 'primary':
          color = props.theme.color.primary;
          break;
        case 'secondary':
          color = props.theme.color.secondary;
          break;
        case 'ghost':
          color = 'rgba(0, 0, 0, 0.0)';
          break;
      }
    }

    return color;
  }};
  font-size: ${(props) => {
    return fontSize.regular;
  }};
  font-weight: bold;
  border: ${(props) => {
    return !props.color || props.color == 'normal' || props.color == 'ghost'
      ? '1px solid ' + '#AAA'
      : '0';
  }};
  border-radius: ${(props) => props.theme.button.corners};
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ButtonStyle;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = ({
  loading = false,
  children,
  ...props
}: ButtonProps) => {
  return (
    <ButtonStyled {...props} disabled={loading || props.disabled}>
      {loading ? <Spinner /> : children}
    </ButtonStyled>
  );
};

export default Button;
