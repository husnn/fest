import React, { createContext, useCallback, useContext, useState } from 'react';
import { colors, corners, fontSize } from '../styles/constants';

import styled from '@emotion/styled';

const Wrapper = styled.div`
  width: 100%;
  max-width: 500px;
`;

const Section = styled.div`
  background-color: ${colors.blueHalo};
  color: ${colors.blue};
  padding: 25px 30px;
  margin-bottom: 10px;
  border-radius: ${corners.sm};
  cursor: pointer;
`;

const Heading = styled.h3`
  width: 100%;
`;

const Body = styled.div`
  padding: 20px 0 0;
  font-weight: 400;
  font-size: ${fontSize.regular};
  color: ${colors.black};
`;

type AccordionContextProps = {
  selectedHeading: string;
  toggle: (heading: string) => void;
};

const AccordionContext = createContext<AccordionContextProps>(null);

Accordion.Section = (props: {
  heading: string;
  children: React.ReactChild;
}) => {
  const context = useContext(AccordionContext);

  return (
    <Section onClick={() => context?.toggle(props.heading)}>
      <Heading>{props.heading}</Heading>
      {context?.selectedHeading === props.heading && (
        <Body>{props.children}</Body>
      )}
    </Section>
  );
};

export default function Accordion(props: { children: React.ReactNode }) {
  const [selectedHeading, setSelectedHeading] = useState('');

  const toggle = useCallback(
    (heading) => {
      if (heading == selectedHeading) heading = '';
      setSelectedHeading(heading);
    },
    [selectedHeading, setSelectedHeading]
  );

  return (
    <AccordionContext.Provider
      value={{
        selectedHeading,
        toggle
      }}
    >
      <Wrapper>{props.children}</Wrapper>
    </AccordionContext.Provider>
  );
}
