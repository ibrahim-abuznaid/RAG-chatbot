import { createTheme as createMuiTheme, responsiveFontSizes } from '@mui/material/styles';
import { BreakpointsOptions } from '@mui/material/styles';
import { alpha, PaletteMode } from '@mui/material/styles';

// Define custom breakpoints
const breakpoints: BreakpointsOptions = {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
};

// Modern color palette
const primaryColor = '#5271FF'; // Modern blue
const secondaryColor = '#FF615A'; // Coral accent
const successColor = '#38C976'; // Fresh green
const infoColor = '#5BB4EF'; // Light blue
const warningColor = '#FFAC33'; // Warm orange
const errorColor = '#FF5A5A'; // Vivid red
const lightBackground = '#F8FAFF'; // Soft light background
const darkBackground = '#1A1F2D'; // Deep blue-grey

// Create and export theme generator function
export const createTheme = (mode: PaletteMode = 'light') => {
  // Define theme options based on mode
  const isDark = mode === 'dark';
  
  // Create palette based on mode
  const palette = {
    mode,
    primary: {
      main: primaryColor,
      light: alpha(primaryColor, 0.8),
      dark: '#3D5BDB',
      contrastText: '#ffffff',
    },
    secondary: {
      main: secondaryColor,
      light: alpha(secondaryColor, 0.8),
      dark: '#E04742',
      contrastText: '#ffffff',
    },
    success: {
      main: successColor,
      light: alpha(successColor, 0.8),
      dark: '#2AA35F',
    },
    info: {
      main: infoColor,
      light: alpha(infoColor, 0.8),
      dark: '#4593C8',
    },
    warning: {
      main: warningColor,
      light: alpha(warningColor, 0.8),
      dark: '#DB8D20',
    },
    error: {
      main: errorColor,
      light: alpha(errorColor, 0.8),
      dark: '#D43B3B',
    },
    background: {
      default: isDark ? darkBackground : lightBackground,
      paper: isDark ? '#232838' : '#ffffff',
    },
    text: {
      primary: isDark ? '#E6E9F4' : '#2A2F45',
      secondary: isDark ? '#A0A7C4' : '#5F647E',
    },
    divider: alpha(isDark ? '#4A5274' : '#A0A7C4', 0.15),
  };

  // Create the theme
  let theme = createMuiTheme({
    breakpoints,
    palette,
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      // Responsive font sizes
      h1: {
        fontSize: '2.75rem',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        '@media (max-width:600px)': {
          fontSize: '2.25rem',
        },
      },
      h2: {
        fontSize: '2.25rem',
        fontWeight: 700,
        letterSpacing: '-0.01em',
        '@media (max-width:600px)': {
          fontSize: '1.9rem',
        },
      },
      h3: {
        fontSize: '1.85rem',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        '@media (max-width:600px)': {
          fontSize: '1.6rem',
        },
      },
      h4: {
        fontSize: '1.6rem',
        fontWeight: 600,
        letterSpacing: '0',
        '@media (max-width:600px)': {
          fontSize: '1.4rem',
        },
      },
      h5: {
        fontSize: '1.35rem',
        fontWeight: 600,
        letterSpacing: '0',
        '@media (max-width:600px)': {
          fontSize: '1.2rem',
        },
      },
      h6: {
        fontSize: '1.15rem',
        fontWeight: 600,
        letterSpacing: '0',
        '@media (max-width:600px)': {
          fontSize: '1.05rem',
        },
      },
      subtitle1: {
        fontSize: '1.1rem',
        fontWeight: 500,
        '@media (max-width:600px)': {
          fontSize: '1rem',
        },
      },
      subtitle2: {
        fontSize: '0.95rem',
        fontWeight: 500,
        '@media (max-width:600px)': {
          fontSize: '0.9rem',
        },
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
        '@media (max-width:600px)': {
          fontSize: '0.95rem',
        },
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
        '@media (max-width:600px)': {
          fontSize: '0.85rem',
        },
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
        letterSpacing: '0.01em',
      },
    },
    shape: {
      borderRadius: 12,
    },
    spacing: 8,
    shadows: [
      'none',
      '0px 2px 4px rgba(31, 41, 55, 0.06)',
      '0px 4px 8px rgba(31, 41, 55, 0.07)',
      '0px 8px 16px rgba(31, 41, 55, 0.08)',
      '0px 12px 24px rgba(31, 41, 55, 0.09)',
      '0px 16px 32px rgba(31, 41, 55, 0.10)',
      // ...keep the rest of the shadows from MUI defaults
      ...Array(19).fill('none'),
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 12,
            padding: '8px 20px',
            fontWeight: 600,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(82, 113, 255, 0.25)',
            },
          },
          contained: {
            boxShadow: '0 4px 14px rgba(82, 113, 255, 0.2)',
          },
          outlined: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              transition: 'all 0.2s',
              '&.Mui-focused': {
                boxShadow: `0 0 0 3px ${alpha(primaryColor, 0.15)}`,
              },
            },
            '& .MuiInputLabel-root': {
              fontWeight: 500,
            },
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            WebkitFontSmoothing: 'auto',
            height: '100%',
            width: '100%',
          },
          body: {
            height: '100%',
            width: '100%',
            overflowX: 'hidden',
            background: isDark 
              ? `linear-gradient(145deg, ${darkBackground} 0%, #232838 100%)`
              : `linear-gradient(145deg, ${lightBackground} 0%, #FFFFFF 100%)`,
            backgroundAttachment: 'fixed',
          },
          '#root': {
            height: '100%',
            width: '100%',
          },
          // Add mobile viewport adjustments
          '@media (max-width:600px)': {
            html: {
              fontSize: '14px',
            },
          },
          // Add modern forced colors mode support (replacing -ms-high-contrast)
          '@media (forced-colors: active)': {
            'a:focus, button:focus, [tabindex="0"]:focus': {
              outline: '3px solid transparent !important',
              outlineOffset: '2px !important',
            },
            'button, [role="button"]': {
              // Ensure buttons have proper focus style in high contrast mode
              '&:focus-visible': {
                outline: '2px solid currentColor !important',
                outlineOffset: '2px !important',
              }
            }
          },
        },
      },
      // Make dialogs more mobile-friendly and fix accessibility issues
      MuiDialog: {
        defaultProps: {
          keepMounted: false,
          disablePortal: true,
          disableEnforceFocus: false,
          disableAutoFocus: false,
          disableRestoreFocus: false,
        },
        styleOverrides: {
          paper: {
            borderRadius: 20,
            boxShadow: '0 24px 40px rgba(31, 41, 55, 0.12)',
            overflow: 'visible',
            '@media (max-width:600px)': {
              margin: '16px',
              width: 'calc(100% - 32px)',
              maxWidth: 'calc(100% - 32px)',
            },
            '@media (forced-colors: active)': {
              border: '1px solid currentColor',
            }
          },
          root: {
            '& .MuiBackdrop-root': {
              backgroundColor: alpha('#1A1F2D', 0.6),
              backdropFilter: 'blur(4px)',
              ariaHidden: 'true',
            },
          },
        },
      },
      // Fix menu accessibility
      MuiMenu: {
        defaultProps: {
          keepMounted: true,
          disablePortal: true,
        },
        styleOverrides: {
          paper: {
            borderRadius: 16,
            boxShadow: '0 10px 30px rgba(31, 41, 55, 0.10)',
            overflow: 'visible',
            '@media (forced-colors: active)': {
              border: '1px solid currentColor',
            }
          },
          root: {
            '& .MuiBackdrop-root': {
              ariaHidden: 'true',
            },
          },
        },
      },
      // Fix drawer accessibility
      MuiDrawer: {
        defaultProps: {
          keepMounted: true,
          disablePortal: true,
        },
        styleOverrides: {
          paper: {
            boxShadow: '0 16px 40px rgba(31, 41, 55, 0.12)',
            '@media (forced-colors: active)': {
              border: '1px solid currentColor',
            }
          },
          root: {
            '& .MuiBackdrop-root': {
              backgroundColor: alpha('#1A1F2D', 0.4),
              backdropFilter: 'blur(4px)',
              ariaHidden: 'true',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 6px 16px rgba(31, 41, 55, 0.06)',
            overflow: 'visible',
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 16,
          },
          elevation1: {
            boxShadow: '0 4px 14px rgba(31, 41, 55, 0.06)',
          },
          elevation2: {
            boxShadow: '0 6px 18px rgba(31, 41, 55, 0.08)',
          }
        }
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            boxShadow: '0 4px 10px rgba(31, 41, 55, 0.07)',
          }
        }
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            transition: 'all 0.2s',
          }
        }
      },
    },
  });

  // Apply responsive font sizes
  theme = responsiveFontSizes(theme);

  return theme;
};

// Default theme (for backward compatibility)
const theme = createTheme('light');
export default theme; 