import React, { useState } from 'react';

import { HeaderLinkType } from '../../components/Header';

export const HeaderContext = React.createContext(null);

type HeaderProviderProps = {
  children: React.ReactNode;
};

export const HeaderProvider: React.FC<HeaderProviderProps> = ({
  children
}: HeaderProviderProps) => {
  const [links, setLinks] = useState<HeaderLinkType[]>([]);

  return (
    <HeaderContext.Provider value={{ links, setLinks }}>
      {children}
    </HeaderContext.Provider>
  );
};

export default HeaderProvider;
