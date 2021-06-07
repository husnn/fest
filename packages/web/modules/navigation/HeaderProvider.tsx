import React, { useState } from 'react';

import { HeaderLink } from '../../components/Header';

export const HeaderContext = React.createContext(null);

type HeaderProviderProps = {
  defaultLinks?: HeaderLink[];
  children: React.ReactNode;
};

export const HeaderProvider: React.FC<HeaderProviderProps> = ({
  defaultLinks,
  children
}: HeaderProviderProps) => {
  const [links, setLinks] = useState(defaultLinks);

  return (
    <HeaderContext.Provider value={{ links, setLinks }}>
      {children}
    </HeaderContext.Provider>
  );
};

export default HeaderProvider;
