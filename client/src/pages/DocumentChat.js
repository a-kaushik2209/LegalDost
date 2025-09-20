import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Paper,
  Avatar,
  IconButton,
  Chip
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Visibility,
  ArrowBack,
  AccountBalance,
  Flag
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import LoadingAnimation from '../components/LoadingAnimation';
import FormattedAIResponse from '../components/FormattedAIResponse';
import axios from 'axios';

const DocumentChat = () => {
  const [document, setDocument] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchDocument();
    fetchChatHistory();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchDocument = async () => {
    try {
      const response = await axios.get(`/api/documents/${id}`);
      setDocument(response.data);
    } catch (error) {
      console.error('Error fetching document:', error);
      showNotification('Failed to fetch document', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`/api/analysis/chat/${id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const userMessage = {
      question: newMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setSending(true);

    try {
      const response = await axios.post(`/api/analysis/chat/${id}`, {
        question: userMessage.question
      });

      const aiMessage = {
        question: userMessage.question,
        answer: response.data.answer,
        timestamp: new Date()
      };

      setMessages(prev => [...prev.slice(0, -1), aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('Failed to send message', 'error');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const suggestedQuestions = [
    "What are the biggest risks I should be aware of?",
    "Explain the termination clause in simple terms",
    "What are my rights and protections in this document?",
    "Are there any hidden fees or unexpected charges?",
    "What happens if I want to cancel or exit early?",
    "Does this document comply with Indian consumer laws?",
    "What should I negotiate before signing?",
    "Are there any unfair or one-sided terms?",
    "What are my obligations and responsibilities?",
    "When should I consult a lawyer about this?"
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LoadingAnimation message="Loading chat interface..." />
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      position: 'relative',
    }}>
      <Container maxWidth="xl" sx={{ pt: 4, pb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => navigate(`/document/${id}`)} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Box flexGrow={1}>
            <Typography variant="h5" component="h1">
              Chat about: {document?.title}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <Typography variant="body2" color="text.secondary">
                Powered by Google Gemini AI
              </Typography>
              <Chip 
                icon={<SmartToy />}
                label="AI Assistant" 
                size="small" 
                color="primary" 
                variant="outlined"
              />
              <Chip 
                label={`Risk: ${document?.analysis?.riskLevel || 'Unknown'}`}
                size="small"
                color={document?.analysis?.riskLevel === 'high' ? 'error' : 
                       document?.analysis?.riskLevel === 'medium' ? 'warning' : 'success'}
              />
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => navigate(`/document/${id}`)}
          >
            View Analysis
          </Button>
        </Box>

        <Box 
          display="flex" 
          gap={{ xs: 2, md: 4 }} 
          height="calc(100vh - 120px)"
          sx={{ flexDirection: { xs: 'column', lg: 'row' } }}
        >
          {/* Enhanced Chat Area */}
          <Card sx={{ 
            flex: 2, 
            display: 'flex', 
            flexDirection: 'column',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(26, 35, 126, 0.1)',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(26, 35, 126, 0.08)',
            minHeight: { xs: '70vh', lg: '80vh' },
          }}>
            {/* Enhanced Messages Area */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: { xs: 2, md: 3 },
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                position: 'relative',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0,0,0,0.05)',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                  borderRadius: '3px',
                },
              }}
            >
              {messages.length === 0 ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                  textAlign="center"
                  p={4}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <SmartToy sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                  </motion.div>
                  <Typography variant="h5" gutterBottom color="primary">
                    AI Legal Assistant Ready
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={2}>
                    I've analyzed your document and I'm ready to answer questions
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
                    <Chip icon={<SmartToy />} label="Gemini AI" size="small" color="primary" />
                    <Chip icon={<AccountBalance />} label="Legal Expert" size="small" color="secondary" />
                    <Chip icon={<Flag />} label="Indian Law" size="small" color="success" />
                  </Box>
                  <Typography variant="caption" color="text.secondary" mt={2}>
                    Ask me about clauses, risks, your rights, or anything else!
                  </Typography>
                </Box>
              ) : (
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* User Message */}
                      <Box display="flex" justifyContent="flex-end" mb={2}>
                        <Box display="flex" alignItems="flex-start" maxWidth="70%">
                          <Paper
                            sx={{
                              p: 2,
                              backgroundColor: 'primary.main',
                              color: 'white',
                              borderRadius: '18px 18px 4px 18px'
                            }}
                          >
                            <Typography variant="body1">
                              {message.question}
                            </Typography>
                          </Paper>
                          <Avatar sx={{ ml: 1, bgcolor: 'primary.main' }}>
                            <Person />
                          </Avatar>
                        </Box>
                      </Box>

                      {/* AI Response */}
                      {message.answer && (
                        <Box display="flex" justifyContent="flex-start" mb={3}>
                          <Box display="flex" alignItems="flex-start" maxWidth="70%">
                            <Avatar sx={{ mr: 1, bgcolor: 'secondary.main' }}>
                              <SmartToy />
                            </Avatar>
                            <Paper
                              sx={{
                                p: 3,
                                backgroundColor: 'white',
                                borderRadius: '18px 18px 18px 4px',
                                border: '1px solid',
                                borderColor: 'grey.200',
                                maxWidth: '100%'
                              }}
                            >
                              <FormattedAIResponse 
                                content={message.answer}
                                type="chat"
                              />
                              <Box display="flex" alignItems="center" justifyContent="space-between" mt={2} pt={2} sx={{ borderTop: '1px solid', borderColor: 'grey.100' }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </Typography>
                                <Chip 
                                  icon={<SmartToy />}
                                  label="Gemini AI" 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              </Box>
                            </Paper>
                          </Box>
                        </Box>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {sending && (
                <Box display="flex" justifyContent="flex-start" mb={3}>
                  <Box display="flex" alignItems="center" maxWidth="80%">
                    <Avatar sx={{ 
                      mr: 2, 
                      background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                      width: 44,
                      height: 44,
                    }}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <SmartToy sx={{ fontSize: 24 }} />
                      </motion.div>
                    </Avatar>
                    <Paper sx={{ 
                      p: 3, 
                      borderRadius: '20px 20px 20px 6px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(26, 35, 126, 0.1)',
                      boxShadow: '0 8px 32px rgba(26, 35, 126, 0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent 0%, rgba(26, 35, 126, 0.05) 50%, transparent 100%)',
                          animation: 'shimmer 2s infinite',
                        }}
                      />
                      <Box display="flex" alignItems="center" gap={2} position="relative">
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                            animation: 'pulse 1.5s infinite',
                          }}
                        />
                        <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>
                          AI is analyzing your question...
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              )}
              
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Box sx={{ p: 2, backgroundColor: 'white' }}>
              <Box component="form" onSubmit={handleSendMessage}>
                <TextField
                  fullWidth
                  placeholder="Ask a question about your document..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        color="primary"
                      >
                        <Send />
                      </IconButton>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
            </Box>
          </Card>

          {/* Enhanced Sidebar */}
          <Box 
            flex={1} 
            sx={{ 
              minWidth: { lg: 350 },
              maxWidth: { xs: '100%', lg: 400 },
            }}
          >
            {/* Document Info */}
            <Card sx={{ 
              mb: 3,
              minHeight: 200
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Document Information
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Risk Assessment
                    </Typography>
                    <Chip
                      label={`${document?.analysis?.riskLevel?.toUpperCase() || 'UNKNOWN'} RISK`}
                      color={document?.analysis?.riskLevel === 'high' ? 'error' : 
                             document?.analysis?.riskLevel === 'medium' ? 'warning' : 'success'}
                      size="medium"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      File Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {document?.fileName}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Document Type
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {document?.fileType?.toUpperCase() || 'UNKNOWN'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Analysis Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {new Date(document?.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Suggested Questions */}
            <Card sx={{ 
              minHeight: 600,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                p: 3
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Suggested Questions
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Click on any question to ask the AI assistant
                </Typography>
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  gap={2}
                  sx={{ 
                    flex: 1,
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(0,0,0,0.05)',
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                      borderRadius: '3px',
                    },
                  }}
                >
                  {suggestedQuestions.map((question, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Paper
                        sx={{
                          p: 3,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'grey.200',
                          '&:hover': {
                            backgroundColor: 'primary.50',
                            borderColor: 'primary.200',
                            boxShadow: '0 4px 12px rgba(26, 35, 126, 0.1)',
                          },
                        }}
                        onClick={() => setNewMessage(question)}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            lineHeight: 1.5,
                            color: 'text.primary'
                          }}
                        >
                          {question}
                        </Typography>
                      </Paper>
                    </motion.div>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </motion.div>
    </Container>
    </Box>
  );
};

export default DocumentChat;