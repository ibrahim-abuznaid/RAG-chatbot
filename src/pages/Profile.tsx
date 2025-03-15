import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  useTheme as useMuiTheme,
  useMediaQuery,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Fade,
  Grid,
  Chip,
  alpha,
  Badge,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Email as EmailIcon, 
  Person as PersonIcon, 
  Public as PublicIcon, 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Cake as CakeIcon,
  Chat as ChatIcon,
  Today as TodayIcon,
  AddAPhoto as AddPhotoIcon,
  PhotoCamera as PhotoCameraIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(4, 2),
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(145deg, ${theme.palette.background.default} 0%, #1e212e 100%)`
    : `linear-gradient(145deg, ${theme.palette.background.default} 0%, #FFFFFF 100%)`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 1),
  },
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  maxWidth: 900,
  margin: '0 auto',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'visible',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 10px 40px rgba(0, 0, 0, 0.4)'
    : '0 10px 40px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease-in-out',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 15px 50px rgba(0, 0, 0, 0.5)'
      : '0 15px 50px rgba(0, 0, 0, 0.12)',
  },
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3, 4),
  paddingBottom: theme.spacing(10),
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(145deg, ${theme.palette.primary.dark} 0%, #2c3154 100%)`
    : `linear-gradient(145deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  borderRadius: `${theme.shape.borderRadius * 2}px ${theme.shape.borderRadius * 2}px 0 0`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 3),
    paddingBottom: theme.spacing(7),
  },
}));

const ProfileContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(4),
  paddingTop: theme.spacing(10),
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
  backgroundImage: theme.palette.mode === 'dark' 
    ? `radial-gradient(${alpha(theme.palette.primary.main, 0.1)} 1px, transparent 1px)`
    : 'none',
  backgroundSize: '20px 20px',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(6),
  },
}));

const AvatarContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: 40,
  bottom: 0,
  transform: 'translateY(50%)',
  zIndex: 10,
  [theme.breakpoints.down('sm')]: {
    right: 20,
  },
}));

const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: 130,
  height: 130,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
  backgroundColor: theme.palette.primary.light,
  fontSize: 50,
  fontWeight: 700,
  [theme.breakpoints.down('sm')]: {
    width: 80,
    height: 80,
    fontSize: 30,
  },
}));

const ProfilePictureBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: `2px solid ${theme.palette.background.paper}`,
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
    right: 10,
    bottom: 10,
    [theme.breakpoints.down('sm')]: {
      width: 26,
      height: 26,
      right: 5,
      bottom: 5,
    },
  },
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ProfileTitle = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  marginTop: theme.spacing(1),
  marginLeft: theme.spacing(7),
  maxWidth: 'calc(100% - 180px)', // Keep space for avatar on right
  [theme.breakpoints.down('sm')]: {
    marginTop: 0,
    marginLeft: theme.spacing(5),
    maxWidth: 'calc(100% - 100px)', // Keep space for smaller avatar on right
  },
}));

const InfoCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: theme.palette.mode === 'dark'
    ? `0 4px 15px ${alpha(theme.palette.primary.dark, 0.3)}`
    : `0 4px 15px ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.2s ease-in-out',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 8px 20px ${alpha(theme.palette.primary.dark, 0.4)}`
      : `0 8px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const InfoCardTitle = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.primary.dark, 0.2)
    : alpha(theme.palette.primary.main, 0.05),
  borderBottom: `1px solid ${theme.palette.mode === 'dark'
    ? alpha(theme.palette.primary.dark, 0.2)
    : alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: `${theme.shape.borderRadius * 1.5}px ${theme.shape.borderRadius * 1.5}px 0 0`,
}));

const ProfileStats = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
  flexWrap: 'wrap',
}));

const StatChip = styled(Chip)(({ theme }) => ({
  padding: theme.spacing(1),
  height: 'auto',
  backgroundColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.primary.dark, 0.2)
    : alpha(theme.palette.primary.light, 0.1),
  border: `1px solid ${theme.palette.mode === 'dark'
    ? alpha(theme.palette.primary.dark, 0.3)
    : alpha(theme.palette.primary.light, 0.3)}`,
  '& .MuiChip-label': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(0.5, 1),
  },
  '& .MuiSvgIcon-root': {
    color: theme.palette.mode === 'dark'
      ? theme.palette.primary.light
      : theme.palette.primary.main
  }
}));

const ActionButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(3),
  gap: theme.spacing(2),
}));

// Add these custom styles for the stats section
const StatSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(3),
  },
}));

// Add a styled switch for theme toggle
const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#5271FF' : '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
    width: 32,
    height: 32,
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#5271FF' : '#aab4be',
    borderRadius: 20 / 2,
  },
}));

// Add this for the Appearance card
const AppearanceCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: theme.palette.mode === 'dark'
    ? `0 4px 20px ${alpha('#000', 0.3)}`
    : `0 4px 20px ${alpha('#000', 0.05)}`,
}));

// Update the action buttons
const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  transition: 'all 0.3s ease',
  padding: theme.spacing(1, 3),
  fontWeight: 600,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 10px rgba(0, 0, 0, 0.3)'
    : '0 4px 10px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 6px 15px rgba(0, 0, 0, 0.4)'
      : '0 6px 15px rgba(0, 0, 0, 0.15)',
  },
}));

// Update the DividerStyle component to handle forwarded props
const DividerStyle = styled(Divider, {
  shouldForwardProp: (prop) => prop !== 'component' && prop !== 'variant'
})(({ theme }) => ({
  borderColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.divider, 0.7)
    : theme.palette.divider,
  marginBottom: theme.spacing(3),
}));

const Profile: React.FC = () => {
  const { user, isAuthenticated, updateProfilePicture, updateThemePreference } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  
  const joinDate = new Date();
  joinDate.setMonth(joinDate.getMonth() - 3); // Mock data: joined 3 months ago
  
  const messageCount = 256; // Mock data
  const lastActive = new Date(); // Mock data: today
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setNotification({
        open: true,
        message: 'Please select an image file',
        severity: 'error'
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        open: true,
        message: 'Image size must be less than 5MB',
        severity: 'error'
      });
      return;
    }
    
    try {
      setUploadLoading(true);
      
      // Make sure we have a user ID before continuing
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const result = await updateProfilePicture(file);
      console.log('Profile picture updated successfully:', result);
      
      // Force a refresh of the avatar
      const profileImg = new Image();
      profileImg.src = result.profilePictureUrl;
      
      setNotification({
        open: true,
        message: 'Profile picture updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to update profile picture:', error);
      setNotification({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to update profile picture',
        severity: 'error'
      });
    } finally {
      setUploadLoading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };
  
  const handleThemeChange = () => {
    toggleTheme();
    
    // Update user's theme preference if they're logged in
    if (user) {
      updateThemePreference(mode === 'light' ? 'dark' : 'light');
    }
    
    setNotification({
      open: true,
      message: `Theme changed to ${mode === 'light' ? 'dark' : 'light'} mode`,
      severity: 'success'
    });
  };
  
  if (!isAuthenticated || !user) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading profile...
        </Typography>
      </Box>
    );
  }

  return (
    <PageContainer>
      <Fade in={true} timeout={800}>
        <ProfileCard elevation={0}>
          <ProfileHeader>
            <IconButton 
              color="inherit" 
              onClick={() => navigate('/chat')}
              sx={{ 
                position: 'absolute', 
                top: isMobile ? 8 : 16, 
                left: isMobile ? 8 : 16,
                bgcolor: muiTheme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
                '&:hover': { 
                  bgcolor: muiTheme.palette.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.2)'
                },
                boxShadow: muiTheme.palette.mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
                zIndex: 5
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            
            <ProfileTitle>
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight={600}>
                {user.username}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                {user.region}
              </Typography>
            </ProfileTitle>
            
            <AvatarContainer>
              <ProfilePictureBadge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Tooltip title="Upload profile picture">
                    <IconButton
                      component="label"
                      size="small"
                      aria-label="upload profile picture"
                      disabled={uploadLoading}
                    >
                      {uploadLoading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <PhotoCameraIcon fontSize="small" />
                      )}
                      <VisuallyHiddenInput 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                    </IconButton>
                  </Tooltip>
                }
              >
                <LargeAvatar src={user.profilePictureUrl}>
                  {!user.profilePictureUrl && user.username.charAt(0).toUpperCase()}
                </LargeAvatar>
              </ProfilePictureBadge>
            </AvatarContainer>
          </ProfileHeader>
          
          <ProfileContent>
            <StatSection>
              <ProfileStats>
                <StatChip
                  icon={<CakeIcon />}
                  label={
                    <Box>
                      <Typography variant="caption" color="text.secondary">Joined</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {joinDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </Typography>
                    </Box>
                  }
                  variant="outlined"
                  color="primary"
                />
                
                <StatChip
                  icon={<ChatIcon />}
                  label={
                    <Box>
                      <Typography variant="caption" color="text.secondary">Messages</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {messageCount}
                      </Typography>
                    </Box>
                  }
                  variant="outlined"
                  color="primary"
                />
                
                <StatChip
                  icon={<TodayIcon />}
                  label={
                    <Box>
                      <Typography variant="caption" color="text.secondary">Last Active</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        Today
                      </Typography>
                    </Box>
                  }
                  variant="outlined"
                  color="primary"
                />
              </ProfileStats>
            </StatSection>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <InfoCard>
                  <InfoCardTitle>
                    <Typography variant="subtitle1" fontWeight={600} color="primary">
                      Personal Information
                    </Typography>
                  </InfoCardTitle>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Username" 
                        secondary={user.username}
                        primaryTypographyProps={{ 
                          color: 'text.secondary',
                          fontSize: '0.875rem'
                        }}
                        secondaryTypographyProps={{ 
                          fontWeight: 500,
                          color: 'text.primary'
                        }}
                      />
                    </ListItem>
                    
                    <Divider 
                      variant="inset" 
                      component="li" 
                      sx={{ 
                        borderColor: (theme) => theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.divider, 0.7)
                          : theme.palette.divider
                      }} 
                    />
                    
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email Address" 
                        secondary={user.email}
                        primaryTypographyProps={{ 
                          color: 'text.secondary',
                          fontSize: '0.875rem'
                        }}
                        secondaryTypographyProps={{ 
                          fontWeight: 500,
                          color: 'text.primary'
                        }}
                      />
                    </ListItem>
                    
                    <Divider 
                      variant="inset" 
                      component="li" 
                      sx={{ 
                        borderColor: (theme) => theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.divider, 0.7)
                          : theme.palette.divider
                      }} 
                    />
                    
                    <ListItem>
                      <ListItemIcon>
                        <PublicIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Region" 
                        secondary={user.region}
                        primaryTypographyProps={{ 
                          color: 'text.secondary',
                          fontSize: '0.875rem'
                        }}
                        secondaryTypographyProps={{ 
                          fontWeight: 500,
                          color: 'text.primary'
                        }}
                      />
                    </ListItem>
                  </List>
                </InfoCard>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <InfoCard>
                  <InfoCardTitle>
                    <Typography variant="subtitle1" fontWeight={600} color="primary">
                      Chat Preferences
                    </Typography>
                  </InfoCardTitle>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      This section will contain user preferences for the chat application, such as notification settings, theme preferences, and language options.
                    </Typography>
                    
                    <Button 
                      variant="outlined" 
                      color="primary"
                      size="small"
                      sx={{ mt: 2 }}
                      startIcon={<EditIcon />}
                    >
                      Edit Preferences
                    </Button>
                  </Box>
                </InfoCard>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Appearance
              </Typography>
              <DividerStyle />
              
              <AppearanceCard>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {mode === 'dark' ? 
                      <DarkModeIcon sx={{ mr: 2, color: muiTheme.palette.mode === 'dark' ? 'primary.light' : 'primary.main' }} /> : 
                      <LightModeIcon sx={{ mr: 2, color: 'warning.main' }} />
                    }
                    <Box>
                      <Typography variant="subtitle1" fontWeight={500}>
                        Theme Mode
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Choose between light and dark theme
                      </Typography>
                    </Box>
                  </Box>
                  
                  <FormControlLabel
                    control={
                      <MaterialUISwitch 
                        checked={mode === 'dark'} 
                        onChange={handleThemeChange}
                      />
                    }
                    label=""
                  />
                </Box>
              </AppearanceCard>
            </Box>
            
            <ActionButtonContainer>
              <ActionButton 
                variant="outlined" 
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/chat')}
              >
                Back
              </ActionButton>
              
              <ActionButton 
                variant="contained" 
                color="primary"
                endIcon={<ChatIcon />}
                onClick={() => navigate('/chat')}
              >
                Return to Chat
              </ActionButton>
            </ActionButtonContainer>
          </ProfileContent>
        </ProfileCard>
      </Fade>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleNotificationClose} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default Profile; 