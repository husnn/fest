import React from 'react';

import { HeaderContext } from './HeaderProvider';

export const useHeader = () => React.useContext(HeaderContext);

export default useHeader;
