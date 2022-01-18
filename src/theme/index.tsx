import { createTheme, ThemeProvider } from "@mui/material/styles";
import { PropsWithChildren } from "react";

const theme = createTheme({
  palette: {
    primary: {
      main: "#f2f2f2",
    },
    secondary: {
      main: "#273a4c",
    },
  },
  typography: {
    fontFamily: "Rubik",
  },
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#337ab7",
        },
      },
    },
  }
});

export default function Palette({ children }: PropsWithChildren<{}>) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
