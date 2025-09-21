import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button
} from '@mui/material';

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HomeNavbar from '../components/HomeNavbar';
import backgroundVideo from './vecteezy_cash-register-drawer-opening-with-money-business_70152599.mp4';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedData = () => {
        console.log('Video data loaded');
        setVideoLoaded(true);
      };

      const handleCanPlay = () => {
        console.log('Video can play');
        video.play().catch(error => {
          console.log('Video autoplay failed:', error);
        });
      };

      const handleError = (e) => {
        console.error('Video error:', e);
        console.error('Video error details:', video.error);
      };

      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);

      video.load();

      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
      };
    }
  }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        src={backgroundVideo}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 1,
          opacity: videoLoaded ? 1 : 0,
          transition: 'opacity 1s ease-in-out'
        }}
        onLoadedData={() => {
          console.log('Video data loaded successfully');
          setVideoLoaded(true);
        }}
        onCanPlay={() => {
          console.log('Video can play - attempting to start');
          if (videoRef.current) {
            videoRef.current.play().catch(error => {
              console.log('Video autoplay failed:', error);
            });
          }
        }}
        onPlaying={() => {
          console.log('Video is now playing');
        }}
        onError={(e) => {
          console.error('Video error occurred:', e);
          console.error('Video error details:', videoRef.current?.error);
        }}
      />

      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          zIndex: 0
        }}
      />



      <HomeNavbar />

      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        <Container maxWidth={false} sx={{
          width: '100%',
          px: { xs: 3, md: 6 },
          py: { xs: 6, md: 8 }
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box
              textAlign="center"
              sx={{
                maxWidth: '1000px',
                mx: 'auto',
                px: { xs: 2, md: 4 }
              }}
            >
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontSize: {
                    xs: '2.2rem',
                    sm: '2.8rem',
                    md: '3.5rem',
                    lg: '4rem'
                  },
                  fontWeight: 700,
                  mb: { xs: 3, md: 4 },
                  lineHeight: { xs: 1.15, md: 1.2 },
                  letterSpacing: { xs: '-0.02em', md: '-0.025em' },
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  color: 'white',
                  textAlign: 'center',
                  textShadow: '0 4px 12px rgba(0, 0, 0, 0.8)'
                }}
              >
                Understand Your Legal
                <br />
                Documents Instantly
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  mb: { xs: 6, md: 7 },
                  color: 'white',
                  fontWeight: 600,
                  maxWidth: { xs: '100%', md: '650px' },
                  mx: 'auto',
                  lineHeight: { xs: 1.6, md: 1.65 },
                  fontSize: {
                    xs: '1rem',
                    sm: '1.1rem',
                    md: '1.2rem'
                  },
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  textAlign: 'center',
                  px: { xs: 1, md: 0 },
                  textShadow: '0 3px 10px rgba(0, 0, 0, 0.8)'
                }}
              >
                Our AI-powered tool simplifies complex legal jargon, highlighting potential risks and violations in your contracts and agreements.
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => isAuthenticated ? navigate('/upload') : navigate('/register')}
                  sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    color: 'white',
                    px: { xs: 4, md: 6 },
                    py: { xs: 2, md: 2.5 },
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    fontWeight: 600,
                    borderRadius: { xs: 2, md: 3 },
                    textTransform: 'none',
                    boxShadow: '0 8px 24px rgba(25, 118, 210, 0.4)',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    letterSpacing: '0.01em',
                    minWidth: { xs: '180px', md: '200px' },
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(25, 118, 210, 0.5)',
                    }
                  }}
                >
                  Upload Document
                </Button>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>


    </Box>
  );
};

export default HomePage;