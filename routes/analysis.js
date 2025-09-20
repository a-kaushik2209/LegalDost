const express = require('express');
const Document = require('../models/Document');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

// Indian legal clauses and regulations for violation detection
const INDIAN_LEGAL_VIOLATIONS = {
  'unfair_contract_terms': {
    keywords: ['unilateral termination', 'arbitrary changes', 'no refund', 'unlimited liability'],
    clause: 'Consumer Protection Act, 2019 - Section 2(47)',
    description: 'Unfair contract terms that are detrimental to consumer interests'
  },
  'excessive_penalty': {
    keywords: ['penalty exceeding', 'disproportionate fine', 'excessive charges'],
    clause: 'Indian Contract Act, 1872 - Section 74',
    description: 'Penalty clauses that are excessive and not proportionate to actual loss'
  },
  'privacy_violation': {
    keywords: ['data sharing without consent', 'no privacy policy', 'unlimited data collection'],
    clause: 'Information Technology Act, 2000 & Personal Data Protection Bill',
    description: 'Violation of data privacy and protection rights'
  },
  'misleading_terms': {
    keywords: ['hidden charges', 'misleading information', 'false representation'],
    clause: 'Consumer Protection Act, 2019 - Section 2(1)',
    description: 'Misleading or deceptive practices in consumer contracts'
  }
};

// Enhanced violation detection with more comprehensive rules
const checkViolations = (text, aiAnalysis) => {
  const violations = [];
  const lowerText = text.toLowerCase();

  // Enhanced Indian legal violations
  const violationRules = {
    'unfair_contract_terms': {
      keywords: ['unilateral termination', 'arbitrary changes', 'no refund', 'unlimited liability', 'sole discretion', 'without notice'],
      clause: 'Consumer Protection Act, 2019 - Section 2(47)',
      description: 'Unfair contract terms that are detrimental to consumer interests',
      severity: 'major'
    },
    'excessive_penalty': {
      keywords: ['penalty exceeding', 'disproportionate fine', 'excessive charges', 'penalty of', 'fine of'],
      clause: 'Indian Contract Act, 1872 - Section 74',
      description: 'Penalty clauses that are excessive and not proportionate to actual loss',
      severity: 'major'
    },
    'privacy_violation': {
      keywords: ['data sharing without consent', 'no privacy policy', 'unlimited data collection', 'share personal information', 'third party data'],
      clause: 'Information Technology Act, 2000 & Personal Data Protection Bill',
      description: 'Violation of data privacy and protection rights',
      severity: 'critical'
    },
    'misleading_terms': {
      keywords: ['hidden charges', 'misleading information', 'false representation', 'additional fees', 'subject to change'],
      clause: 'Consumer Protection Act, 2019 - Section 2(1)',
      description: 'Misleading or deceptive practices in consumer contracts',
      severity: 'major'
    },
    'unconscionable_terms': {
      keywords: ['waive all rights', 'no liability', 'accept all risks', 'indemnify company'],
      clause: 'Indian Contract Act, 1872 - Section 16',
      description: 'Terms that are unconscionable or heavily favor one party',
      severity: 'critical'
    }
  };

  Object.entries(violationRules).forEach(([key, rule]) => {
    rule.keywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        violations.push({
          clause: keyword,
          violation: rule.description,
          severity: rule.severity,
          explanation: `This clause may violate ${rule.clause}. ${rule.description}`,
          governmentClause: rule.clause,
          recommendation: `Consider seeking legal advice regarding this clause as it may not be enforceable under Indian law.`
        });
      }
    });
  });

  // Add AI-detected violations if any
  if (aiAnalysis.violations && aiAnalysis.violations.length > 0) {
    violations.push(...aiAnalysis.violations);
  }

  return violations;
};



// Analyze document
router.post('/analyze/:documentId', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.documentId,
      owner: req.userId
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    console.log(`🤖 Starting AI analysis for document: ${document.title}`);

    // Perform real AI analysis using Gemini
    const aiAnalysis = await aiService.analyzeDocument(document.originalText, document.title);
    
    // Check for additional legal violations
    const violations = checkViolations(document.originalText, aiAnalysis);

    // Merge AI violations with rule-based violations
    const allViolations = [...new Map(
      [...violations, ...(aiAnalysis.violations || [])]
        .map(v => [v.clause, v])
    ).values()];

    // Update document with comprehensive analysis
    document.analysis = {
      summary: aiAnalysis.summary,
      keyPoints: aiAnalysis.keyPoints,
      riskLevel: aiAnalysis.riskLevel,
      riskExplanation: aiAnalysis.riskExplanation,
      violations: allViolations,
      highlights: aiAnalysis.highlights,
      recommendations: aiAnalysis.recommendations || []
    };
    
    document.status = 'completed';
    await document.save();

    console.log(`✅ AI analysis completed for document: ${document.title}`);
    console.log(`📊 Risk Level: ${aiAnalysis.riskLevel}`);
    console.log(`⚠️  Violations found: ${allViolations.length}`);

    res.json({
      message: 'Analysis completed successfully',
      analysis: document.analysis
    });
  } catch (error) {
    console.error('❌ Analysis error:', error);
    
    // Update document status to failed
    await Document.findByIdAndUpdate(req.params.documentId, { status: 'failed' });
    
    res.status(500).json({ 
      message: 'Analysis failed', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Chat with AI about document
router.post('/chat/:documentId', auth, async (req, res) => {
  try {
    const { question } = req.body;
    
    const document = await Document.findOne({
      _id: req.params.documentId,
      owner: req.userId
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    console.log(`💬 User question: ${question}`);

    // Get real AI response using Gemini
    const answer = await aiService.chatWithDocument(
      document.originalText, 
      question, 
      document.chatHistory
    );

    console.log(`🤖 AI response generated (${answer.length} characters)`);

    // Save chat history
    document.chatHistory.push({
      question,
      answer,
      timestamp: new Date()
    });
    
    await document.save();

    res.json({ answer });
  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ 
      message: 'Chat failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get chat history
router.get('/chat/:documentId', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.documentId,
      owner: req.userId
    }).select('chatHistory');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document.chatHistory);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
});

// Explain selected text endpoint
router.post('/explain', async (req, res) => {
  try {
    const { text, context, documentType } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const prompt = `
You are a legal expert AI assistant. A user has selected the following text from a legal document analysis summary and wants a detailed explanation:

Selected Text: "${text}"

Document Type: ${documentType || 'Legal Document'}
Context: ${context || 'No additional context provided'}

Please provide a clear, detailed explanation of this selected text in simple terms that a non-lawyer can understand. Focus on:

1. What this text means in plain English
2. Why this is important in a legal context
3. Any potential implications or risks
4. Practical advice or recommendations

Keep your explanation concise but comprehensive, and use simple language while maintaining accuracy.
    `;

    const explanation = await aiService.explainText(text, context, documentType);

    res.json({
      explanation: explanation,
      selectedText: text
    });

  } catch (error) {
    console.error('Error explaining text:', error);
    res.status(500).json({ 
      error: 'Failed to generate explanation',
      details: error.message 
    });
  }
});

module.exports = router;