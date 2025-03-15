import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  alpha,
  Tooltip,
  Paper,
  InputAdornment,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ChatBubbleOutline as ChatIcon,
  AccessTime as TimeIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { ChatSession } from '../../types/chat';

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
}

const SidebarContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    minHeight: '100%',
    height: '100dvh', // Use dynamic viewport height for mobile
  },
}));

const Header = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5, 2, 1),
    gap: theme.spacing(1),
  },
}));

const HeaderTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.1rem',
  },
}));

const SearchInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 3,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    transition: 'all 0.2s ease',
    fontSize: '0.875rem',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
    '&.Mui-focused': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: theme.spacing(1, 1.5),
  },
  [theme.breakpoints.down('sm')]: {
    '& .MuiOutlinedInput-root': {
      fontSize: '0.8rem',
    },
    '& .MuiOutlinedInput-input': {
      padding: theme.spacing(0.75, 1.25),
    },
  },
}));

const NewChatButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  justifyContent: 'flex-start',
  padding: theme.spacing(1, 2),
  gap: theme.spacing(1),
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  fontWeight: 500,
  transition: 'all 0.2s ease',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    boxShadow: `0 2px 5px ${alpha(theme.palette.primary.main, 0.2)}`,
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.75, 1.5),
    fontSize: '0.85rem',
  },
}));

const SessionList = styled(List)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(1.5),
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    borderRadius: '4px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    paddingBottom: theme.spacing(8), // Add extra space at the bottom for mobile scrolling
  },
}));

const SessionItem = styled(ListItemButton)<{ active: number }>(({ theme, active }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1, 1.5),
  transition: 'all 0.2s ease',
  position: 'relative',
  overflow: 'visible',
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
  '&:hover': {
    backgroundColor: active ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.05),
  },
  '&::before': active ? {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '0 2px 2px 0',
  } : {},
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.75, 1),
    marginBottom: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
  },
}));

const SessionTitle = styled(Typography)<{ active: number }>(({ theme, active }) => ({
  fontWeight: active ? 600 : 500,
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  transition: 'all 0.2s ease',
  width: '100%',
  fontSize: '0.95rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
    maxWidth: 'calc(100% - 24px)',
  },
}));

const SessionDate = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(0.5),
  '& svg': {
    fontSize: '0.875rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.7rem',
    marginTop: theme.spacing(0.25),
    '& svg': {
      fontSize: '0.8rem',
    },
  },
}));

const LastMessage = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.8rem',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginTop: theme.spacing(0.5),
  maxWidth: '100%',
  display: 'block',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
    maxWidth: 'calc(100% - 10px)',
    marginTop: theme.spacing(0.25),
  },
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: theme.spacing(4),
  color: theme.palette.text.secondary,
  height: '100%',
  '& svg': {
    fontSize: '3rem',
    marginBottom: theme.spacing(2),
    color: alpha(theme.palette.primary.main, 0.5),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    '& svg': {
      fontSize: '2.5rem',
    },
  },
}));

const SectionDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(1.5, 0),
  color: alpha(theme.palette.text.primary, 0.7),
  fontSize: '0.75rem',
  '&::before, &::after': {
    borderColor: alpha(theme.palette.divider, 0.5),
  }
}));

const MenuButton = styled(IconButton)(({ theme }) => ({
  fontSize: '1.2rem',
  padding: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    fontSize: '1.25rem',
    minWidth: '42px',
    minHeight: '42px',
    backgroundColor: alpha(theme.palette.background.paper, 0.5),
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.15),
    }
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: theme.shape.borderRadius * 1.5,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    padding: theme.spacing(0.5),
  },
  '& .MuiMenuItem-root': {
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1, 1.5),
    gap: theme.spacing(1),
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
    '& svg': {
      fontSize: '1.2rem',
    }
  }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(1),
  },
  '& .MuiBackdrop-root': {
    backgroundColor: alpha(theme.palette.background.paper, 0.5),
  }
}));

const DialogCloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

