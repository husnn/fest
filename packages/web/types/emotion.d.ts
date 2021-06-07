import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
    color: {
      primary: string;
      secondary: string;
      accent: string;
      light: string;
      dark: string;
    };
    button: {
      corners: string;
    };
  }
}
