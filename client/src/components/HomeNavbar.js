import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container
} from '@mui/material';
import { Gavel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomeNavbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{
        background: 'transparent',
        backdropFilter: 'none',
        borderBottom: 'none',
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 3, md: 6 } }}>
        <Toolbar sx={{ py: 1 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mr: 3,
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            <Gavel sx={{ fontSize: 28, color: '#b8860b', mr: 2 }} />
            <Typography
              variant="h5"
              component="div"
              sx={{ 
                fontWeight: 700, 
                color: 'white',
                letterSpacing: '-0.02em',
              }}
            >
              LegalDost
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isAuthenticated ? (
              <>
                <Button
                  color="inherit"
                  onClick={() => navigate('/login')}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    color: 'white',
                    ml: 2
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{
                    background: 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)',
                    color: 'white',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(79, 195, 247, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #29b6f6 0%, #0288d1 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 16px rgba(79, 195, 247, 0.4)',
                    }
                  }}
                >
                  Get Started
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard')}
                sx={{
                  background: 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)',
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(79, 195, 247, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #29b6f6 0%, #0288d1 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 16px rgba(79, 195, 247, 0.4)',
                  }
                }}
              >
                Dashboard
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default HomeNavbar;