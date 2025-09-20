const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const Document = require('../models/Document');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, image, and text files are allowed'));
    }
  }
});

// Extract text from different file types
const extractText = async (filePath, fileType) => {
  try {
    switch (fileType) {
      case 'pdf':
        const pdfBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(pdfBuffer);
        return pdfData.text;
      
      case 'image':
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
        return text;
      
      case 'text':
        return fs.readFileSync(filePath, 'utf8');
      
      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw error;
  }
};

// Upload and process document
router.post('/upload', auth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title } = req.body;
    const fileType = req.file.mimetype.includes('pdf') ? 'pdf' : 
                    req.file.mimetype.includes('image') ? 'image' : 'text';

    // Extract text from file
    const extractedText = await extractText(req.file.path, fileType);

    // Create document record
    const document = new Document({
      title: title || req.file.originalname,
      originalText: extractedText,
      fileType,
      fileName: req.file.originalname,
      filePath: req.file.path,
      owner: req.userId,
      status: 'processing'
    });

    await document.save();

    res.status(201).json({
      message: 'Document uploaded successfully',
      documentId: document._id,
      document: {
        id: document._id,
        title: document.title,
        fileType: document.fileType,
        fileName: document.fileName,
        status: document.status,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload document' });
  }
});

// Get user documents
router.get('/', auth, async (req, res) => {
  try {
    const documents = await Document.find({ owner: req.userId })
      .select('-originalText -simplifiedText -chatHistory')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

// Get specific document
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Failed to fetch document' });
  }
});

// Delete document
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete file from filesystem
    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Failed to delete document' });
  }
});

module.exports = router;