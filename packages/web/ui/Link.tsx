import styled from '@emotion/styled';

export const Link = styled.a<{ expandable?: boolean; thinner?: boolean }>`
  cursor: pointer;

  ${(props) => (props.thinner ? 'font-weight: 600;' : '')};

  &:after {
    width: 10px;
    height: 10px;
    margin-left: 10px;
    display: inline-block;
    content: ${(props) =>
      props.expandable ? `url('/images/ic-arrow-down.svg')` : null};
  }
`;

export default Link;
