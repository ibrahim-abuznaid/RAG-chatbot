import React, { useState } from 'react';
import { Box, Typography, TextField, IconButton, InputAdornment, Fade, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Search as SearchIcon, Add as AddIcon, Mic as MicIcon } from '@mui/icons-material';

interface EmptyChatStateProps {
  onSendMessage: (message: string) => void;
}

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100%',
  padding: theme.spacing(3),
  width: '100%',
}));

const WelcomeText = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 600,
  marginBottom: theme.spacing(5),
  color: theme.palette.text.primary,
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 600,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  maxWidth: 600,
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.8)
    : theme.palette.background.paper,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.2)'
    : '0 4px 20px rgba(0, 0, 0, 0.1)',
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 3,
    padding: theme.spacing(1, 1, 1, 2),
    '& fieldset': {
      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.divider,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const ActionBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const EmptyChatState: React.FC<EmptyChatStateProps> = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
      e.preventDefault();
      onSendMessage(inputValue.trim());
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <EmptyStateContainer>
        <WelcomeText>What can I help with?</WelcomeText>
        <SearchContainer>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <StyledTextField
              fullWidth
              placeholder="Ask anything"
              variant="outlined"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      type="submit" 
                      disabled={!inputValue.trim()}
                      sx={{ 
                        color: 'primary.main',
                        mr: 0.5,
                        visibility: inputValue.trim() ? 'visible' : 'hidden',
                      }}
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </form>
          <ActionBar>
            <IconButton 
              sx={{ 
                backgroundColor: (theme) => 
                  theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.6) : alpha(theme.palette.background.default, 0.8),
                '&:hover': {
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : alpha(theme.palette.background.default, 0.9),
                }
              }}
            >
              <AddIcon />
            </IconButton>
            <IconButton
              sx={{ 
                backgroundColor: (theme) => 
                  theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.6) : alpha(theme.palette.background.default, 0.8),
                '&:hover': {
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : alpha(theme.palette.background.default, 0.9),
                }
              }}
            >
              <MicIcon />
            </IconButton>
          </ActionBar>
        </SearchContainer>
      </EmptyStateContainer>
    </Fade>
  );
};

export default EmptyChatState; 