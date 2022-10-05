import styled from '@emotion/styled';

export const Spacing = styled.div<{
  size?: 'normal' | 'tiny' | 'small' | 'large';
  custom?: string;
}>`
  padding: ${(props) => {
    if (props.custom) return props.custom;

    switch (props.size) {
      case 'tiny':
        return '4px';
      case 'small':
        return '10px';
      case 'large':
        return '30px';
      default:
        '15px';
    }
  }};
`;
