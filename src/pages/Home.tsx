import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const HeroSection = styled(Box)`
  text-align: center;
  padding: 48px 0;
`;

const ButtonContainer = styled(Box)`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 32px;
`;

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <HeroSection>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Hotel Construction Assistant
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Your AI-powered guide for hotel construction standards and regulations
        </Typography>
        <ButtonContainer>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </ButtonContainer>
      </HeroSection>
    </Container>
  );
};

export default Home; 