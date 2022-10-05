import FeatureCard, { FeatureCardProps } from './FeatureCard';

import React from 'react';
import styled from '@emotion/styled';

type FeatureCollectionProps = {
  features: FeatureCardProps[];
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 30px;

  @media screen and (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const FeatureCollection = ({ features }: FeatureCollectionProps) => {
  return (
    <Grid>
      {features.map((f, i) => (
        <FeatureCard key={i} {...f} />
      ))}
    </Grid>
  );
};

export default FeatureCollection;
