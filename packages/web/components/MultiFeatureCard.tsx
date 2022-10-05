import { colors, corners, fontSize } from '../styles/constants';

import { Link } from '../ui';
import React from 'react';
import styled from '@emotion/styled';

const Card = styled.div<{ borderColor: string; image: string }>`
  min-width: 320px;
  min-height: 800px;
  padding: 50px 40px 30px;
  background-color: ${(props) => props.color};
  background-image: url(${(props) => props.image});
  background-size: cover;
  background-position: calc(50% - 65px) 450px;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  border-radius: ${corners.lg};
  border: 1px solid ${(props) => props.borderColor};

  > a {
    align-self: flex-start;
  }

  @media screen and (min-width: 500px) {
    min-height: 750px;
    background-position: calc(50% - 60px) 400px;
  }
`;

const Title = styled.h2`
  text-align: center;
  color: ${colors.orangeLava};
`;

const List = styled.ul`
  list-style: none;
  padding: 20px 0 0;
`;

const ListItem = styled.li`
  color: ${colors.black};
  font-size: ${fontSize.regular};
  font-weight: 400;
  margin-bottom: 20px;
`;

MultiFeatureCard.Feature = (props: { children: React.ReactNode }) => {
  return <ListItem>{props.children}</ListItem>;
};

export default function MultiFeatureCard(props: {
  title: string;
  image: string;
  color: string;
  borderColor: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      color={props.color}
      borderColor={props.borderColor}
      image={props.image}
    >
      <Title>{props.title}</Title>
      <List>{props.children}</List>
      <Link style={{ color: colors.orangeLava }} href="/waitlist">
        Apply now
      </Link>
    </Card>
  );
}
