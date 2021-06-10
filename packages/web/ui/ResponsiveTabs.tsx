import { useState } from 'react';

import styled from '@emotion/styled';

import { Tab } from '../modules/navigation/useTabs';
import { fontSize } from '../styles/constants';

const ResponsiveTabGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;

  @media screen and (max-width: 800px) {
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
  }

  @media screen and (min-width: 800px) {
    flex-direction: column;
  }
`;

const ResponsiveTab = styled.div<{ selected: boolean }>`
  padding: 10px;
  font-weight: bold;
  color: ${(props) =>
    props.selected ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.3)'};
  font-size: ${fontSize.regular};
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: color 200ms ease;

  @media screen and (min-width: 800px) {
    border: 1px solid #ccc;

    &:first-of-type {
      border-bottom: 0;
      border-radius: 10px 10px 0 0;
    }

    &:last-of-type {
      border-top: 0;
      border-radius: 0 0 10px 10px;
    }
  }
`;

type ResponsiveTabsProps = {
  tabs: Tab[];
  onTabSelected: (tab: Tab) => void;
};

export const ResponsiveTabs = ({
  tabs,
  onTabSelected
}: ResponsiveTabsProps) => {
  const [selected, setSelected] = useState<Tab>(tabs[0]);

  return (
    <ResponsiveTabGroup>
      {tabs.map((tab: Tab, i: number) => (
        <ResponsiveTab
          key={i}
          selected={tab.id == selected.id}
          onClick={() => {
            setSelected(tab);
            onTabSelected(tab);
          }}
        >
          {tab.title}
        </ResponsiveTab>
      ))}
    </ResponsiveTabGroup>
  );
};

export default ResponsiveTabs;
