import React from 'react';
import { Box, Typography, Chip, Divider } from '@mui/material';
import { motion } from 'framer-motion';

const FormattedAIResponse = ({ content, type = 'summary' }) => {
  // Determine if this is being used in a dark context (like the summary card) or light context (like chat)
  const isDarkContext = type === 'summary';
  const textColor = isDarkContext ? 'rgba(255,255,255,0.95)' : 'text.primary';
  const backgroundColor = isDarkContext ? 'rgba(255,255,255,0.1)' : 'rgba(33, 150, 243, 0.05)';
  const borderColor = isDarkContext ? 'rgba(255,255,255,0.2)' : 'rgba(33, 150, 243, 0.2)';
  const hoverBackgroundColor = isDarkContext ? 'rgba(255,255,255,0.2)' : 'rgba(33, 150, 243, 0.1)';
  // Parse and format the AI response
  const formatContent = (text) => {
    if (!text) return [];

    const sections = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentSection = null;
    let currentItems = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check for headings (lines with ** or starting with #)
      if (trimmedLine.match(/^\*\*(.*?)\*\*/) || trimmedLine.startsWith('#')) {
        // Save previous section
        if (currentSection) {
          sections.push({
            ...currentSection,
            items: [...currentItems]
          });
        }
        
        // Start new section
        const heading = trimmedLine.replace(/^\*\*(.*?)\*\*/, '$1').replace(/^#+\s*/, '');
        currentSection = {
          type: 'heading',
          content: heading,
          color: getHeadingColor(heading)
        };
        currentItems = [];
      }
      // Check for bullet points
      else if (trimmedLine.match(/^[-*•]\s/) || trimmedLine.match(/^\d+\.\s/)) {
        const item = trimmedLine.replace(/^[-*•]\s/, '').replace(/^\d+\.\s/, '');
        currentItems.push({
          type: 'bullet',
          content: item
        });
      }
      // Check for important notes (lines with keywords)
      else if (trimmedLine.match(/\b(important|note|warning|caution|attention)\b/i)) {
        currentItems.push({
          type: 'important',
          content: trimmedLine
        });
      }
      // Regular paragraph
      else if (trimmedLine.length > 0) {
        currentItems.push({
          type: 'paragraph',
          content: trimmedLine
        });
      }
    });

    // Add the last section
    if (currentSection) {
      sections.push({
        ...currentSection,
        items: [...currentItems]
      });
    } else if (currentItems.length > 0) {
      // If no headings found, treat as single section
      sections.push({
        type: 'content',
        items: [...currentItems]
      });
    }

    return sections;
  };

  const getHeadingColor = (heading) => {
    const lowerHeading = heading.toLowerCase();
    if (lowerHeading.includes('risk') || lowerHeading.includes('warning') || lowerHeading.includes('violation')) {
      return 'error';
    } else if (lowerHeading.includes('important') || lowerHeading.includes('key') || lowerHeading.includes('critical')) {
      return 'warning';
    } else if (lowerHeading.includes('recommendation') || lowerHeading.includes('advice') || lowerHeading.includes('suggestion')) {
      return 'success';
    } else if (lowerHeading.includes('summary') || lowerHeading.includes('overview')) {
      return 'primary';
    }
    return 'secondary';
  };

  const getBulletIcon = (content) => {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('risk') || lowerContent.includes('danger') || lowerContent.includes('violation')) {
      return '▲';
    } else if (lowerContent.includes('benefit') || lowerContent.includes('advantage') || lowerContent.includes('protection')) {
      return '✓';
    } else if (lowerContent.includes('payment') || lowerContent.includes('fee') || lowerContent.includes('cost')) {
      return '$';
    } else if (lowerContent.includes('termination') || lowerContent.includes('cancel') || lowerContent.includes('end')) {
      return '◆';
    } else if (lowerContent.includes('legal') || lowerContent.includes('law') || lowerContent.includes('court')) {
      return '§';
    } else if (lowerContent.includes('time') || lowerContent.includes('date') || lowerContent.includes('period')) {
      return '◉';
    }
    return '•';
  };

  const sections = formatContent(content);

  return (
    <Box>
      {sections.map((section, sectionIndex) => (
        <motion.div
          key={sectionIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.1 }}
        >
          {section.type === 'heading' && (
            <Box mb={2} mt={sectionIndex > 0 ? 3 : 0}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Chip
                  label={section.content}
                  color={section.color}
                  variant="filled"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    height: 32
                  }}
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
            </Box>
          )}
          
          {section.items && section.items.map((item, itemIndex) => (
            <Box key={itemIndex} mb={1.5}>
              {item.type === 'bullet' && (
                <Box 
                  display="flex" 
                  alignItems="flex-start" 
                  gap={2}
                  sx={{
                    p: 2,
                    backgroundColor: backgroundColor,
                    borderRadius: 2,
                    mb: 1,
                    border: `1px solid ${borderColor}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: hoverBackgroundColor,
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '1.2rem',
                      lineHeight: 1.5,
                      minWidth: 24,
                      mt: 0.1,
                      flexShrink: 0
                    }}
                  >
                    {getBulletIcon(item.content)}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.7,
                      color: textColor,
                      fontWeight: 'medium',
                      fontSize: '0.95rem'
                    }}
                  >
                    {item.content}
                  </Typography>
                </Box>
              )}
              
              {item.type === 'important' && (
                <Box
                  sx={{
                    p: 3,
                    backgroundColor: isDarkContext ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.05)',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'warning.main',
                    mb: 2,
                    borderLeft: '4px solid',
                    borderLeftColor: 'warning.main',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: 'warning.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                      }}
                    >
                      !
                    </Box>
                    <Typography variant="subtitle2" fontWeight="bold" color="warning.dark">
                      Important Notice
                    </Typography>
                  </Box>
                  <Typography variant="body2" color={isDarkContext ? 'rgba(255,255,255,0.9)' : 'warning.dark'}>
                    {item.content}
                  </Typography>
                </Box>
              )}
              
              {item.type === 'paragraph' && (
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.8,
                    color: textColor,
                    mb: 2,
                    fontSize: '1rem',
                    fontWeight: 'normal',
                    p: 1.5,
                    backgroundColor: backgroundColor,
                    borderRadius: 2,
                    border: `1px solid ${borderColor}`
                  }}
                >
                  {item.content}
                </Typography>
              )}
            </Box>
          ))}
        </motion.div>
      ))}
    </Box>
  );
};

export default FormattedAIResponse;