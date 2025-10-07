const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use the latest available Gemini model
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  // Make AI request with basic error handling (no rate limiting)
  async makeAIRequest(prompt) {
    try {
      console.log('🤖 Making AI request...');
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('AI Request Error:', error);
      
      if (error.status === 429) {
        throw new Error('AI service is temporarily busy. Please try again in a few moments.');
      }
      
      if (error.status === 401) {
        throw new Error('AI service authentication failed. Please check your API key configuration.');
      }
      
      if (error.status === 403) {
        throw new Error('AI service access denied. Please check your API key permissions.');
      }
      
      throw new Error(`AI service error: ${error.message || 'Unknown error occurred'}`);
    }
  }

  async analyzeDocument(text, title = "Legal Document") {
    try {
      const prompt = `
You are an expert legal analyst specializing in Indian law. Analyze this legal document and provide a comprehensive, well-formatted analysis.

Document Title: ${title}
Document Text: ${text}

Please provide your analysis in the following JSON format with properly formatted content using markdown-style formatting:
{
  "summary": "A well-formatted summary with headings and bullet points. Use **bold headings** and bullet points for key information. Structure it like:\n\n**Document Overview**\n• Main purpose and type\n• Key parties involved\n\n**Key Terms**\n• Important clauses\n• Financial obligations\n\n**Risk Assessment**\n• Main concerns\n• Potential issues",
  "keyPoints": [
    "5-7 key points that highlight the most important aspects",
    "Focus on what the user needs to know",
    "Use simple, non-legal language"
  ],
  "riskLevel": "low|medium|high",
  "riskExplanation": "Brief explanation of why this risk level was assigned",
  "highlights": [
    {
      "text": "exact text from document",
      "explanation": "simple explanation of what this means",
      "type": "important|warning|clarification",
      "position": {"start": 0, "end": 50}
    }
  ],
  "violations": [
    {
      "clause": "problematic clause text",
      "violation": "description of the violation",
      "severity": "minor|major|critical",
      "explanation": "detailed explanation in simple terms",
      "governmentClause": "specific Indian law or act violated",
      "recommendation": "what the user should do about this"
    }
  ],
  "recommendations": [
    "Specific actionable advice for the user",
    "What to watch out for",
    "When to consult a lawyer"
  ]
}

Focus on Indian legal compliance including:
- Consumer Protection Act, 2019
- Indian Contract Act, 1872
- Information Technology Act, 2000
- Personal Data Protection regulations
- Labour laws if applicable
- Property laws if applicable

Make sure all explanations are in simple English that anyone can understand.
`;

      const text_response = await this.makeAIRequest(prompt);

      let jsonStr = text_response;
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.split('```json')[1].split('```')[0];
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.split('```')[1];
      }

      try {
        // Clean up the JSON string to handle control characters
        const cleanJsonStr = jsonStr.trim()
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
          .replace(/\n/g, '\\n') // Escape newlines
          .replace(/\r/g, '\\r') // Escape carriage returns
          .replace(/\t/g, '\\t'); // Escape tabs
        
        const analysis = JSON.parse(cleanJsonStr);

        analysis.summary = typeof analysis.summary === 'string' ? analysis.summary : "Document analysis completed.";
        analysis.keyPoints = Array.isArray(analysis.keyPoints) ? analysis.keyPoints : [];
        analysis.riskLevel = analysis.riskLevel || "medium";
        analysis.highlights = Array.isArray(analysis.highlights) ? analysis.highlights : [];
        analysis.violations = Array.isArray(analysis.violations) ? analysis.violations : [];
        analysis.recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];

        return analysis;
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.log('Raw AI response:', text_response);
        return this.createFallbackAnalysis(text_response, text);
      }

    } catch (error) {
      console.error('AI Analysis error:', error);
      throw new Error('Failed to analyze document with AI');
    }
  }

  async explainText(text, context = '', documentType = 'Legal Document') {
    try {
      const prompt = `
You are a legal expert AI assistant. A user has selected the following text from a legal document and wants a detailed explanation:

Selected Text: "${text}"

Document Type: ${documentType}
Context: ${context}

Please provide a clear, detailed explanation of this selected text in simple terms that a non-lawyer can understand. Focus on:

1. What this text means in plain English
2. Why this is important in a legal context
3. Any potential implications or risks
4. Practical advice or recommendations

Keep your explanation concise but comprehensive, and use simple language while maintaining accuracy.
      `;

      return await this.makeAIRequest(prompt);

    } catch (error) {
      console.error('AI Text Explanation error:', error);
      throw new Error('Failed to explain text with AI');
    }
  }

  async chatWithDocument(documentText, question, chatHistory = []) {
    try {
      const contextPrompt = `
You are a helpful legal AI assistant. You have analyzed this legal document and now the user is asking questions about it.

Document Content: ${documentText.substring(0, 3000)}...

Previous conversation:
${chatHistory.slice(-5).map(msg => `User: ${msg.question}\nAI: ${msg.answer}`).join('\n\n')}

Current Question: ${question}

Please provide a well-formatted, helpful answer using the following structure:

**Direct Answer**
• Clear, direct response to the question

**Key Details**
• Relevant clauses or terms
• Specific information from the document

**What This Means**
• Simple explanation in plain English
• Practical implications

**Recommendations**
• What the user should do
• When to seek legal help

Use bullet points, bold headings, and emojis where appropriate. Keep it conversational but well-structured.
`;

      return await this.makeAIRequest(contextPrompt);

    } catch (error) {
      console.error('AI Chat error:', error);
      throw new Error('Failed to get AI response');
    }
  }

  createFallbackAnalysis(aiResponse, originalText) {
    const summary = this.extractSection(aiResponse, 'summary') ||
      `**Document Overview**
• This document contains legal terms and conditions that require careful review
• Multiple clauses may impact your rights and obligations

**Key Concerns**
• Complex legal language that may be difficult to understand
• Potential risks that need professional evaluation

**Recommendation**
• Consider consulting with a legal professional for detailed analysis`;

    const riskLevel = aiResponse.toLowerCase().includes('high risk') ? 'high' :
      aiResponse.toLowerCase().includes('low risk') ? 'low' : 'medium';

    return {
      summary,
      keyPoints: [
        "Document contains legal obligations and terms",
        "Review all clauses carefully before signing",
        "Consider consulting a legal professional",
        "Pay attention to termination and penalty clauses",
        "Understand your rights and responsibilities"
      ],
      riskLevel,
      riskExplanation: "Risk assessment based on document complexity and terms",
      highlights: this.extractHighlights(originalText),
      violations: [],
      recommendations: [
        "Read the entire document carefully",
        "Ask questions about unclear terms",
        "Consider legal consultation for complex agreements",
        "Keep a copy of all signed documents"
      ]
    };
  }

  extractSection(text, section) {
    const regex = new RegExp(`"${section}":\\s*"([^"]*)"`, 'i');
    const match = text.match(regex);
    return match ? match[1] : null;
  }

  extractHighlights(text) {
    const highlights = [];
    const importantTerms = [
      'termination', 'penalty', 'liability', 'payment', 'refund',
      'cancellation', 'breach', 'damages', 'warranty', 'guarantee'
    ];

    importantTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b[^.]*\\.`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        matches.slice(0, 2).forEach(match => {
          const start = text.indexOf(match);
          highlights.push({
            text: match.trim(),
            explanation: `This clause relates to ${term} - important for understanding your obligations.`,
            type: 'important',
            position: { start, end: start + match.length }
          });
        });
      }
    });

    return highlights.slice(0, 10);
  }
}

module.exports = new AIService();