import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const MainContent = styled(Box)`
  flex-grow: 1;
  min-height: calc(100vh - 64px);
  width: 100%;
  overflow: hidden;
`;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    handleClose();
    navigate('/login');
  };

  // Don't show padding on chat page
  const isChat = location.pathname === '/chat';

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden'
    }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hotel Construction Assistant
          </Typography>
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
              <AccountCircle />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <MainContent sx={{ p: isChat ? 0 : 3 }}>
        <Outlet />
      </MainContent>
    </Box>
  );
};

export default Layout; 