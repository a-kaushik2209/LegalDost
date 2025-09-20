const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  originalText: {
    type: String,
    required: true
  },
  simplifiedText: {
    type: String
  },
  fileType: {
    type: String,
    enum: ['pdf', 'image', 'text'],
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  analysis: {
    summary: String,
    keyPoints: [String],
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    violations: [{
      clause: String,
      violation: String,
      severity: {
        type: String,
        enum: ['minor', 'major', 'critical', 'low', 'medium', 'high'],
        default: 'minor'
      },
      explanation: String,
      governmentClause: String
    }],
    highlights: [{
      text: String,
      explanation: String,
      position: {
        start: Number,
        end: Number
      },
      type: {
        type: String,
        enum: ['important', 'warning', 'violation', 'clarification'],
        default: 'important'
      }
    }]
  },
  chatHistory: [{
    question: String,
    answer: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);