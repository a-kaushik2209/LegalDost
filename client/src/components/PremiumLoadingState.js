import React from 'react';
import { Box, Typography, LinearProgress, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';

const PremiumLoadingState = ({ 
  title = "Processing Document",
  subtitle = "Our AI is analyzing your legal document",
  progress = null,
  steps = [],
  currentStep = 0 
}) => {
  const analysisSteps = steps.length > 0 ? steps : [
    "Extracting text content",
    "Analyzing legal structure", 
    "Identifying key clauses",
    "Checking compliance",
    "Generating insights",
    "Finalizing analysis"
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          sx={{
            maxWidth: 600,
            width: '100%',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(26, 35, 126, 0.1)',
            borderRadius: 4,
            boxShadow: '0 30px 80px rgba(26, 35, 126, 0.15)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Animated background */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(26, 35, 126, 0.02) 0%, rgba(184, 134, 11, 0.02) 100%)',
              pointerEvents: 'none',
            }}
          />
          
          <CardContent sx={{ p: 6, position: 'relative', zIndex: 1 }}>
            {/* Main loading indicator */}
            <Box textAlign="center" mb={4}>
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 10px 30px rgba(26, 35, 126, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      animation: 'shimmer 2s infinite',
                    }}
                  />
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'white',
                      fontWeight: 700,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    AI
                  </Typography>
                </Box>
              </motion.div>
              
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #1a237e 0%, #b8860b 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                }}
              >
                {title}
              </Typography>
              
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ fontWeight: 400, lineHeight: 1.6 }}
              >
                {subtitle}
              </Typography>
            </Box>

            {/* Progress bar */}
            {progress !== null && (
              <Box mb={4}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(26, 35, 126, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                    },
                  }}
                />
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  align="center" 
                  mt={1}
                  sx={{ fontWeight: 500 }}
                >
                  {Math.round(progress)}% Complete
                </Typography>
              </Box>
            )}

            {/* Analysis steps */}
            <Box>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600, 
                  color: '#1a237e',
                  mb: 3,
                }}
              >
                Analysis Progress
              </Typography>
              
              {analysisSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    mb={2}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: index <= currentStep 
                        ? 'rgba(26, 35, 126, 0.05)' 
                        : 'transparent',
                      border: '1px solid',
                      borderColor: index <= currentStep 
                        ? 'rgba(26, 35, 126, 0.2)' 
                        : 'rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: index < currentStep 
                          ? 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'
                          : index === currentStep
                          ? 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)'
                          : 'rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {index < currentStep ? '✓' : index + 1}
                    </Box>
                    
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: index <= currentStep ? 600 : 400,
                        color: index <= currentStep ? '#1a237e' : 'text.secondary',
                      }}
                    >
                      {step}
                    </Typography>
                    
                    {index === currentStep && (
                      <Box ml="auto">
                        <Box className="typing-indicator">
                          <Box className="typing-dot" />
                          <Box className="typing-dot" />
                          <Box className="typing-dot" />
                        </Box>
                      </Box>
                    )}
                  </Box>
                </motion.div>
              ))}
            </Box>

            {/* Footer */}
            <Box textAlign="center" mt={4} pt={3} sx={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontWeight: 500,
                  fontSize: '0.85rem',
                }}
              >
                Powered by Google Gemini AI • Advanced Legal Analysis
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default PremiumLoadingState;