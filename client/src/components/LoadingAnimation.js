import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, LinearProgress, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingAnimation = ({ 
  message = 'Processing...', 
  progress = null, 
  steps = [],
  currentStep = 0,
  showSteps = false 
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    if (progress !== null) {
      const timer = setInterval(() => {
        setAnimatedProgress(prev => {
          if (prev < progress) {
            return Math.min(prev + 2, progress);
          }
          return prev;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [progress]);

  useEffect(() => {
    if (showSteps && steps.length > 0) {
      const messages = [
        "Extracting text from document...",
        "Analyzing with AI...",
        "Checking legal compliance...",
        "Identifying key clauses...",
        "Generating insights...",
        "Finalizing analysis..."
      ];
      
      let messageIndex = 0;
      const messageTimer = setInterval(() => {
        if (messageIndex < messages.length - 1) {
          setCurrentMessage(messages[messageIndex]);
          messageIndex++;
        }
      }, 2000);
      
      return () => clearInterval(messageTimer);
    }
  }, [showSteps, steps]);

  return (
    <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p={2}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box position="relative" display="inline-flex" mb={3}>
              <CircularProgress
                size={80}
                thickness={3}
                sx={{
                  color: 'primary.main',
                  animationDuration: '800ms',
                }}
              />
              <Box
                top={0}
                left={0}
                bottom={0}
                right={0}
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                  style={{ 
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#1a237e',
                  }}
                >
                  AI
                </motion.div>
              </Box>
            </Box>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Typography variant="h6" color="primary" gutterBottom align="center">
              AI Legal Analysis
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center" mb={2}>
              {currentMessage}
            </Typography>
          </motion.div>

          {(progress !== null || showSteps) && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{ width: '100%' }}
            >
              <LinearProgress
                variant={progress !== null ? "determinate" : "indeterminate"}
                value={animatedProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  },
                }}
              />
              {progress !== null && (
                <Typography variant="body2" color="text.secondary" align="center" mt={1}>
                  {Math.round(animatedProgress)}% Complete
                </Typography>
              )}
            </motion.div>
          )}

          {showSteps && steps.length > 0 && (
            <Box mt={3} width="100%">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: index <= currentStep ? 1 : 0.3,
                    x: 0 
                  }}
                  transition={{ delay: index * 0.2 }}
                >
                  <Box display="flex" alignItems="center" mb={1}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: index <= currentStep ? 'primary.main' : 'grey.300',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}
                    >
                      {index < currentStep ? (
                        <Typography variant="caption" color="white">✓</Typography>
                      ) : (
                        <Typography variant="caption" color="white">{index + 1}</Typography>
                      )}
                    </Box>
                    <Typography 
                      variant="body2" 
                      color={index <= currentStep ? 'text.primary' : 'text.secondary'}
                    >
                      {step}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Typography variant="caption" color="text.secondary" mt={2} align="center" sx={{ fontWeight: 500 }}>
              Powered by Google Gemini AI • Analyzing Indian Legal Compliance
            </Typography>
          </motion.div>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LoadingAnimation;