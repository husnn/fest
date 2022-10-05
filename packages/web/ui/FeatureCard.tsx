import { Spacing } from './Spacing';
import { colors } from '../styles/constants';
import styled from '@emotion/styled';

export type FeatureCardProps = {
  title: string;
  description: string;
  color: string;
  imageUrl: string;
};

const Item = styled.div<{ image?: string }>`
  max-width: 450px;
  height: 180px;
  padding: 0 0 0 20px;

  background-color: white;
  background-image: url(${(props) => props.image});
  background-position: center right;
  background-repeat: no-repeat;
  background-size: contain;

  display: flex;
  flex-direction: column;
  justify-content: center;

  border-radius: 20px;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.025);

  transition: all 300ms;

  &:hover {
    box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.05);
  }

  @media screen and (max-width: 500px) {
    background-position: center right -70px;
  }
`;

const Title = styled.h3<{ color?: string }>`
  width: 60%;
  color: ${(props) => `${props.color}`};
  font-size: 14pt;
`;

const Text = styled.p<{ color?: string }>`
  width: 60%;
  color: ${(props) => `${props.color}`};
`;

export const FeatureCard = ({
  title,
  description,
  color,
  imageUrl
}: FeatureCardProps) => {
  return (
    <Item image={imageUrl}>
      <Title color={color}>{title}</Title>
      <Spacing size="tiny" />
      <Text color={colors.blueDarkest}>{description}</Text>
    </Item>
  );
};

export default FeatureCard;
