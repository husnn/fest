import { Theme } from '@emotion/react';

import { colors, corners } from '../constants';

const DefaultTheme: Theme = {
  color: {
    primary: colors.blue,
    secondary: colors.blueLighter,
    accent: colors.blue,
    light: colors.white,
    dark: colors.black
  },
  button: {
    corners: corners.full
  }
};

export { DefaultTheme, DefaultTheme as default };