const formatDate = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `Today at ${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
};

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onDeleteSession,
  onRenameSession,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Add a ref for the text field to manage focus correctly
  const textFieldRef = React.useRef<HTMLInputElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, session: ChatSession) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedSession(session);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleRenameClick = () => {
    handleMenuClose();
    if (selectedSession) {
      setNewTitle(selectedSession.title);
      setIsRenameDialogOpen(true);
    }
  };

  // Add Effect to handle focus management when dialog opens
  React.useEffect(() => {
    if (isRenameDialogOpen && textFieldRef.current) {
      // Small delay to ensure the dialog is fully rendered
      const timer = setTimeout(() => {
        if (textFieldRef.current) {
          textFieldRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isRenameDialogOpen]);

  const handleRenameConfirm = () => {
    if (selectedSession && newTitle.trim()) {
      onRenameSession(selectedSession.id, newTitle.trim());
      setIsRenameDialogOpen(false);
      setSelectedSession(null);
      setNewTitle('');
    }
  };

  const handleDialogClose = () => {
    setIsRenameDialogOpen(false);
    setSelectedSession(null);
    setNewTitle('');
  };

  // Handle key press in dialog for better keyboard navigation
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && newTitle.trim()) {
      handleRenameConfirm();
    } else if (event.key === 'Escape') {
      handleDialogClose();
    }
  };

  const handleDeleteClick = () => {
    if (selectedSession) {
      onDeleteSession(selectedSession.id);
    }
    handleMenuClose();
    setSelectedSession(null);
  };

  // Filter sessions based on search query
  const filteredSessions = searchQuery
    ? sessions.filter(session => 
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (session.lastMessage && session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : sessions;

  // Group sessions by date
  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = today - 86400000; // 24 hours in milliseconds
  
  const todaySessions = filteredSessions.filter(session => 
    new Date(session.updatedAt).setHours(0, 0, 0, 0) === today
  );
  
  const yesterdaySessions = filteredSessions.filter(session => 
    new Date(session.updatedAt).setHours(0, 0, 0, 0) === yesterday
  );
  
  const olderSessions = filteredSessions.filter(session => 
    new Date(session.updatedAt).setHours(0, 0, 0, 0) < yesterday
  );

  return (
    <SidebarContainer>
      <Header>
        <HeaderTitle variant={isMobile ? "subtitle1" : "h6"} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ChatIcon fontSize={isMobile ? "small" : "medium"} />
            <Box component="span" sx={{ ml: 1 }}>Chat History</Box>
          </Box>
          {isMobile && (
            <IconButton 
              size="small" 
              onClick={() => onNewChat()}
              sx={{ 
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <AddIcon />
            </IconButton>
          )}
        </HeaderTitle>
        
        <SearchInput
          placeholder="Search conversations"
          fullWidth
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize={isMobile ? "small" : "small"} />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton 
                  size="small" 
                  onClick={() => setSearchQuery('')}
                  sx={{ padding: isMobile ? 0.5 : 0.5 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
        />
        
        {!isMobile && (
          <NewChatButton
            startIcon={<AddIcon fontSize={isMobile ? "small" : "medium"} />}
            onClick={onNewChat}
            variant="contained"
            fullWidth
          >
            New Chat
          </NewChatButton>
        )}
        
        {isMobile && (
          <NewChatButton
            startIcon={<AddIcon fontSize="small" />}
            onClick={onNewChat}
            variant="contained"
            fullWidth
            sx={{ mt: 1, py: 0.75 }}
          >
            New Chat
          </NewChatButton>
        )}
      </Header>

      <SessionList>
        {filteredSessions.length === 0 && (
          <EmptyStateContainer>
            {searchQuery ? (
              <>
                <Typography variant="body1" sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  No conversations found matching "{searchQuery}"
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<CloseIcon />} 
                  onClick={() => setSearchQuery('')}
                  size={isMobile ? "small" : "medium"}
                >
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <Typography variant="body1" sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  No conversations yet
                </Typography>
                <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                  Start a new chat to begin interacting with the assistant
                </Typography>
              </>
            )}
          </EmptyStateContainer>
        )}

        {todaySessions.length > 0 && (
          <>
            <SectionDivider>Today</SectionDivider>
            {todaySessions.map((session) => (
              <SessionItem
                key={session.id}
                selected={session.id === currentSessionId}
                onClick={() => onSessionSelect(session.id)}
                active={session.id === currentSessionId ? 1 : 0}
              >
                <Box sx={{ 
                  width: '100%', 
                  pr: { xs: 7, sm: 5 },  // Increase right padding to make room for the menu button
                  position: 'relative' 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SessionTitle active={session.id === currentSessionId ? 1 : 0}>
                      {session.title}
                    </SessionTitle>
                  </Box>
                  
                  {session.lastMessage && (
                    <LastMessage>
                      {session.lastMessage.length > (isMobile ? 35 : 55)
                        ? `${session.lastMessage.substring(0, isMobile ? 35 : 55)}...`
                        : session.lastMessage}
                    </LastMessage>
                  )}
                  
                  <SessionDate>
                    <TimeIcon fontSize="small" />
                    {formatDate(session.updatedAt)}
                  </SessionDate>
                  
                  <Tooltip title="Options">
                    <MenuButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, session)}
                      sx={{ 
                        position: 'absolute', 
                        right: { xs: 2, sm: 6 },
                        top: '50%',
                        transform: 'translateY(-50%)', // Center vertically
                        zIndex: 10,
                      }}
                      aria-label={`Options for ${session.title}`}
                    >
                      <MoreVertIcon />
                    </MenuButton>
                  </Tooltip>
                </Box>
              </SessionItem>
            ))}
          </>
        )}

        {yesterdaySessions.length > 0 && (
          <>
            <SectionDivider>Yesterday</SectionDivider>
            {yesterdaySessions.map((session) => (
              <SessionItem
                key={session.id}
                selected={session.id === currentSessionId}
                onClick={() => onSessionSelect(session.id)}
                active={session.id === currentSessionId ? 1 : 0}
              >
                <Box sx={{ 
                  width: '100%', 
                  pr: { xs: 7, sm: 5 },  // Increase right padding to make room for the menu button
                  position: 'relative' 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SessionTitle active={session.id === currentSessionId ? 1 : 0}>
                      {session.title}
                    </SessionTitle>
                  </Box>
                  
                  {session.lastMessage && (
                    <LastMessage>
                      {session.lastMessage.length > (isMobile ? 35 : 55)
                        ? `${session.lastMessage.substring(0, isMobile ? 35 : 55)}...`
                        : session.lastMessage}
                    </LastMessage>
                  )}
                  
                  <SessionDate>
                    <TimeIcon fontSize="small" />
                    {formatDate(session.updatedAt)}
                  </SessionDate>
                  
                  <Tooltip title="Options">
                    <MenuButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, session)}
                      sx={{ 
                        position: 'absolute', 
                        right: { xs: 2, sm: 6 },
                        top: '50%',
                        transform: 'translateY(-50%)', // Center vertically
                        zIndex: 10,
                      }}
                      aria-label={`Options for ${session.title}`}
                    >
                      <MoreVertIcon />
                    </MenuButton>
                  </Tooltip>
                </Box>
              </SessionItem>
            ))}
          </>
        )}

        {olderSessions.length > 0 && (
          <>
            <SectionDivider>Older</SectionDivider>
            {olderSessions.map((session) => (
              <SessionItem
                key={session.id}
                selected={session.id === currentSessionId}
                onClick={() => onSessionSelect(session.id)}
                active={session.id === currentSessionId ? 1 : 0}
              >
                <Box sx={{ 
                  width: '100%', 
                  pr: { xs: 7, sm: 5 },  // Increase right padding to make room for the menu button
                  position: 'relative' 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SessionTitle active={session.id === currentSessionId ? 1 : 0}>
                      {session.title}
                    </SessionTitle>
                  </Box>
                  
                  {session.lastMessage && (
                    <LastMessage>
                      {session.lastMessage.length > (isMobile ? 35 : 55)
                        ? `${session.lastMessage.substring(0, isMobile ? 35 : 55)}...`
                        : session.lastMessage}
                    </LastMessage>
                  )}
                  
                  <SessionDate>
                    <TimeIcon fontSize="small" />
                    {formatDate(session.updatedAt)}
                  </SessionDate>
                  
                  <Tooltip title="Options">
                    <MenuButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, session)}
                      sx={{ 
                        position: 'absolute', 
                        right: { xs: 2, sm: 6 },
                        top: '50%',
                        transform: 'translateY(-50%)', // Center vertically
                        zIndex: 10,
                      }}
                      aria-label={`Options for ${session.title}`}
                    >
                      <MoreVertIcon />
                    </MenuButton>
                  </Tooltip>
                </Box>
              </SessionItem>
            ))}
          </>
        )}
      </SessionList>

      <StyledMenu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'chat-options-button',
          autoFocus: false
        }}
        disablePortal
        keepMounted
      >
        <MenuItem onClick={handleRenameClick}>
          <EditIcon fontSize="small" sx={{ color: 'primary.main' }} />
          Rename
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          Delete
        </MenuItem>
      </StyledMenu>

      <StyledDialog
        open={isRenameDialogOpen}
        onClose={handleDialogClose}
        maxWidth="xs"
        fullWidth
        aria-labelledby="rename-dialog-title"
        disableRestoreFocus={false}
        disableEnforceFocus={false}
        disableAutoFocus={false}
        keepMounted={false}
        disablePortal
        TransitionProps={{
          role: 'dialog',
          tabIndex: -1,
          onExited: () => {
            if (menuAnchor) {
              menuAnchor.focus();
            }
          }
        }}
        sx={{
          '& .MuiBackdrop-root': {
            ariaHidden: 'true',
          }
        }}
      >
        <DialogTitle id="rename-dialog-title" sx={{ pr: 6 }}>
          Rename Chat
          <DialogCloseButton 
            onClick={handleDialogClose} 
            aria-label="Close dialog"
          >
            <CloseIcon fontSize="small" />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Chat Title"
            fullWidth
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            inputRef={textFieldRef}
            InputProps={{
              endAdornment: newTitle && (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={() => setNewTitle('')}
                    edge="end"
                    aria-label="Clear text"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDialogClose} 
            color="inherit"
            variant="text"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRenameConfirm} 
            color="primary"
            variant="contained"
            disabled={!newTitle.trim()}
            endIcon={<ArrowForwardIcon />}
          >
            Rename
          </Button>
        </DialogActions>
      </StyledDialog>
    </SidebarContainer>
  );
}; 