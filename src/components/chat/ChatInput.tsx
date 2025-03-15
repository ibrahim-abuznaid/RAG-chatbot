import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  useTheme, 
  useMediaQuery, 
  Paper,
  CircularProgress,
  Zoom,
  alpha
} from '@mui/material';
import { 
  Send as SendIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  isCentered?: boolean;
}

const sendButtonAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1) translateX(2px);
  }
`;

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 ${alpha('#5271FF', 0.4)};
  }
  70% {
    box-shadow: 0 0 0 10px ${alpha('#5271FF', 0)};
  }
  100% {
    box-shadow: 0 0 0 0 ${alpha('#5271FF', 0)};
  }
`;

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  padding: theme.spacing(2, 3, 3),
  backdropFilter: 'blur(10px)',
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  position: 'relative',
  zIndex: 5,
  background: `linear-gradient(to bottom, 
    ${alpha(theme.palette.background.paper, 0.8)}, 
    ${theme.palette.background.paper}
  )`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5, 2, 2),
    gap: theme.spacing(1),
  },
}));

const InputWrapper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isCentered',
})<{ isCentered?: boolean }>(({ theme, isCentered }) => ({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  borderRadius: isCentered ? 18 : 14,
  backgroundColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.8)
    : alpha(theme.palette.common.white, 0.9),
  boxShadow: isCentered 
    ? `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}`
    : `0 4px 16px ${alpha(theme.palette.primary.main, 0.15)}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}`,
  padding: isCentered ? theme.spacing(0.5, 1.5) : theme.spacing(0.5, 1.5),
  transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
  border: `1px solid ${alpha(theme.palette.primary.main, isCentered ? 0.12 : 0.08)}`,
  backdropFilter: 'blur(20px)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: `linear-gradient(90deg, 
      ${alpha(theme.palette.primary.light, 0)}, 
      ${alpha(theme.palette.primary.light, 0.3)}, 
      ${alpha(theme.palette.primary.light, 0)})`,
    opacity: 0.5,
    zIndex: 1,
  },
  '&:hover': {
    boxShadow: isCentered
      ? `0 12px 36px ${alpha(theme.palette.primary.main, 0.3)}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.15)}`
      : `0 6px 22px ${alpha(theme.palette.primary.main, 0.25)}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.15)}`,
    transform: isCentered ? 'translateY(-3px) scale(1.01)' : 'translateY(-2px)',
    borderColor: alpha(theme.palette.primary.main, isCentered ? 0.2 : 0.15),
  },
  '&:focus-within': {
    boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.3)}, 0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
    borderColor: alpha(theme.palette.primary.main, 0.3),
    '&::before': {
      opacity: 1,
    },
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: isCentered ? 16 : 12,
    padding: theme.spacing(0.25, 1),
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  flex: 1,
  position: 'relative',
  '& .MuiOutlinedInput-root': {
    padding: theme.spacing(0.5, 0.5),
    fontSize: '1rem',
    fontWeight: 400,
    letterSpacing: '0.01em',
    transition: 'all 0.2s ease',
    backgroundColor: 'transparent',
    '& fieldset': {
      border: 'none',
    },
    '&:hover fieldset': {
      border: 'none',
    },
    '&.Mui-focused fieldset': {
      border: 'none',
    },
    '&.Mui-focused': {
      backgroundColor: 'transparent',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '12px 16px',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
    '&::placeholder': {
      opacity: 0.65,
      fontStyle: 'normal',
      fontWeight: 400,
      color: alpha(theme.palette.text.secondary, 0.8),
      transition: 'opacity 0.2s ease, transform 0.2s ease',
    },
    '&:focus::placeholder': {
      opacity: 0.4,
      transform: 'translateX(3px)',
    },
  },
  [theme.breakpoints.down('sm')]: {
    '& .MuiOutlinedInput-root': {
      fontSize: '0.95rem',
      padding: theme.spacing(0.5, 0),
    },
    '& .MuiOutlinedInput-input': {
      padding: '10px 12px',
    },
  },
}));

const InputDecorator = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isCentered',
})<{ isCentered?: boolean }>(({ theme, isCentered }) => ({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  left: theme.spacing(1),
  height: isCentered ? 30 : 28,
  width: 30,
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  fontSize: '1rem',
  opacity: 0.8,
  transition: 'all 0.3s ease',
  zIndex: 2,
  '& svg': {
    fontSize: '1.1rem',
  },
  [theme.breakpoints.down('sm')]: {
    height: 24,
    width: 24,
    left: theme.spacing(0.8),
    '& svg': {
      fontSize: '0.9rem',
    },
  },
}));

const SendButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'hasContent' && prop !== 'isCentered',
})<{ hasContent?: boolean; isCentered?: boolean }>(({ theme, hasContent, isCentered }) => ({
  backgroundColor: hasContent 
    ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
    : alpha(theme.palette.text.secondary, 0.05),
  color: hasContent ? 'white' : alpha(theme.palette.text.secondary, 0.5),
  borderRadius: '50%',
  width: isCentered ? 46 : 42,
  height: isCentered ? 46 : 42,
  marginLeft: theme.spacing(0.5),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: hasContent 
    ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` 
    : 'none',
  border: hasContent 
    ? 'none' 
    : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  '&:hover': {
    backgroundImage: hasContent 
      ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
      : 'none',
    backgroundColor: hasContent 
      ? 'transparent' 
      : alpha(theme.palette.text.secondary, 0.1),
    transform: hasContent ? 'scale(1.05) rotate(5deg)' : 'scale(1.02)',
    boxShadow: hasContent 
      ? `0 6px 15px ${alpha(theme.palette.primary.main, 0.4)}` 
      : `0 2px 8px ${alpha(theme.palette.text.secondary, 0.15)}`,
  },
  '&:active': {
    animation: hasContent ? `${sendButtonAnimation} 0.3s ease` : 'none',
    boxShadow: hasContent 
      ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}` 
      : 'none',
    transform: 'scale(0.98)',
  },
  '&.Mui-disabled': {
    backgroundColor: alpha(theme.palette.primary.main, 0.5),
    color: 'white',
  },
  '& .MuiSvgIcon-root': {
    fontSize: isCentered ? '1.5rem' : '1.4rem',
    transition: 'transform 0.2s ease',
  },
  '&:hover .MuiSvgIcon-root': {
    transform: hasContent ? 'translateX(2px)' : 'none',
  },
  [theme.breakpoints.down('sm')]: {
    width: isCentered ? 42 : 38,
    height: isCentered ? 42 : 38,
    '& .MuiSvgIcon-root': {
      fontSize: isCentered ? '1.3rem' : '1.2rem',
    },
  },
}));

const ChatInput = ({ onSendMessage, isLoading = false, isCentered = false }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textFieldRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const hasContent = message.trim().length > 0;

  // Auto-focus text field on mount
  useEffect(() => {
    if (textFieldRef.current && !isMobile) {
      const textField = textFieldRef.current.querySelector('input, textarea');
      if (textField) {
        (textField as HTMLElement).focus();
      }
    }
  }, [isMobile]);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <InputContainer>
      <InputWrapper elevation={0} isCentered={isCentered}>
        <StyledTextField
          ref={textFieldRef}
          fullWidth
          multiline
          maxRows={isCentered ? 5 : (isMobile ? 3 : 4)}
          placeholder={isCentered 
            ? "What would you like to know about hotel construction?" 
            : (isMobile ? "Type a message..." : "Type your message here...")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
          disabled={isLoading}
          sx={{ ml: isCentered ? 0 : 0 }}
        />
      </InputWrapper>
      
      <Zoom in={true} timeout={500}>
        <SendButton
          onClick={handleSend}
          disabled={!hasContent || isLoading}
          aria-label="Send message"
          hasContent={hasContent}
          isCentered={isCentered}
          color="primary"
        >
          {isLoading ? 
            <CircularProgress size={24} color="inherit" /> : 
            <SendIcon />
          }
        </SendButton>
      </Zoom>
    </InputContainer>
  );
};

export default ChatInput; 