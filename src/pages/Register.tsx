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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
  IconButton,
  InputAdornment,
  Fade,
  Grow,
  Divider,
  Stack,
  Stepper,
  Step,
  StepLabel,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { 
  Visibility, 
  VisibilityOff, 
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Badge as BadgeIcon,
  Public as PublicIcon,
  ArrowForward as ArrowForwardIcon,
  HowToReg as HowToRegIcon
} from '@mui/icons-material';

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(145deg, ${theme.palette.background.default} 0%, #1e212e 100%)`
    : `linear-gradient(145deg, ${theme.palette.background.default} 0%, #FFFFFF 100%)`,
}));

const AuthCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 550,
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

const FormRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(3),
  },
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

const BackButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  height: 50,
  borderRadius: theme.shape.borderRadius * 1.5,
  backgroundColor: theme.palette.mode === 'dark' ? alpha('#fff', 0.05) : alpha('#000', 0.05),
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? alpha('#fff', 0.1) : alpha('#000', 0.1),
  },
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

const StyledStepper = styled(Stepper)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiStepLabel-root .Mui-completed': {
    color: theme.palette.success.main,
  },
  '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel': {
    color: theme.palette.text.secondary,
  },
  '& .MuiStepLabel-root .Mui-active': {
    color: theme.palette.primary.main,
  },
  '& .MuiStepIcon-text': {
    fill: theme.palette.mode === 'dark' ? '#fff' : undefined,
  },
  '& .MuiStepConnector-line': {
    borderColor: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.divider, 0.7)
      : theme.palette.divider,
  }
}));

const regions = [
  'Middle East',
  'Europe',
  'North America',
  'South America',
  'Asia',
  'Africa',
  'Australia'
];

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [region, setRegion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleRegionChange = (event: SelectChangeEvent) => {
    setRegion(event.target.value);
  };

  const validateFirstStep = (): boolean => {
    if (!email || !username) {
      setError('Email and username are required');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }

    return true;
  };

  const validateSecondStep = (): boolean => {
    if (!password || !confirmPassword || !region) {
      setError('All fields are required');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    setError(null);
    if (activeStep === 0) {
      if (validateFirstStep()) {
        setActiveStep(1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(0);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeStep === 0) {
      handleNext();
      return;
    }

    if (!validateSecondStep()) {
      return;
    }

    setIsLoading(true);

    try {
      await register(email, username, password, region);
      navigate('/chat');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const steps = ['Account', 'Security'];

  return (
    <PageContainer>
      <Fade in={true} timeout={800}>
        <AuthCard elevation={6}>
          <Grow in={true} timeout={1000}>
            <AuthHeader>
              <LogoWrapper>
                <Logo>
                  <PersonAddIcon fontSize="large" />
                </Logo>
              </LogoWrapper>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                Create account
              </Typography>
              <Typography variant="body1" color="text.secondary" mt={1}>
                Join our chat community today
              </Typography>
            </AuthHeader>
          </Grow>
          
          <StyledStepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </StyledStepper>
          
          {error && (
            <Fade in={true}>
              <StyledAlert severity="error">{error}</StyledAlert>
            </Fade>
          )}
          
          <StyledForm onSubmit={handleSubmit}>
            {activeStep === 0 ? (
              <Fade in={activeStep === 0} timeout={500}>
                <Box>
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
                  
                  <FormField sx={{ mt: 3 }}>
                    <TextField
                      label="Username"
                      fullWidth
                      variant="outlined"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </FormField>
                  
                  <ActionButton
                    type="button"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    onClick={handleNext}
                    disabled={isLoading}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Continue
                  </ActionButton>
                </Box>
              </Fade>
            ) : (
              <Fade in={activeStep === 1} timeout={500}>
                <Box>
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
                  
                  <FormField sx={{ mt: 3 }}>
                    <TextField
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      fullWidth
                      variant="outlined"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                              onClick={handleToggleConfirmPasswordVisibility}
                              edge="end"
                              disabled={isLoading}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </FormField>
                  
                  <FormField sx={{ mt: 3 }}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Region</InputLabel>
                      <Select
                        value={region}
                        label="Region"
                        onChange={handleRegionChange}
                        disabled={isLoading}
                        required
                        startAdornment={
                          <InputAdornment position="start">
                            <PublicIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        {regions.map((region) => (
                          <MenuItem key={region} value={region}>
                            {region}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </FormField>
                  
                  <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                    <BackButton
                      type="button"
                      onClick={handleBack}
                      fullWidth
                      size="large"
                      disabled={isLoading}
                    >
                      Back
                    </BackButton>
                    
                    <ActionButton
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={isLoading}
                      sx={{ flex: 2 }}
                      endIcon={!isLoading && <HowToRegIcon />}
                    >
                      {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
                    </ActionButton>
                  </Box>
                </Box>
              </Fade>
            )}
          </StyledForm>
          
          <Footer>
            <Stack spacing={3} alignItems="center">
              <StyledDivider>
                <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                  OR
                </Typography>
              </StyledDivider>
              
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <StyledLink
                  to="/login"
                >
                  Sign In
                </StyledLink>
              </Typography>
            </Stack>
          </Footer>
        </AuthCard>
      </Fade>
    </PageContainer>
  );
};

export default Register; 