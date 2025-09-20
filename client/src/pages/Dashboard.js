import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab
} from '@mui/material';
import {
  Add,
  Description,
  Chat,
  Delete,
  Visibility,
  Warning,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import axios from 'axios';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, document: null });

  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchDocuments();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/api/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      showNotification('Failed to fetch documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    try {
      await axios.delete(`/api/documents/${documentId}`);
      setDocuments(documents.filter(doc => doc._id !== documentId));
      showNotification('Document deleted successfully', 'success');
      setDeleteDialog({ open: false, document: null });
    } catch (error) {
      console.error('Error deleting document:', error);
      showNotification('Failed to delete document', 'error');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle sx={{ color: 'white' }} />;
      case 'processing':
        return <Warning color="warning" />;
      case 'failed':
        return <Error color="error" />;
      default:
        return <Description />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'primary';
      case 'processing':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      position: 'relative',
    }}>
      <Container maxWidth="xl" sx={{ pt: 4, pb: 8, px: { xs: 2, sm: 3, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Premium Full-Width Header Section */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1a237e 0%, #000051 100%)',
              borderRadius: { xs: 2, md: 4 },
              p: { xs: 4, md: 8 },
              mb: 6,
              position: 'relative',
              overflow: 'hidden',
              color: 'white',
              boxShadow: '0 20px 60px rgba(26, 35, 126, 0.15)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 80% 20%, rgba(184, 134, 11, 0.1) 0%, transparent 50%)',
                pointerEvents: 'none',
              }}
            />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 4, md: 0 } }}>
                <Box>
                  <Typography
                    variant="h1"
                    component="h1"
                    gutterBottom
                    sx={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #b8860b 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 800,
                      mb: 3,
                      fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Welcome back, {user?.name}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: 400,
                      maxWidth: 600,
                      lineHeight: 1.6,
                    }}
                  >
                    Transform complex legal documents into clear, actionable insights with our advanced AI-powered analysis platform
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/upload')}
                  size="large"
                  sx={{
                    background: 'linear-gradient(135deg, #b8860b 0%, #f4d03f 100%)',
                    color: '#000',
                    fontWeight: 700,
                    px: 4,
                    py: 2,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7d5a00 0%, #b8860b 100%)',
                      color: '#fff',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 24px rgba(184, 134, 11, 0.4)',
                    }
                  }}
                >
                  Upload Document
                </Button>
              </Box>
            </Box>
          </Box>

          {documents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Card
                sx={{
                  textAlign: 'center',
                  py: 10,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(26, 35, 126, 0.1)',
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at 50% 50%, rgba(26, 35, 126, 0.02) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 4,
                      boxShadow: '0 8px 32px rgba(26, 35, 126, 0.2)',
                    }}
                  >
                    <Description sx={{ fontSize: 60, color: 'white' }} />
                  </Box>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1a237e', mb: 2 }}>
                    Ready to Get Started?
                  </Typography>
                  <Typography variant="h6" color="text.secondary" mb={4} sx={{ maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}>
                    Upload your first legal document and experience the power of AI-driven legal analysis
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/upload')}
                    size="large"
                    sx={{
                      background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                      px: 4,
                      py: 2,
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #000051 0%, #1a237e 100%)',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 24px rgba(26, 35, 126, 0.4)',
                      }
                    }}
                  >
                    Upload Your First Document
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Grid container spacing={{ xs: 3, md: 4, lg: 5 }}>
              {documents.map((document, index) => (
                <Grid item xs={12} sm={6} lg={4} xl={3} key={document._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                    whileHover={{ y: -8 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(26, 35, 126, 0.1)',
                        borderRadius: 3,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          boxShadow: '0 20px 40px rgba(26, 35, 126, 0.15)',
                          border: '1px solid rgba(26, 35, 126, 0.2)',
                        }
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: 4,
                          background: document.status === 'completed'
                            ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                            : document.status === 'processing'
                              ? 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)'
                              : 'linear-gradient(135deg, #c62828 0%, #f44336 100%)',
                        }}
                      />
                      <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                        <Box display="flex" alignItems="center" mb={3}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              background: document.status === 'completed'
                                ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                                : document.status === 'processing'
                                  ? 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)'
                                  : 'linear-gradient(135deg, #c62828 0%, #f44336 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2,
                              color: 'white',
                            }}
                          >
                            {getStatusIcon(document.status)}
                          </Box>
                          <Box flexGrow={1}>
                            <Typography
                              variant="h6"
                              component="h2"
                              sx={{
                                fontWeight: 600,
                                color: '#1a237e',
                                mb: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {document.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {document.fileType.toUpperCase()} Document
                            </Typography>
                          </Box>
                        </Box>

                        <Box display="flex" gap={1} mb={3}>
                          <Chip
                            label={document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                            color={getStatusColor(document.status)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {document.fileName}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          Uploaded: {new Date(document.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>

                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/document/${document._id}`)}
                          disabled={document.status !== 'completed'}
                          sx={{
                            background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                            borderRadius: 2,
                            fontWeight: 600,
                            '&:hover': {
                              background: 'linear-gradient(135deg, #000051 0%, #1a237e 100%)',
                            }
                          }}
                        >
                          Analyze
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Chat />}
                          onClick={() => navigate(`/chat/${document._id}`)}
                          disabled={document.status !== 'completed'}
                          sx={{
                            borderColor: '#b8860b',
                            color: '#b8860b',
                            borderRadius: 2,
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: '#7d5a00',
                              color: '#7d5a00',
                              background: 'rgba(184, 134, 11, 0.05)',
                            }
                          }}
                        >
                          Chat
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteDialog({ open: true, document })}
                          sx={{
                            color: '#c62828',
                            ml: 'auto',
                            '&:hover': {
                              background: 'rgba(198, 40, 40, 0.1)',
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}

          <Fab
            color="primary"
            aria-label="add"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={() => navigate('/upload')}
          >
            <Add />
          </Fab>

          <Dialog
            open={deleteDialog.open}
            onClose={() => setDeleteDialog({ open: false, document: null })}
          >
            <DialogTitle>Delete Document</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete "{deleteDialog.document?.title}"?
                This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialog({ open: false, document: null })}>
                Cancel
              </Button>
              <Button
                onClick={() => handleDelete(deleteDialog.document?._id)}
                color="error"
                variant="contained"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Dashboard;