import { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  IconButton, 
  useTheme, 
  useMediaQuery, 
  CircularProgress, 
  Typography, 
  Avatar, 
  Menu, 
  MenuItem, 
  Tooltip,
  Paper,
  alpha
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  AccountCircle, 
  Logout, 
  Person, 
  Send as SendIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import { ChatHistorySidebar } from '../components/chat/ChatHistorySidebar';
import { Message, ChatSession } from '../types/chat';
import {
  getChatSessions,
  getMessages,
  createChatSession,
  addMessage,
  updateChatSessionTitle,
  deleteChatSession,
} from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { keyframes } from '@emotion/react';

const DRAWER_WIDTH = 300;

const ChatContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  position: 'relative',
  backgroundColor: theme.palette.background.default,
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    height: '100vh',
    flexDirection: 'column',
  },
}));

const Sidebar = styled(Box)(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  borderRight: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)',
  zIndex: 10,
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

const ChatArea = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  backgroundImage: `
    radial-gradient(${alpha(theme.palette.primary.main, 0.04)} 1px, transparent 1px),
    radial-gradient(${alpha(theme.palette.secondary.main, 0.03)} 1px, transparent 1px)
  `,
  backgroundSize: '20px 20px, 30px 30px',
  backgroundPosition: '0 0, 10px 10px',
  [theme.breakpoints.down('sm')]: {
    flexGrow: 1,
    width: '100%',
  },
}));

const MessageList = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  scrollbarWidth: 'none',  // Firefox
  msOverflowStyle: 'none',  // IE and Edge
  '&::-webkit-scrollbar': {
    display: 'none',  // Chrome, Safari, and Opera
  },
  animation: `${slideIn} 400ms ease-out`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  alignSelf: 'center',
  margin: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  padding: theme.spacing(1, 3),
  color: theme.palette.text.secondary,
}));

const Header = styled(Paper)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5, 3),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  zIndex: 5,
  minHeight: 64,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1, 2),
    minHeight: 56,
  },
}));

const ChatTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  '& span': {
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1),
    fontSize: '1.1rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
    flexGrow: 1,
    '& span': {
      fontSize: '1rem',
    },
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  cursor: 'pointer',
  backgroundColor: theme.palette.primary.main,
  transition: 'all 0.2s ease',
  width: 42,
  height: 42,
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.05)',
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: theme.shape.borderRadius * 1.5,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    padding: theme.spacing(1),
  },
  '& .MuiMenuItem-root': {
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0.5, 0),
    padding: theme.spacing(1, 2),
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    }
  },
  '& .MuiBackdrop-root': {
    ariaHidden: null
  }
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
  zIndex: 5,
  animation: `${slideIn} 400ms ease-out`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1, 2),
  },
}));

const MobileMenuButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  left: theme.spacing(1),
  top: theme.spacing(1.5),
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(1),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

const CenteredInputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  width: '100%',
  maxWidth: '750px',
  margin: '0 auto',
  padding: theme.spacing(3),
  zIndex: 5,
  animation: `${fadeIn} 400ms ease-out`,
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const DecorativeBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  zIndex: 1,
  opacity: 0.4,
  pointerEvents: 'none',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '10%',
    left: '5%',
    width: '40%',
    height: '40%',
    borderRadius: '50%',
    background: `radial-gradient(circle, rgba(0, 70, 173, 0.08) 0%, rgba(0, 70, 173, 0) 70%)`,
    animation: `${float} 15s ease-in-out infinite alternate`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '15%',
    right: '10%',
    width: '35%',
    height: '35%',
    borderRadius: '50%',
    background: `radial-gradient(circle, rgba(80, 100, 170, 0.06) 0%, rgba(80, 100, 170, 0) 70%)`,
    animation: `${float} 18s ease-in-out infinite alternate-reverse`,
  },
}));

const WelcomeText = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  position: 'relative',
  zIndex: 5,
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(3),
  },
}));

const WelcomeIcon = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '160px',
  height: '160px',
  margin: '0 auto',
  borderRadius: '50%',
  background: 'white',
  boxShadow: `0 10px 25px rgba(0, 0, 0, 0.15)`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '& img': {
    width: '80%',
    height: '80%',
    objectFit: 'contain',
    position: 'relative',
    zIndex: 2,
  },
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: `0 15px 30px rgba(0, 0, 0, 0.2)`,
  },
  [theme.breakpoints.down('sm')]: {
    width: '140px',
    height: '140px',
  },
}));

// Add a fade-in animation
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Add a slide-in animation for message transitions
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Add floating animation for background elements
const float = keyframes`
  0% {
    transform: translateY(0) translateX(0) scale(1);
  }
  50% {
    transform: translateY(-20px) translateX(10px) scale(1.05);
  }
  100% {
    transform: translateY(10px) translateX(-10px) scale(0.95);
  }
`;

