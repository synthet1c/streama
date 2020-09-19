import { createMuiTheme } from '@material-ui/core';

const border = '#362342'

export const theme = createMuiTheme({
  palette: {
    type: 'dark',
    action: {
      active: '#cb5fd2',
      hover: 'transparent',
      selected: 'rgba(255, 255, 255, 0.08)',
      disabled: 'rgba(255, 255, 255, 0.26)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
      focus: 'rgba(255, 255, 255, 0.12)'
    },
    background: {
      default: '#2a2139',
      paper: '#281f35'
    },
    primary: {
      main: '#cb5fd2'
    },
    secondary: {
      main: '#44a4c1'
    },
    text: {
      primary: '#ada8b7',
      secondary: '#adb0bb'
    }
  },
  typography: {
    htmlFontSize: 16,
    fontSize: 13,
  },
  shape: {
    borderRadius: 1
  },
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
    MuiLink: {
      color: 'primary'
    },
    MuiTextField: {
      InputLabelProps: {
        shrink: true
      }
    },
  },
  overrides: {
    MuiDrawer: {
      paperAnchorDockedLeft: {
        borderRight: '1px solid #3b2648'
      }
    },
    MuiCssBaseline: {
      '@global': {
        '*::-webkit-scrollbar': {
          width: '0.4em'
        },
        '*::-webkit-scrollbar-track': {
          '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,.1)',
          outline: '1px solid slategrey'
        }
      },
    }
  }
})


export const synthwaveTheme = createMuiTheme({
  palette: {
    type: 'dark',
    action: {
      active: 'rgba(255, 255, 255, 0.54)',
      hover: 'rgba(255, 255, 255, 0.04)',
      selected: 'rgba(255, 255, 255, 0.08)',
      disabled: 'rgba(255, 255, 255, 0.26)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
      focus: 'rgba(255, 255, 255, 0.12)'
    },
    background: {
      default: '#282C34',
      paper: '#2e333c'
    },
    primary: {
      main: '#cb5fd2'
    },
    secondary: {
      main: '#44a4c1'
    },
    text: {
      primary: '#ada8b7',
      secondary: '#adb0bb'
    }
  },
  typography: {
    htmlFontSize: 16,
    fontSize: 13,
  },
  shape: {
    borderRadius: 1
  },
  props: {
    MuiLink: {
      color: 'primary'
    }
  },
  overrides: {
    MuiLink: {
      root: {
        // color: 'red'
      }
    }
  }
})
