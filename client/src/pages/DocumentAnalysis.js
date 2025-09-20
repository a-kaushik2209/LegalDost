import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Alert,
  Button,
  Paper,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Warning,
  Chat,
  Download,
  Share,
  Gavel,
  SmartToy,
  Assessment,
  LightbulbOutlined,
  Description,
  AccountBalance,
  Assignment,
  RecommendOutlined,
  ErrorOutline,
  InfoOutlined,
  TipsAndUpdatesOutlined,
  GpsFixedOutlined,
  LabelOutlined,
  NotificationsOutlined,
  PushPinOutlined
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import LoadingAnimation from '../components/LoadingAnimation';
import FormattedAIResponse from '../components/FormattedAIResponse';
import axios from 'axios';
import jsPDF from 'jspdf';

const DocumentAnalysis = () => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedHighlight, setSelectedHighlight] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [showAskAI, setShowAskAI] = useState(false);
  const [askAIPosition, setAskAIPosition] = useState({ x: 0, y: 0 });
  const [selectedDocumentText, setSelectedDocumentText] = useState('');
  const [showDocumentAskAI, setShowDocumentAskAI] = useState(false);
  const [documentAskAIPosition, setDocumentAskAIPosition] = useState({ x: 0, y: 0 });
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchDocument();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Simple cleanup effect for timeouts
  useEffect(() => {
    return () => {
      if (window.askAITimeout) {
        clearTimeout(window.askAITimeout);
      }
    };
  }, []);

  // Add keyboard shortcut for Ask AI (Ctrl+Q or Cmd+Q)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'q') {
        event.preventDefault();
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
          const text = selection.toString().trim();
          console.log('Keyboard shortcut triggered for text:', text);
          setSelectedDocumentText(text);
          setDocumentAskAIPosition({ x: 300, y: 200 });
          setShowDocumentAskAI(true);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);



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

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getHighlightColor = (type) => {
    switch (type) {
      case 'violation': return '#ffebee';
      case 'warning': return '#fff3e0';
      case 'important': return '#e3f2fd';
      case 'clarification': return '#f3e5f5';
      default: return '#f5f5f5';
    }
  };

  const handleDownload = () => {
    try {
      // Create a new PDF document
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Helper function to add text with word wrapping
      const addText = (text, fontSize = 10, isBold = false, isTitle = false) => {
        pdf.setFontSize(fontSize);
        if (isBold) {
          pdf.setFont(undefined, 'bold');
        } else {
          pdf.setFont(undefined, 'normal');
        }

        if (isTitle) {
          // Center the title
          const textWidth = pdf.getStringUnitWidth(text) * fontSize / pdf.internal.scaleFactor;
          const textOffset = (pageWidth - textWidth) / 2;
          pdf.text(text, textOffset, yPosition);
          yPosition += fontSize + 5;
        } else {
          // Split text into lines that fit the page width
          const lines = pdf.splitTextToSize(text, maxWidth);
          
          // Check if we need a new page
          if (yPosition + (lines.length * (fontSize + 2)) > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          
          pdf.text(lines, margin, yPosition);
          yPosition += lines.length * (fontSize + 2) + 5;
        }
      };

      // Add header
      addText('LEGAL DOCUMENT ANALYSIS REPORT', 16, true, true);
      addText('Generated by LegalDost AI', 12, false, true);
      yPosition += 10;

      // Add document info
      addText(`Document: ${document.title}`, 12, true);
      addText(`File Type: ${document.fileType.toUpperCase()}`, 10);
      addText(`Analysis Date: ${new Date().toLocaleDateString()}`, 10);
      addText(`Risk Level: ${document.analysis?.riskLevel?.toUpperCase() || 'UNKNOWN'}`, 10, true);
      yPosition += 10;

      // Add AI Summary
      if (document.analysis?.summary) {
        addText('AI SUMMARY', 14, true);
        addText(document.analysis.summary, 10);
        yPosition += 5;
      }

      // Add Risk Assessment
      if (document.analysis?.riskExplanation) {
        addText('RISK ASSESSMENT', 14, true);
        addText(document.analysis.riskExplanation, 10);
        yPosition += 5;
      }

      // Add Recommendations
      if (document.analysis?.recommendations?.length > 0) {
        addText('RECOMMENDATIONS', 14, true);
        document.analysis.recommendations.forEach((rec, index) => {
          addText(`${index + 1}. ${rec}`, 10);
        });
        yPosition += 5;
      }

      // Add Legal Violations
      if (document.analysis?.violations?.length > 0) {
        addText('LEGAL VIOLATIONS DETECTED', 14, true);
        document.analysis.violations.forEach((violation, index) => {
          addText(`Violation #${index + 1}:`, 11, true);
          addText(`Clause: "${violation.clause}"`, 10);
          addText(`Issue: ${violation.explanation}`, 10);
          addText(`Violates: ${violation.governmentClause}`, 10);
          addText(`Recommendation: ${violation.recommendation || 'Consult legal professional'}`, 10);
          yPosition += 3;
        });
        yPosition += 5;
      }

      // Add Key Points
      if (document.analysis?.keyPoints?.length > 0) {
        addText('KEY POINTS', 14, true);
        document.analysis.keyPoints.forEach((point, index) => {
          addText(`${index + 1}. ${point}`, 10);
        });
        yPosition += 5;
      }

      // Add Original Document Text (truncated for PDF)
      if (document.originalText) {
        addText('ORIGINAL DOCUMENT TEXT (EXCERPT)', 14, true);
        const truncatedText = document.originalText.length > 2000 
          ? document.originalText.substring(0, 2000) + '...\n\n[Text truncated for PDF format]'
          : document.originalText;
        addText(truncatedText, 9);
      }

      // Add footer
      pdf.addPage();
      yPosition = pageHeight - 40;
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      pdf.text('Report generated by LegalDost AI', margin, yPosition);
      pdf.text('Disclaimer: This analysis is AI-generated. Please consult a qualified legal professional for official legal advice.', margin, yPosition + 10);

      // Save the PDF
      const fileName = `${document.title.replace(/[^a-z0-9]/gi, '_')}_Analysis_Report.pdf`;
      pdf.save(fileName);

      showNotification('PDF analysis report downloaded successfully!', 'success');
    } catch (error) {
      console.error('PDF Download error:', error);
      showNotification('Failed to download PDF report', 'error');
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: `Legal Analysis: ${document.title}`,
        text: `Check out this AI-powered legal document analysis:\n\nDocument: ${document.title}\nRisk Level: ${document.analysis?.riskLevel || 'Unknown'}\n\nAnalyzed by LegalDost AI`,
        url: window.location.href
      };

      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        showNotification('Shared successfully!', 'success');
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        showNotification('Link copied to clipboard!', 'success');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share error:', error);
        // Fallback: Copy link to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          showNotification('Link copied to clipboard!', 'success');
        } catch (clipboardError) {
          showNotification('Unable to share or copy link', 'error');
        }
      }
    }
  };

  const formatSummaryText = (text) => {
    if (!text) return 'Analysis not available';

    // Format the text with proper line breaks and structure
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
      .replace(/(\d+\.\s)/g, '\n$1') // Add line breaks before numbered lists
      .replace(/([.!?])\s+([A-Z])/g, '$1\n\n$2') // Add paragraph breaks
      .replace(/:\s*([A-Z])/g, ':\n$1') // Add line breaks after colons
      .trim();
  };

  const handleTextSelection = (event) => {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setShowAskAI(false);
        setSelectedText('');
        return;
      }

      const text = selection.toString().trim();

      if (text.length > 10) { // Only show for meaningful selections
        const range = selection.getRangeAt(0);
        if (!range) {
          setShowAskAI(false);
          setSelectedText('');
          return;
        }

        const rect = range.getBoundingClientRect();
        if (!rect) {
          setShowAskAI(false);
          setSelectedText('');
          return;
        }

        setSelectedText(text);
        setAskAIPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + window.scrollY
        });
        setShowAskAI(true);

        // Hide after 5 seconds
        setTimeout(() => {
          setShowAskAI(false);
        }, 5000);
      } else {
        setShowAskAI(false);
        setSelectedText('');
      }
    } catch (error) {
      console.error('Error in text selection:', error);
      setShowAskAI(false);
      setSelectedText('');
    }
  };

  const handleAskAI = async () => {
    if (!selectedText) return;

    setLoadingExplanation(true);
    setShowAskAI(false);

    try {
      const response = await axios.post('/api/analysis/explain', {
        text: selectedText,
        context: document.analysis?.summary || '',
        documentType: document.fileType
      });

      setAiExplanation({
        selectedText: selectedText,
        explanation: response.data.explanation
      });

      // Clear selection
      window.getSelection().removeAllRanges();
      setSelectedText('');

    } catch (error) {
      console.error('Error getting AI explanation:', error);
      showNotification('Failed to get AI explanation', 'error');
    } finally {
      setLoadingExplanation(false);
    }
  };

  const formatDocumentText = (text) => {
    if (!text) return 'Document text not available';

    // Format the document text with better structure and readability
    return text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
      .replace(/([.!?])\s+([A-Z][a-z])/g, '$1\n\n$2') // Add paragraph breaks after sentences
      .replace(/(\d+\.)\s+/g, '\n$1 ') // Format numbered lists
      .replace(/([a-z])\s+([A-Z][A-Z]+)/g, '$1\n\n$2') // Break before all caps sections
      .replace(/WHEREAS/g, '\n\nWHEREAS') // Legal document formatting
      .replace(/NOW THEREFORE/g, '\n\nNOW THEREFORE')
      .replace(/IN WITNESS WHEREOF/g, '\n\nIN WITNESS WHEREOF')
      .trim();
  };

  const handleDocumentTextSelection = (event) => {
    // Clear any existing timeouts
    if (window.askAITimeout) {
      clearTimeout(window.askAITimeout);
    }

    // Use a longer delay to ensure selection is complete
    setTimeout(() => {
      try {
        const selection = window.getSelection();
        console.log('Selection object:', selection); // Debug log
        
        if (!selection || selection.rangeCount === 0) {
          console.log('No selection or no ranges');
          setShowDocumentAskAI(false);
          setSelectedDocumentText('');
          return;
        }

        const text = selection.toString().trim();
        console.log('Selected text:', text, 'Length:', text.length); // Debug log

        if (text.length > 2) { // Keep low threshold for testing
          const range = selection.getRangeAt(0);
          if (!range) {
            console.log('No range available');
            setShowDocumentAskAI(false);
            setSelectedDocumentText('');
            return;
          }

          const rect = range.getBoundingClientRect();
          const containerRect = event.currentTarget?.getBoundingClientRect();

          console.log('Range rect:', rect);
          console.log('Container rect:', containerRect);

          if (!rect || !containerRect) {
            console.log('Missing rect data');
            setShowDocumentAskAI(false);
            setSelectedDocumentText('');
            return;
          }

          // Calculate position relative to the container
          const position = {
            x: Math.max(60, Math.min(rect.left - containerRect.left + rect.width / 2, containerRect.width - 60)),
            y: Math.max(20, rect.top - containerRect.top - 40) // Moved up a bit more
          };

          console.log('Calculated position:', position);

          setSelectedDocumentText(text);
          setDocumentAskAIPosition(position);
          setShowDocumentAskAI(true);

          console.log('Ask AI button state set to visible');

          // Hide after 20 seconds (longer for easier testing)
          window.askAITimeout = setTimeout(() => {
            console.log('Hiding Ask AI button after timeout');
            setShowDocumentAskAI(false);
          }, 20000);
        } else {
          console.log('Text too short, hiding button');
          setShowDocumentAskAI(false);
          setSelectedDocumentText('');
        }
      } catch (error) {
        console.error('Error in text selection:', error);
        setShowDocumentAskAI(false);
        setSelectedDocumentText('');
      }
    }, 200); // Increased delay even more for better reliability
  };



  const handleDocumentAskAI = async () => {
    if (!selectedDocumentText) return;

    setLoadingExplanation(true);
    setShowDocumentAskAI(false);

    try {
      const response = await axios.post('/api/analysis/explain', {
        text: selectedDocumentText,
        context: `This text is from the original legal document: ${document.title}. Document type: ${document.fileType}`,
        documentType: document.fileType
      });

      setAiExplanation({
        selectedText: selectedDocumentText,
        explanation: response.data.explanation
      });

      // Clear selection
      window.getSelection().removeAllRanges();
      setSelectedDocumentText('');

    } catch (error) {
      console.error('Error getting AI explanation:', error);
      showNotification('Failed to get AI explanation', 'error');
    } finally {
      setLoadingExplanation(false);
    }
  };

  const getEnhancedHighlightColor = (type) => {
    switch (type) {
      case 'violation':
        return {
          backgroundColor: '#ffebee',
          borderColor: '#f44336',
          borderWidth: '2px',
          color: '#c62828'
        };
      case 'warning':
        return {
          backgroundColor: '#fff3e0',
          borderColor: '#ff9800',
          borderWidth: '2px',
          color: '#e65100'
        };
      case 'important':
        return {
          backgroundColor: '#e3f2fd',
          borderColor: '#2196f3',
          borderWidth: '2px',
          color: '#1565c0'
        };
      case 'clarification':
        return {
          backgroundColor: '#f3e5f5',
          borderColor: '#9c27b0',
          borderWidth: '2px',
          color: '#7b1fa2'
        };
      default:
        return {
          backgroundColor: '#f5f5f5',
          borderColor: '#9e9e9e',
          borderWidth: '1px',
          color: '#424242'
        };
    }
  };

  const renderHighlightedText = (text, highlights) => {
    if (!highlights || highlights.length === 0) {
      return (
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.8,
            fontSize: { xs: '1rem', md: '1.1rem' },
            color: 'text.primary'
          }}
        >
          {text}
        </Typography>
      );
    }

    let lastIndex = 0;
    const elements = [];

    highlights.forEach((highlight, index) => {
      // Add text before highlight
      if (highlight.position && highlight.position.start > lastIndex) {
        elements.push(
          <span key={`text-${index}`} style={{ fontSize: 'inherit' }}>
            {text.substring(lastIndex, highlight.position.start)}
          </span>
        );
      }

      // Add highlighted text
      const highlightText = highlight.position
        ? text.substring(highlight.position.start, highlight.position.end)
        : highlight.text;

      const highlightStyle = getEnhancedHighlightColor(highlight.type);
      const isSelected = selectedHighlight && selectedHighlight === highlight;

      elements.push(
        <Tooltip
          key={`highlight-${index}`}
          title={`Click to see explanation: ${highlight.explanation?.substring(0, 100)}...`}
          arrow
          placement="top"
          PopperProps={{
            sx: {
              '& .MuiTooltip-tooltip': {
                fontSize: '0.85rem',
                maxWidth: 300
              }
            }
          }}
        >
          <span
            style={{
              backgroundColor: isSelected ? '#1976d2' : highlightStyle.backgroundColor,
              color: isSelected ? 'white' : highlightStyle.color,
              padding: '4px 8px',
              borderRadius: '6px',
              cursor: 'pointer',
              border: `${highlightStyle.borderWidth} solid ${isSelected ? '#1976d2' : highlightStyle.borderColor}`,
              fontWeight: isSelected ? 'bold' : '500',
              transition: 'all 0.2s ease',
              boxShadow: isSelected ? '0 2px 8px rgba(25, 118, 210, 0.3)' : 'none',
              transform: isSelected ? 'scale(1.02)' : 'none',
              display: 'inline-block',
              margin: '1px 2px'
            }}
            onClick={() => {
              setSelectedHighlight(highlight);
              // Scroll to explanation if it exists
              setTimeout(() => {
                if (typeof document !== 'undefined' && document.querySelector) {
                  const explanationElement = document.querySelector('[data-explanation-panel]');
                  if (explanationElement) {
                    explanationElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }
                }
              }, 100);
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.target.style.transform = 'none';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {highlightText}
          </span>
        </Tooltip>
      );

      lastIndex = highlight.position ? highlight.position.end : lastIndex;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end" style={{ fontSize: 'inherit' }}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    return (
      <Typography
        variant="body1"
        sx={{
          lineHeight: 1.8,
          fontSize: { xs: '1rem', md: '1.1rem' },
          color: 'text.primary'
        }}
      >
        {elements}
      </Typography>
    );
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        width: '100vw',
        pt: 4,
        pb: 8,
        px: { xs: 2, sm: 3, md: 4, lg: 6 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <LoadingAnimation message="Loading document analysis..." />
      </Box>
    );
  }

  if (!document) {
    return (
      <Box sx={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        width: '100vw',
        pt: 4,
        pb: 8,
        px: { xs: 2, sm: 3, md: 4, lg: 6 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Alert severity="error">Document not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      position: 'relative',
      width: '100vw',
      pt: 4,
      pb: 8,
      px: { xs: 2, sm: 3, md: 4, lg: 6 }
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Enhanced Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={6} sx={{ flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 0 } }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {document.title}
            </Typography>
            <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
              <Chip
                label={`Risk Level: ${document.analysis?.riskLevel || 'Unknown'}`}
                color={getRiskColor(document.analysis?.riskLevel)}
                icon={<Warning />}
              />
              <Chip
                label={document.fileType.toUpperCase()}
                variant="outlined"
              />
              <Chip
                icon={<SmartToy />}
                label="AI Analyzed"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<AccountBalance />}
                label="Legal Compliance Checked"
                color="secondary"
                variant="outlined"
              />
              {document.analysis?.violations && document.analysis.violations.length > 0 && (
                <Chip
                  label={`${document.analysis.violations.length} Violations Found`}
                  color="error"
                  icon={<Gavel />}
                />
              )}
            </Box>
          </Box>

          <Box display="flex" gap={2} sx={{ flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-end' } }}>
            <Button
              variant="contained"
              startIcon={<Chat />}
              onClick={() => navigate(`/chat/${id}`)}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Chat with AI
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownload}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 'medium',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Download PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<Share />}
              onClick={handleShare}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 'medium',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Share
            </Button>
          </Box>
        </Box>

        <Box display="flex" gap={{ xs: 3, md: 4, lg: 6 }} sx={{ flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Main Content */}
          <Box flex={2} sx={{ minWidth: 0, maxWidth: { lg: '70%' } }}>
            {/* Enhanced AI Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card
                sx={{
                  mb: 4,
                  backgroundColor: 'white',
                  borderRadius: 3,
                  border: '3px solid #2196f3',
                  boxShadow: '0 4px 20px rgba(33, 150, 243, 0.1)',
                  overflow: 'hidden'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 3,
                        fontSize: '1.5rem'
                      }}
                    >
                      <SmartToy sx={{ fontSize: '2rem', color: '#2196f3' }} />
                    </Box>
                    <Box flexGrow={1}>
                      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#1976d2' }}>
                        AI-Powered Analysis Summary
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Comprehensive document analysis by Google Gemini AI
                      </Typography>
                    </Box>
                    <Chip
                      label="Gemini AI"
                      size="medium"
                      sx={{
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        color: '#1976d2',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        border: '1px solid rgba(33, 150, 243, 0.3)'
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      backgroundColor: 'rgba(33, 150, 243, 0.02)',
                      borderRadius: 2,
                      p: 3,
                      position: 'relative',
                      border: '1px solid rgba(33, 150, 243, 0.1)'
                    }}
                    onMouseUp={handleTextSelection}
                    onTouchEnd={handleTextSelection}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '1rem', md: '1.1rem' },
                        lineHeight: 1.8,
                        color: 'text.primary',
                        whiteSpace: 'pre-line',
                        userSelect: 'text',
                        '& p': { mb: 2 },
                        '& ul': { pl: 3, mb: 2 },
                        '& li': { mb: 1 },
                        '& strong': { fontWeight: 700 },
                        '& em': { fontStyle: 'italic' }
                      }}
                    >
                      {formatSummaryText(document.analysis?.summary || 'Analysis not available')}
                    </Typography>

                    {/* Ask AI Tooltip */}
                    {showAskAI && selectedText && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: askAIPosition.y - 50,
                          left: askAIPosition.x,
                          zIndex: 1000,
                          transform: 'translateX(-50%)',
                        }}
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleAskAI}
                            sx={{
                              backgroundColor: '#2196f3',
                              color: 'white',
                              fontWeight: 600,
                              px: 2,
                              py: 1,
                              borderRadius: 2,
                              fontSize: '0.8rem',
                              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                              '&:hover': {
                                backgroundColor: '#1976d2',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                              }
                            }}
                          >
                            Ask AI
                          </Button>
                        </motion.div>
                      </Box>
                    )}
                  </Box>

                  {document.analysis?.riskExplanation && (
                    <Box mt={3} p={3} sx={{ 
                      backgroundColor: 'rgba(255, 152, 0, 0.02)', 
                      borderRadius: 2, 
                      border: '2px solid rgba(255, 152, 0, 0.3)',
                      boxShadow: '0 2px 8px rgba(255, 152, 0, 0.1)'
                    }}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight="bold" sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          color: '#f57c00'
                        }}>
                          <Assessment sx={{ fontSize: '1.2rem' }} />
                          Risk Assessment
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'text.primary' }}>
                        {document.analysis.riskExplanation}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced AI Recommendations */}
            {document.analysis?.recommendations && document.analysis.recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card sx={{
                  mb: 4,
                  backgroundColor: 'white',
                  border: '3px solid #4caf50',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(76, 175, 80, 0.1)'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box display="flex" alignItems="center" mb={4}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          backgroundColor: 'success.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 3,
                          fontSize: '1.8rem',
                          boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)'
                        }}
                      >
                        <LightbulbOutlined sx={{ fontSize: '1.8rem', color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" color="success.dark" fontWeight="bold" gutterBottom>
                          AI Recommendations
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Actionable advice based on comprehensive document analysis
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      {document.analysis.recommendations.map((recommendation, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                        >
                          <Box
                            sx={{
                              mb: 3,
                              backgroundColor: 'white',
                              borderRadius: 3,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              border: '1px solid',
                              borderColor: 'success.light',
                              p: 3,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                                transform: 'translateY(-2px)'
                              }
                            }}
                          >
                            <Box display="flex" alignItems="flex-start" gap={2}>
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: '50%',
                                  backgroundColor: 'success.main',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontSize: '1.1rem',
                                  fontWeight: 'bold',
                                  flexShrink: 0,
                                  mt: 0.5
                                }}
                              >
                                {index + 1}
                              </Box>
                              <Box flexGrow={1}>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontWeight: 'medium',
                                    color: 'text.primary',
                                    lineHeight: 1.7,
                                    fontSize: '1rem'
                                  }}
                                >
                                  {recommendation}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </motion.div>
                      ))}
                    </Box>

                    <Alert
                      severity="info"
                      sx={{
                        borderRadius: 2,
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        border: '1px solid rgba(33, 150, 243, 0.2)'
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        <SmartToy sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                        <strong>AI-Powered Advice:</strong> These recommendations are generated by advanced AI analysis.
                        Consider consulting a legal professional for complex matters.
                      </Typography>
                    </Alert>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Enhanced Violations */}
            {document.analysis?.violations && document.analysis.violations.length > 0 && (
              <Card sx={{ 
                mb: 3, 
                backgroundColor: 'white',
                border: '3px solid #f44336', 
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(244, 67, 54, 0.1)'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={3}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        backgroundColor: 'error.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}
                    >
                      <Gavel sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" color="error" fontWeight="bold">
                        Legal Violations Detected
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {document.analysis.violations.length} violation(s) found under Indian law
                      </Typography>
                    </Box>
                  </Box>

                  {document.analysis.violations.map((violation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Alert
                        severity="error"
                        sx={{
                          mb: 2,
                          '& .MuiAlert-message': { width: '100%' }
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                          <Typography variant="subtitle1" fontWeight="bold" color="error.dark">
                            Violation #{index + 1}
                          </Typography>
                          <Chip
                            label={violation.severity?.toUpperCase() || 'MAJOR'}
                            color="error"
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Box>

                        <Box mb={2}>
                          <Typography variant="body2" fontWeight="medium" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Assignment sx={{ fontSize: '1rem' }} />
                            Problematic Clause:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontStyle: 'italic',
                              backgroundColor: 'error.light',
                              p: 1,
                              borderRadius: 1,
                              color: 'error.dark'
                            }}
                          >
                            "{violation.clause}"
                          </Typography>
                        </Box>

                        <Box mb={2}>
                          <Typography variant="body2" fontWeight="medium" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccountBalance sx={{ fontSize: '1rem' }} />
                            Legal Issue:
                          </Typography>
                          <Typography variant="body2">
                            {violation.explanation}
                          </Typography>
                        </Box>

                        <Box mb={2}>
                          <Typography variant="body2" fontWeight="medium" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Description sx={{ fontSize: '1rem' }} />
                            Violates Indian Law:
                          </Typography>
                          <Chip
                            label={violation.governmentClause}
                            variant="outlined"
                            color="error"
                            size="small"
                            sx={{ fontWeight: 'medium' }}
                          />
                        </Box>

                        {violation.recommendation && (
                          <Box>
                            <Typography variant="body2" fontWeight="medium" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <RecommendOutlined sx={{ fontSize: '1rem' }} />
                              Recommendation:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {violation.recommendation}
                            </Typography>
                          </Box>
                        )}
                      </Alert>
                    </motion.div>
                  ))}

                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <ErrorOutline sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                      <strong>Legal Disclaimer:</strong> These are AI-detected potential violations.
                      Please consult with a qualified legal professional for official legal advice.
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            )}



          </Box>



          {/* Enhanced Sidebar */}
          <Box
            flex={1}
            sx={{
              minWidth: { lg: 350 },
              maxWidth: { xs: '100%', lg: 400 },
              position: { lg: 'sticky' },
              top: { lg: 24 },
              height: { lg: 'fit-content' },
            }}
          >
            {/* Enhanced Key Points */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card sx={{
                mb: 4,
                backgroundColor: 'white',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(156, 39, 176, 0.1)',
                border: '3px solid #9c27b0'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        fontSize: '1.4rem',
                        boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                      }}
                    >
                      <GpsFixedOutlined sx={{ fontSize: '1.4rem', color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
                        Key Points Summary
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {document.analysis?.keyPoints?.length || 0} important points identified
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    {document.analysis?.keyPoints?.map((point, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      >
                        <Box
                          sx={{
                            mb: 2,
                            backgroundColor: 'white',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            p: 2.5,
                            border: '1px solid rgba(33, 150, 243, 0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                              transform: 'translateY(-1px)'
                            }
                          }}
                        >
                          <Box display="flex" alignItems="flex-start" gap={2}>
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                backgroundColor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                flexShrink: 0,
                                mt: 0.2
                              }}
                            >
                              {index + 1}
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 'medium',
                                color: 'text.primary',
                                lineHeight: 1.6,
                                fontSize: '0.95rem'
                              }}
                            >
                              {point}
                            </Typography>
                          </Box>
                        </Box>
                      </motion.div>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Highlight Details */}
            {selectedHighlight && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{
                  mb: 4,
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  border: '2px solid',
                  borderColor: selectedHighlight.type === 'violation' ? 'error.main' :
                    selectedHighlight.type === 'warning' ? 'warning.main' : 'info.main'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" mb={3}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: selectedHighlight.type === 'violation' ? 'error.main' :
                            selectedHighlight.type === 'warning' ? 'warning.main' : 'info.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          color: 'white',
                          fontSize: '1.2rem'
                        }}
                      >
                        {selectedHighlight.type === 'violation' ? <ErrorOutline sx={{ fontSize: '1.5rem', color: 'white' }} /> :
                          selectedHighlight.type === 'warning' ? <NotificationsOutlined sx={{ fontSize: '1.5rem', color: 'white' }} /> : <LightbulbOutlined sx={{ fontSize: '1.5rem', color: 'white' }} />}
                      </Box>
                      <Typography variant="h6" fontWeight="bold">
                        Clause Explanation
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        p: 3,
                        backgroundColor: getHighlightColor(selectedHighlight.type),
                        borderRadius: 2,
                        mb: 3,
                        border: '1px solid',
                        borderColor: selectedHighlight.type === 'violation' ? 'error.light' :
                          selectedHighlight.type === 'warning' ? 'warning.light' : 'info.light'
                      }}
                    >
                      <Typography variant="body2" fontWeight="medium" sx={{ fontStyle: 'italic' }}>
                        "{selectedHighlight.text}"
                      </Typography>
                    </Box>

                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                      {selectedHighlight.explanation}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Enhanced Legend */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: 'secondary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        fontSize: '1.1rem'
                      }}
                    >
                      <LabelOutlined sx={{ fontSize: '1.4rem', color: 'white' }} />
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      Highlight Legend
                    </Typography>
                  </Box>

                  <Box display="flex" flexDirection="column" gap={2}>
                    {[
                      { type: 'violation', label: 'Legal Violations', icon: <ErrorOutline />, color: '#f44336' },
                      { type: 'warning', label: 'Warnings', icon: <NotificationsOutlined />, color: '#ff9800' },
                      { type: 'important', label: 'Important Terms', icon: <PushPinOutlined />, color: '#2196f3' },
                      { type: 'clarification', label: 'Clarifications', icon: <LightbulbOutlined />, color: '#9c27b0' }
                    ].map((item, index) => (
                      <motion.div
                        key={item.type}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.4 }}
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={2}
                          sx={{
                            p: 2,
                            backgroundColor: 'white',
                            borderRadius: 2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            border: '1px solid',
                            borderColor: 'grey.200',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                              transform: 'translateX(4px)'
                            }
                          }}
                        >
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              backgroundColor: getHighlightColor(item.type),
                              border: item.type === 'violation' ? `2px solid ${item.color}` : 'none',
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem'
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Typography variant="body2" fontWeight="medium">
                            {item.label}
                          </Typography>
                        </Box>
                      </motion.div>
                    ))}
                  </Box>

                  <Box mt={3} p={2} sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                      <InfoOutlined sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                      Click on any highlighted text in the document to see detailed explanations
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Box>
        </Box>

        {/* Dynamic Interactive Document Analysis Section */}
        <Box sx={{
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          mt: 6,
          py: 4,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderTop: '1px solid rgba(0,0,0,0.06)'
        }}>
          <Box sx={{
            maxWidth: '1400px',
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4, lg: 6 }
          }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Box display="flex" gap={3} sx={{ flexDirection: { xs: 'column', lg: (aiExplanation || loadingExplanation) ? 'row' : 'column' } }}>
                {/* Interactive Document Analysis */}
                <Box flex={(aiExplanation || loadingExplanation) ? 1 : 'none'} sx={{ width: (aiExplanation || loadingExplanation) ? 'auto' : '100%' }}>
                  <Card sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(255, 152, 0, 0.1)',
                    overflow: 'hidden',
                    backgroundColor: 'white',
                    border: '3px solid #ff9800'
                  }}>
                    <CardContent sx={{ p: 0 }}>
                      {/* Header */}
                      <Box sx={{
                        backgroundColor: 'white',
                        borderBottom: '3px solid #ff9800',
                        p: 4
                      }}>
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              width: 64,
                              height: 64,
                              borderRadius: '50%',
                              backgroundColor: 'rgba(255, 152, 0, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 3,
                              border: '2px solid rgba(255, 152, 0, 0.3)'
                            }}
                          >
                            <Description sx={{ fontSize: '2rem', color: '#ff9800' }} />
                          </Box>
                          <Box flexGrow={1}>
                            <Typography
                              variant="h4"
                              fontWeight="bold"
                              gutterBottom
                              sx={{ 
                                fontSize: { xs: '1.8rem', md: '2.2rem' },
                                color: '#f57c00'
                              }}
                            >
                              Interactive Document Analysis
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontSize: { xs: '1rem', md: '1.2rem' },
                                fontWeight: 400,
                                color: 'text.secondary'
                              }}
                            >
                              Select any text and press Ctrl+Q (Cmd+Q on Mac) for detailed legal explanations
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Document Content */}
                      <Box sx={{ p: 4 }}>
                        <Paper
                          data-document-area
                          sx={{
                            p: 4,
                            backgroundColor: '#fafafa',
                            minHeight: 500,
                            maxHeight: 700,
                            overflow: 'auto',
                            borderRadius: 3,
                            border: '2px solid',
                            borderColor: 'grey.200',
                            position: 'relative',
                            '&::-webkit-scrollbar': {
                              width: '12px',
                            },
                            '&::-webkit-scrollbar-track': {
                              backgroundColor: '#f1f1f1',
                              borderRadius: '6px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              backgroundColor: '#c1c1c1',
                              borderRadius: '6px',
                              '&:hover': {
                                backgroundColor: '#a8a8a8',
                              },
                            },
                          }}
                          onMouseUp={handleDocumentTextSelection}
                          onTouchEnd={handleDocumentTextSelection}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontSize: { xs: '1rem', md: '1.1rem' },
                              lineHeight: 1.7,
                              color: 'text.primary',
                              whiteSpace: 'pre-line',
                              userSelect: 'text',
                              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                              fontWeight: 400,
                              letterSpacing: '0.01em'
                            }}
                          >
                            {formatDocumentText(document.originalText)}
                          </Typography>

                          {/* Ask AI Tooltip */}
                          {showDocumentAskAI && selectedDocumentText && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: documentAskAIPosition.y,
                                left: documentAskAIPosition.x,
                                zIndex: 1001,
                                transform: 'translateX(-50%)',
                                pointerEvents: 'auto'
                              }}
                            >
                              <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.8 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                              >
                                <Button
                                  variant="contained"
                                  size="medium"
                                  onClick={handleDocumentAskAI}
                                  sx={{
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontSize: '0.9rem',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                    textTransform: 'none',
                                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.5)',
                                    border: '2px solid white',
                                    '&:hover': {
                                      backgroundColor: '#1565c0',
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 8px 24px rgba(25, 118, 210, 0.6)'
                                    }
                                  }}
                                >
                                  Ask AI
                                </Button>
                              </motion.div>
                            </Box>
                          )}


                        </Paper>

                        {/* Usage Tips */}
                        <Box sx={{ mt: 3 }}>
                          <Alert
                            severity="info"
                            sx={{
                              borderRadius: 2,
                              backgroundColor: 'rgba(33, 150, 243, 0.08)',
                              border: '1px solid rgba(33, 150, 243, 0.2)'
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              <TipsAndUpdatesOutlined sx={{ fontSize: '1.1rem', mr: 1, verticalAlign: 'middle' }} />
                              <strong>How to use Ask AI:</strong> Select any text from the document and press <strong>Ctrl+Q</strong> (Cmd+Q on Mac) to get detailed explanations in simple terms.
                            </Typography>
                          </Alert>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                {/* AI Legal Explanation - Only show when active */}
                {(aiExplanation || loadingExplanation) && (
                  <Box flex={1}>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Card sx={{
                        height: '100%',
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(76, 175, 80, 0.1)',
                        overflow: 'hidden',
                        backgroundColor: 'white',
                        border: '3px solid #4caf50'
                      }}>
                        <CardContent sx={{ p: 0 }}>
                          {/* Header */}
                          <Box sx={{
                            backgroundColor: 'white',
                            borderBottom: '3px solid #4caf50',
                            p: 3
                          }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Box display="flex" alignItems="center">
                                <Box
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 3,
                                    border: '2px solid rgba(76, 175, 80, 0.3)'
                                  }}
                                >
                                  <SmartToy sx={{ fontSize: '1.5rem', color: '#4caf50' }} />
                                </Box>
                                <Box>
                                  <Typography
                                    variant="h5"
                                    fontWeight="600"
                                    sx={{
                                      fontSize: { xs: '1.3rem', md: '1.5rem' },
                                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                      color: '#388e3c'
                                    }}
                                  >
                                    AI Legal Explanation
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: '0.9rem',
                                      fontWeight: 400,
                                      color: 'text.secondary'
                                    }}
                                  >
                                    {aiExplanation ? `"${aiExplanation.selectedText.substring(0, 60)}..."` : 'Analyzing selected text...'}
                                  </Typography>
                                </Box>
                              </Box>
                              <Button
                                onClick={() => setAiExplanation(null)}
                                sx={{
                                  color: '#4caf50',
                                  minWidth: 'auto',
                                  fontSize: '1.3rem',
                                  p: 1,
                                  '&:hover': {
                                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                    borderRadius: '50%'
                                  }
                                }}
                              >
                                ✕
                              </Button>
                            </Box>
                          </Box>

                          {/* Content */}
                          <Box sx={{ p: 4 }}>
                            <Box
                              sx={{
                                backgroundColor: 'white',
                                borderRadius: 3,
                                p: 4,
                                border: '2px solid rgba(79, 195, 247, 0.15)',
                                minHeight: 500,
                                maxHeight: 700,
                                overflow: 'auto',
                                display: 'flex',
                                alignItems: loadingExplanation ? 'center' : 'flex-start',
                                justifyContent: loadingExplanation ? 'center' : 'flex-start',
                                '&::-webkit-scrollbar': {
                                  width: '12px',
                                },
                                '&::-webkit-scrollbar-track': {
                                  backgroundColor: '#f1f1f1',
                                  borderRadius: '6px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                  backgroundColor: '#c1c1c1',
                                  borderRadius: '6px',
                                  '&:hover': {
                                    backgroundColor: '#a8a8a8',
                                  },
                                },
                              }}
                            >
                              {loadingExplanation ? (
                                <Box display="flex" alignItems="center" gap={3}>
                                  <Box
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      border: '3px solid #e3f2fd',
                                      borderTop: '3px solid #2196f3',
                                      borderRadius: '50%',
                                      animation: 'spin 1s linear infinite',
                                      '@keyframes spin': {
                                        '0%': { transform: 'rotate(0deg)' },
                                        '100%': { transform: 'rotate(360deg)' }
                                      }
                                    }}
                                  />
                                  <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{
                                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                      fontWeight: 500
                                    }}
                                  >
                                    AI is analyzing your selected text...
                                  </Typography>
                                </Box>
                              ) : (
                                <Box sx={{ width: '100%' }}>
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      fontSize: '1rem',
                                      lineHeight: 1.7,
                                      color: 'text.primary',
                                      whiteSpace: 'pre-line',
                                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                      fontWeight: 400
                                    }}
                                  >
                                    {aiExplanation?.explanation}
                                  </Typography>

                                  <Alert
                                    severity="info"
                                    sx={{
                                      mt: 3,
                                      borderRadius: 1.5,
                                      backgroundColor: 'rgba(33, 150, 243, 0.06)',
                                      border: '1px solid rgba(33, 150, 243, 0.15)',
                                      '& .MuiAlert-message': {
                                        fontSize: '0.8rem',
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                                      }
                                    }}
                                  >
                                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                      <strong>AI-Generated:</strong> Consult a legal professional for official advice.
                                    </Typography>
                                  </Alert>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Box>
                )}
              </Box>
            </motion.div>
          </Box>
        </Box>


      </motion.div>
    </Box>
  );
};

export default DocumentAnalysis;