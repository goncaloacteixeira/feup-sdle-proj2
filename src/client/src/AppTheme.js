import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    type: 'light',
    background: {
      default: '#f6f6f6',
    },
    text: {
      primary: '#1d2020',
      secondary: '#8f8f8f',
    },
    primary: {
      main: '#8c2d19',
    },
    secondary: {
      main: '#1d2020',
    },
  },
});

export default theme;