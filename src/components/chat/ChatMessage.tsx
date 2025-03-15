import { 
  Box, 
  Paper, 
  Typography, 
  Collapse, 
  Button, 
  Divider, 
  Chip, 
  Tooltip, 
  IconButton, 
  useTheme, 
  useMediaQuery,
  Avatar,
  Fade,
  alpha
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useState } from 'react';
import { Message, Source } from '../../types/chat';
import { 
  Info as InfoIcon, 
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  SmartToy as BotIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import React from 'react';

interface ChatMessageProps {
  message: Message;
}

interface StyledProps {
  $isUser: boolean;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const MessageContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$isUser'
})<StyledProps>(({ theme, $isUser }) => ({
  display: 'flex',
  justifyContent: $isUser ? 'flex-end' : 'flex-start',
  marginBottom: theme.spacing(3),
  position: 'relative',
  animation: `${fadeIn} 0.3s ease forwards`,
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(2),
  },
}));

const MessageContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$isUser'
})<StyledProps>(({ theme, $isUser }) => ({
  display: 'flex',
  flexDirection: $isUser ? 'row-reverse' : 'row',
  alignItems: 'flex-start',
  maxWidth: '80%',
  [theme.breakpoints.down('sm')]: {
    maxWidth: '90%',
  },
}));

const MessageAvatar = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== '$isUser'
})<StyledProps>(({ theme, $isUser }) => ({
  width: 36,
  height: 36,
  backgroundColor: $isUser ? theme.palette.primary.dark : theme.palette.primary.light,
  color: 'white',
  margin: theme.spacing(0, $isUser ? 0 : 1.5, 0, $isUser ? 1.5 : 0),
  boxShadow: `0 3px 5px ${alpha(theme.palette.common.black, 0.1)}`,
  [theme.breakpoints.down('sm')]: {
    width: 32,
    height: 32,
    margin: theme.spacing(0, $isUser ? 0 : 1, 0, $isUser ? 1 : 0),
  },
}));

const MessageBubble = styled(Paper, {
  shouldForwardProp: (prop) => prop !== '$isUser'
})<StyledProps>(({ theme, $isUser }) => ({
  padding: theme.spacing(2, 2.5),
  borderRadius: $isUser 
    ? '18px 4px 18px 18px'
    : '4px 18px 18px 18px',
  background: $isUser 
    ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
    : alpha(theme.palette.background.paper, 0.9),
  color: $isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  boxShadow: $isUser 
    ? `0 3px 10px ${alpha(theme.palette.primary.main, 0.3)}`
    : `0 2px 8px ${alpha(theme.palette.common.black, 0.06)}`,
  backdropFilter: !$isUser ? 'blur(8px)' : 'none',
  border: !$isUser ? `1px solid ${alpha(theme.palette.divider, 0.05)}` : 'none',
  position: 'relative',
  transition: 'all 0.2s ease',
  minWidth: 120,
  '&:hover': {
    boxShadow: $isUser 
      ? `0 5px 15px ${alpha(theme.palette.primary.main, 0.4)}`
      : `0 5px 15px ${alpha(theme.palette.common.black, 0.08)}`,
    '& .message-actions': {
      opacity: 1,
    }
  },
  '& .timestamp': {
    color: $isUser ? alpha(theme.palette.primary.contrastText, 0.7) : theme.palette.text.secondary,
    fontSize: '0.7rem',
    marginTop: theme.spacing(1),
    textAlign: 'right',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5, 2),
    borderRadius: $isUser 
      ? '15px 4px 15px 15px'
      : '4px 15px 15px 15px',
    '& .MuiTypography-body1': {
      fontSize: '0.95rem',
    }
  },
}));

const ActionContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(0.5),
  right: theme.spacing(0.5),
  display: 'flex',
  alignItems: 'center',
  opacity: 0,
  transition: 'opacity 0.2s ease',
  gap: theme.spacing(0.5),
  zIndex: 1,
}));

const ActionIconButton = styled(IconButton)(({ theme }) => ({
  width: 24,
  height: 24,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(4px)',
  color: theme.palette.text.secondary,
  padding: 4,
  '&:hover': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.primary.main,
  },
  [theme.breakpoints.down('sm')]: {
    width: 20,
    height: 20,
  },
}));

const SourcesContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.6),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  fontSize: '0.85rem',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    marginTop: theme.spacing(1.5),
    fontSize: '0.8rem',
  },
}));

const SourceItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderLeft: `3px solid ${theme.palette.primary.main}`,
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  borderRadius: '0 8px 8px 0',
  boxShadow: `0 2px 5px ${alpha(theme.palette.common.black, 0.05)}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    boxShadow: `0 3px 8px ${alpha(theme.palette.common.black, 0.08)}`,
  },
  '&:last-child': {
    marginBottom: 0,
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1.5),
    padding: theme.spacing(1.25),
  },
}));

const MetadataChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0, 0.5, 0.5, 0),
  fontSize: '0.7rem',
  height: 24,
  '& .MuiChip-label': {
    fontWeight: 500,
  },
  [theme.breakpoints.down('sm')]: {
    height: 20,
    fontSize: '0.65rem',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  fontSize: '0.75rem',
  padding: theme.spacing(0.25, 1),
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: 'none',
  boxShadow: `0 2px 5px ${alpha(theme.palette.common.black, 0.08)}`,
  '&:hover': {
    boxShadow: `0 3px 8px ${alpha(theme.palette.common.black, 0.12)}`,
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.7rem',
    padding: theme.spacing(0.15, 0.75),
  },
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(1.5, 0),
  opacity: 0.6,
}));

const ChatMessage = ({ message }: ChatMessageProps) => {
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();

  // Get the avatar source for user messages with a memo to prevent unnecessary rerenders
  const userAvatarSrc = React.useMemo(() => {
    return isUser && user?.profilePictureUrl ? user.profilePictureUrl : undefined;
  }, [isUser, user?.profilePictureUrl]);

  // Check if this is an AI message with metadata
  const hasMetadata = !isUser && 
    ((message.aiResponse?.metadata?.sources && message.aiResponse.metadata.sources.length > 0) ||
     message.aiResponse?.metadata?.confidence !== undefined);
  
  // Get confidence level if available
  const confidence = message.aiResponse?.metadata?.confidence;
  const confidenceColor = confidence === undefined ? 'default' : 
    confidence > 0.8 ? 'success' : 
    confidence > 0.6 ? 'warning' : 
    'error';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get the appropriate avatar for user messages
  const getUserAvatar = () => {
    if (!isUser) return <BotIcon />;
    
    // If user has a profile picture, Avatar component will use src prop
    if (userAvatarSrc) {
      return null;
    }
    
    // Otherwise use the icon
    return <PersonIcon />;
  };

  return (
    <MessageContainer $isUser={isUser} className="message-container">
      <MessageContent $isUser={isUser}>
        <MessageAvatar 
          $isUser={isUser}
          src={userAvatarSrc}
          key={`avatar-${userAvatarSrc}`} // Force refresh when src changes
        >
          {getUserAvatar()}
        </MessageAvatar>
        <MessageBubble $isUser={isUser}>
          <Box sx={{ position: 'relative' }}>
            <Typography 
              variant="body1" 
              sx={{ 
                pr: 3.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {message.content}
            </Typography>
            <ActionContainer className="message-actions">
              <Tooltip title={copied ? "Copied!" : "Copy message"}>
                <ActionIconButton
                  onClick={handleCopy}
                  size="small"
                  aria-label="Copy message"
                >
                  {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                </ActionIconButton>
              </Tooltip>
            </ActionContainer>
          </Box>
          {hasMetadata && (
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              alignItems: 'center', 
              mt: 1.5,
              gap: 0.5,
              justifyContent: 'space-between'
            }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {confidence !== undefined && (
                  <Tooltip title={`AI confidence level: ${Math.round(confidence * 100)}%`}>
                    <MetadataChip 
                      label={`${Math.round(confidence * 100)}% confidence`} 
                      color={confidenceColor}
                      size="small"
                      variant="outlined"
                    />
                  </Tooltip>
                )}
                
                {message.aiResponse?.metadata?.response_type && !isMobile && (
                  <Tooltip title="Source type">
                    <MetadataChip 
                      label={message.aiResponse.metadata.response_type} 
                      size="small"
                      variant="outlined"
                    />
                  </Tooltip>
                )}
              </Box>
              
              {message.aiResponse?.metadata?.sources && 
              message.aiResponse.metadata.sources.length > 0 && (
                <StyledButton 
                  onClick={() => setShowSources(!showSources)} 
                  size="small" 
                  variant={showSources ? "contained" : "outlined"}
                  color="primary"
                  startIcon={<InfoIcon fontSize="small" />}
                >
                  {showSources ? 'Hide sources' : 'View sources'}
                </StyledButton>
              )}
            </Box>
          )}
          
          {hasMetadata && message.aiResponse?.metadata?.sources && (
            <Collapse in={showSources}>
              <Fade in={showSources} timeout={500}>
                <SourcesContainer>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 1.5, 
                    fontSize: isMobile ? '0.75rem' : '0.8rem',
                    fontWeight: 600,
                    color: theme.palette.primary.main 
                  }}>
                    Reference Sources
                  </Typography>
                  
                  <StyledDivider />
                  
                  {message.aiResponse.metadata.sources.map((source: Source, index: number) => (
                    <SourceItem key={index}>
                      <Typography variant="caption" sx={{ 
                        fontWeight: 'bold', 
                        fontSize: isMobile ? '0.65rem' : '0.7rem',
                        color: theme.palette.primary.main,
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span>
                          {source.page_number && `Page ${source.page_number}`} 
                          {source.section && ` • Section ${source.section}`}
                        </span>
                        <Chip 
                          label={`Source ${index + 1}`} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            fontSize: '0.65rem',
                            fontWeight: 500
                          }} 
                        />
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        mt: 0.75, 
                        fontSize: isMobile ? '0.75rem' : '0.8rem',
                        lineHeight: isMobile ? 1.4 : 1.5,
                        color: theme.palette.text.secondary
                      }}>
                        {source.content}
                      </Typography>
                    </SourceItem>
                  ))}
                </SourcesContainer>
              </Fade>
            </Collapse>
          )}
          
          <Typography className="timestamp" variant="caption">
            {formattedTime}
          </Typography>
        </MessageBubble>
      </MessageContent>
    </MessageContainer>
  );
};

export default ChatMessage; 