import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
  Divider,
  Stack,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { 
  Visibility, 
  VisibilityOff, 
  Login as LoginIcon,
  Email as EmailIcon,
  Lock as LockIcon
} from '@mui/icons-material';

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(145deg, ${theme.palette.background.default} 0%, #1e212e 100%)`
    : `linear-gradient(145deg, ${theme.palette.background.default} 0%, #FFFFFF 100%)`,
}));

const AuthCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 450,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4, 5),
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 10px 40px rgba(0, 0, 0, 0.4)'
    : '0 10px 40px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
  position: 'relative',
  transition: 'all 0.3s ease-in-out',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 15px 50px rgba(0, 0, 0, 0.5)'
      : '0 15px 50px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-5px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    maxWidth: '100%',
  },
}));

const AuthHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  textAlign: 'center',
}));

const LogoWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
}));

const Logo = styled('div')(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, #2c3154 100%)`
    : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '1.8rem',
  boxShadow: theme.palette.mode === 'dark'
    ? `0 8px 20px ${alpha(theme.palette.primary.dark, 0.6)}`
    : `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.error.dark, 0.8)
    : undefined,
  '& .MuiAlert-icon': {
    fontSize: '1.4rem',
  },
}));

const StyledForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const FormField = styled(Box)(({ theme }) => ({
  position: 'relative',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  height: 50,
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: theme.palette.mode === 'dark'
    ? `0 8px 20px ${alpha(theme.palette.primary.dark, 0.5)}`
    : `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? `0 10px 25px ${alpha(theme.palette.primary.dark, 0.7)}`
      : `0 10px 25px ${alpha(theme.palette.primary.main, 0.5)}`,
    transform: 'translateY(-3px)',
  },
  transition: 'all 0.3s ease',
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  width: '70%',
  '&::before, &::after': {
    borderColor: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.divider, 0.7)
      : theme.palette.divider,
  },
}));

const StyledLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: 'none',
  fontWeight: 500,
  transition: 'color 0.2s ease',
  '&:hover': {
    color: theme.palette.mode === 'dark'
      ? theme.palette.primary.light
      : theme.palette.primary.dark,
    textDecoration: 'underline',
  },
}));

const Footer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  textAlign: 'center',
}));

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/chat');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <PageContainer>
      <Fade in={true} timeout={800}>
        <AuthCard elevation={6}>
          <Grow in={true} timeout={1000}>
            <AuthHeader>
              <LogoWrapper>
                <Logo>
                  <LoginIcon fontSize="large" />
                </Logo>
              </LogoWrapper>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                Welcome back
              </Typography>
              <Typography variant="body1" color="text.secondary" mt={1}>
                Sign in to continue to the chat app
              </Typography>
            </AuthHeader>
          </Grow>
          
          {error && (
            <Fade in={true}>
              <StyledAlert severity="error">{error}</StyledAlert>
            </Fade>
          )}
          
          <StyledForm onSubmit={handleSubmit}>
            <FormField>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </FormField>
            
            <FormField>
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        disabled={isLoading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </FormField>
            
            <ActionButton
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isLoading}
              endIcon={!isLoading && <LoginIcon />}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </ActionButton>
          </StyledForm>
          
          <Footer>
            <Stack spacing={3} alignItems="center">
              <Divider sx={{ width: '70%' }}>
                <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                  OR
                </Typography>
              </Divider>
              
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <StyledLink 
                  to="/register" 
                  style={{ 
                    color: theme.palette.primary.main, 
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  Sign Up
                </StyledLink>
              </Typography>
            </Stack>
          </Footer>
        </AuthCard>
      </Fade>
    </PageContainer>
  );
};

export default Login; 