// Add subtle pulse animation
const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
`;

// Add a shine animation for the welcome icon
const shine = keyframes`
  0% {
    transform: translateX(-200%) rotate(25deg);
  }
  40%, 100% {
    transform: translateX(400%) rotate(25deg);
  }
`;

const Chat = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user, logout } = useAuth();
  
  // Profile menu state
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const profileMenuOpen = Boolean(profileAnchorEl);
  
  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };
  
  const handleProfileNavigate = () => {
    handleProfileMenuClose();
    navigate('/profile');
  };
  
  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  // Find current session
  const currentSession = sessions.find(session => session.id === currentSessionId);

  // Load chat sessions on component mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const userSessions = await getChatSessions();
        setSessions(userSessions);
        if (userSessions.length > 0) {
          await handleSessionSelect(userSessions[0].id);
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error);
      }
    };
    loadSessions();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    const messageList = document.getElementById('message-list');
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  }, [messages]);

  const handleSessionSelect = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    try {
      const sessionMessages = await getMessages(sessionId);
      setMessages(sessionMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleNewChat = async () => {
    if (!user) return;
    
    try {
      const newSession = await createChatSession({
        id: Date.now().toString(),
        title: 'New Chat',
        userId: user.id,
        lastMessage: '',
      });
      setSessions([newSession, ...sessions]);
      setCurrentSessionId(newSession.id);
      setMessages([]);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId);
      setSessions(sessions.filter(session => session.id !== sessionId));
      if (currentSessionId === sessionId) {
        const remainingSessions = sessions.filter(session => session.id !== sessionId);
        if (remainingSessions.length > 0) {
          await handleSessionSelect(remainingSessions[0].id);
        } else {
          setCurrentSessionId('');
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting chat session:', error);
    }
  };

  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    console.log('Renaming session:', { sessionId, newTitle });
    try {
      await updateChatSessionTitle(sessionId, newTitle);
      console.log('Successfully updated title on backend');
      
      setSessions(prevSessions => {
        const updatedSessions = prevSessions.map(session =>
          session.id === sessionId
            ? { ...session, title: newTitle }
            : session
        );
        console.log('Updated sessions:', updatedSessions);
        return updatedSessions;
      });
    } catch (error) {
      console.error('Error renaming chat session:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentSessionId) {
      await handleNewChat();
      return; // The new chat handler will call this function again via effect
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      chatSessionId: currentSessionId,
    };

    try {
      setMessages(prev => [...prev, newMessage]);
      setIsLoading(true);

      // Save the user message and get AI response
      const response = await addMessage(newMessage);
      
      // If the response includes the AI response, add it to the messages
      if (response.aiResponse) {
        // Update sessions list to show latest message
        setSessions(prevSessions => prevSessions.map(session =>
          session.id === currentSessionId
            ? { 
                ...session, 
                lastMessage: response.aiResponse?.content || content, 
                updatedAt: new Date() 
              }
            : session
        ));
        
        // Add AI response to messages
        setMessages(prev => [...prev, response.aiResponse!]);
      } else {
        // For compatibility with the old system that doesn't return AI response
        // TODO: Remove this once the RAG system is fully implemented
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'I understand you\'re asking about hotel construction. Could you please provide more specific details about what you\'d like to know?',
          sender: 'assistant',
          timestamp: new Date(),
          chatSessionId: currentSessionId,
        };

        // Save the assistant message
        await addMessage(assistantMessage);
        setMessages(prev => [...prev, assistantMessage]);

        // Update sessions list to show latest message
        setSessions(prevSessions => prevSessions.map(session =>
          session.id === currentSessionId
            ? { ...session, lastMessage: content, updatedAt: new Date() }
            : session
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a useEffect hook to handle focus management for dialogs
  useEffect(() => {
    // Function to fix the aria-hidden issue on the root element
    const fixAriaHidden = () => {
      const rootElement = document.getElementById('root');
      if (rootElement && rootElement.getAttribute('aria-hidden') === 'true') {
        rootElement.removeAttribute('aria-hidden');
      }
    };

    // Set up observers to detect when dialogs/menus open
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'aria-hidden') {
          fixAriaHidden();
        }
      });
    });

    // Start observing
    const rootElement = document.getElementById('root');
    if (rootElement) {
      observer.observe(rootElement, { 
        attributes: true, 
        attributeFilter: ['aria-hidden'] 
      });
    }

    // Initial fix
    fixAriaHidden();

    // Clean up observer on component unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <ChatContainer>
      {/* Mobile menu button */}
      {isMobile && (
        <MobileMenuButton
          onClick={() => setDrawerOpen(true)}
          aria-label="Open chat history"
          aria-controls="chat-drawer"
          aria-expanded={drawerOpen}
        >
          <MenuIcon />
        </MobileMenuButton>
      )}

      {/* Sidebar for desktop or drawer for mobile */}
      {isMobile ? (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{
            keepMounted: true,
            disablePortal: true,
            disableAutoFocus: false,
            disableEnforceFocus: false,
            disableRestoreFocus: false,
            closeAfterTransition: true
          }}
          PaperProps={{
            sx: {
              overflowY: 'visible', // Allow content to overflow if needed
              '&:focus': {
                outline: 'none', // Remove focus outline from paper
              }
            }
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              width: '100%',
              maxWidth: DRAWER_WIDTH,
              boxSizing: 'border-box',
              boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
              transition: 'transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
              [theme.breakpoints.down('sm')]: {
                width: '100%',
                maxWidth: '280px', // Control max width on small screens
              },
            },
            '& .MuiBackdrop-root': {
              ariaHidden: 'true'
            }
          }}
          id="chat-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Chat history sidebar"
          SlideProps={{
            appear: true,
            in: drawerOpen,
          }}
        >
          <ChatHistorySidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSessionSelect={(id) => {
              handleSessionSelect(id);
              setDrawerOpen(false);
            }}
            onNewChat={() => {
              handleNewChat();
              setDrawerOpen(false);
            }}
            onDeleteSession={handleDeleteSession}
            onRenameSession={handleRenameSession}
          />
        </Drawer>
      ) : (
        <Sidebar>
          <ChatHistorySidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSessionSelect={handleSessionSelect}
            onNewChat={handleNewChat}
            onDeleteSession={handleDeleteSession}
            onRenameSession={handleRenameSession}
          />
        </Sidebar>
      )}

      {/* Chat area with header, messages, and input */}
      <ChatArea>
        <Header elevation={0}>
          {isMobile && <Box sx={{ width: 42 }} />} {/* Spacer to balance the header when mobile menu button is visible */}
          <ChatTitle variant="h6">
            {currentSession ? (
              <>{currentSession.title}</>
            ) : (
              <>
                <img 
                  src="/hilton logo.png" 
                  alt="Hilton" 
                  style={{ 
                    height: '24px', 
                    marginRight: '8px', 
                    verticalAlign: 'middle',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                  }} 
                />
                Hotel Construction Assistant
              </>
            )}
          </ChatTitle>
          <Tooltip title="Account settings">
            <ProfileAvatar 
              onClick={handleProfileClick}
              aria-label="Account settings"
              aria-haspopup="true"
              aria-expanded={profileMenuOpen ? 'true' : 'false'}
              aria-controls={profileMenuOpen ? 'profile-menu' : undefined}
              src={user?.profilePictureUrl}
              key={`header-avatar-${user?.id}-${user?.profilePictureUrl}`}
            >
              {!user?.profilePictureUrl && (user?.username ? user.username.charAt(0).toUpperCase() : <AccountCircle />)}
            </ProfileAvatar>
          </Tooltip>
          <StyledMenu
            anchorEl={profileAnchorEl}
            open={profileMenuOpen}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            id="profile-menu"
            MenuListProps={{
              'aria-labelledby': 'profile-button',
              autoFocus: false
            }}
            keepMounted
            disablePortal
          >
            <MenuItem onClick={handleProfileNavigate}>
              <Person sx={{ mr: 1, color: theme.palette.primary.main }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1, color: theme.palette.error.main }} />
              Logout
            </MenuItem>
          </StyledMenu>
        </Header>
        
        {messages.length === 0 && !isLoading ? (
          // Centered input when no messages
          <CenteredInputContainer>
            <DecorativeBackground />
            <WelcomeIcon>
              <img src="/hilton logo.png" alt="Hilton Logo" onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'https://via.placeholder.com/100x100?text=Hilton';
              }} />
            </WelcomeIcon>
            <WelcomeText>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  marginBottom: 1.5, 
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  background: 'linear-gradient(45deg, #004AAD 30%, #0067C8 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px'
                }}
              >
                Welcome to the Hotel Construction Assistant
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  maxWidth: 600, 
                  mb: 3, 
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  fontSize: '1.05rem',
                  mx: 'auto',
                  px: 2
                }}
              >
                Ask any questions about hotel construction standards, regulations, or best practices.
                The AI will provide answers based on industry guidelines and regional requirements.
              </Typography>
            </WelcomeText>
            <Box sx={{ width: '100%', position: 'relative', zIndex: 5 }}>
              <ChatInput 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading} 
                isCentered={true}
              />
            </Box>
          </CenteredInputContainer>
        ) : (
          // Normal layout when there are messages
          <>
            <MessageList id="message-list">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {isLoading && (
                <LoadingContainer>
                  <CircularProgress size={20} color="primary" />
                  <Typography variant="body2">AI is thinking...</Typography>
                </LoadingContainer>
              )}
            </MessageList>
            
            <InputContainer>
              <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </InputContainer>
          </>
        )}
      </ChatArea>
    </ChatContainer>
  );
};

export default Chat; 