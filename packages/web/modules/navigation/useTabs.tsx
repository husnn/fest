import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

export type Tab = {
  id: string;
  title: string;
};

export type Tabs = {
  [key: string]: Tab;
};

export const useTabs = () => {
  const router = useRouter();

  const { tab } = router.query;

  const [tabs, setTabs] = useState<Tab[]>([]);
  const [tabSelected, setTabSelected] = useState<Tab>();

  const findById = (id: string) => tabs.find((tab) => tab.id === id);

  useEffect(() => {
    const selectedTab = findById(tab as string) || tabs[0];
    setTabSelected(selectedTab);
  }, [tabs, tab]);

  const selectTab = (tab: Tab) => {
    router.push({ query: { tab: tab.id } });
  };

  const initTabs = (tabs: Tabs) => {
    setTabs(Object.values(tabs));
  };

  return { initTabs, setTabs, tabs, tabSelected, selectTab };
};

export default useTabs;
