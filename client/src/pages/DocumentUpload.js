import React, { useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  LinearProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import {
  CloudUpload,
  Description,
  Image,
  PictureAsPdf
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import PremiumLoadingState from '../components/PremiumLoadingState';
import axios from 'axios';

const DocumentUpload = () => {
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [, setUploadedDocument] = useState(null);

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
    if (acceptedFiles.length > 0 && !title) {
      setTitle(acceptedFiles[0].name.replace(/\.[^/.]+$/, ""));
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') return <PictureAsPdf color="error" />;
    if (file.type.startsWith('image/')) return <Image color="primary" />;
    return <Description color="action" />;
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      showNotification('Please select a file to upload', 'error');
      return;
    }

    if (!title.trim()) {
      showNotification('Please enter a document title', 'error');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('document', files[0]);
      formData.append('title', title.trim());

      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setProgress(100);

      setUploadedDocument(response.data.document);
      showNotification('Document uploaded successfully!', 'success');

      setTimeout(() => {
        handleAnalysis(response.data.documentId);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      showNotification(
        error.response?.data?.message || 'Failed to upload document',
        'error'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleAnalysis = async (documentId) => {
    setAnalyzing(true);

    try {
      await axios.post(`/api/analysis/analyze/${documentId}`);
      showNotification('AI Analysis Complete! Document analyzed with Google Gemini AI', 'success');

      setTimeout(() => {
        navigate(`/document/${documentId}`);
      }, 2000);

    } catch (error) {
      console.error('Analysis error:', error);
      showNotification('Analysis failed. You can retry from the dashboard.', 'error');

      setTimeout(() => {
        navigate('/');
      }, 3000);
    } finally {
      setAnalyzing(false);
    }
  };

  if (analyzing) {
    const analysisSteps = [
      "Extracting text from document",
      "Analyzing with Google Gemini AI",
      "Checking Indian legal compliance",
      "Identifying key clauses and risks",
      "Generating simplified explanations",
      "Finalizing comprehensive analysis"
    ];

    return (
      <PremiumLoadingState
        title="AI Legal Analysis"
        subtitle="Our advanced AI is analyzing your legal document for compliance, risks, and key insights"
        steps={analysisSteps}
        currentStep={3}
      />
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      position: 'relative',
    }}>
      <Container maxWidth="lg" sx={{ pt: 4, pb: 8, px: { xs: 2, sm: 3, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Upload Legal Document
          </Typography>

          <Typography variant="body1" color="text.secondary" align="center" mb={4}>
            Upload your legal document for AI-powered analysis and simplification
          </Typography>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <TextField
                fullWidth
                label="Document Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title for your document"
                sx={{ mb: 3 }}
              />

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Paper
                  {...getRootProps()}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <input {...getInputProps()} />
                  <CloudUpload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />

                  {isDragActive ? (
                    <Typography variant="h6" color="primary">
                      Drop the file here...
                    </Typography>
                  ) : (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Drag & drop your document here
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        or click to browse files
                      </Typography>
                      <Button variant="outlined" component="span">
                        Choose File
                      </Button>
                    </>
                  )}

                  <Typography variant="caption" display="block" mt={2} color="text.secondary">
                    Supported formats: PDF, JPG, PNG, TXT (Max 10MB)
                  </Typography>
                </Paper>
              </motion.div>

              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Box mt={3}>
                    <Typography variant="subtitle1" gutterBottom>
                      Selected File:
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Box display="flex" alignItems="center">
                        {getFileIcon(files[0])}
                        <Box ml={2} flexGrow={1}>
                          <Typography variant="body1">{files[0].name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(files[0].size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                </motion.div>
              )}

              {uploading && (
                <Box mt={3}>
                  <Typography variant="body2" gutterBottom>
                    Uploading... {progress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={progress} />
                </Box>
              )}

              <Box mt={4} display="flex" gap={2} justifyContent="center">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={files.length === 0 || !title.trim() || uploading}
                  startIcon={<CloudUpload />}
                >
                  {uploading ? 'Uploading...' : 'Upload & Analyze'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Privacy Notice:</strong> Your documents are processed securely and are only accessible to you.
              We use advanced AI to analyze legal content while maintaining strict confidentiality.
            </Typography>
          </Alert>
        </motion.div>
      </Container>
    </Box>
  );
};

export default DocumentUpload;