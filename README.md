# LegalDost

A professional AI-powered legal document analyzer that simplifies complex legal documents into clear, accessible guidance. "Dost" means friend in Hindi - your trusted legal companion. Built with React, Node.js, and Google Cloud AI.

## Features

### 🤖 AI-Powered Analysis
- **Document Processing**: Upload PDF, JPG, PNG, or TXT files
- **Smart Text Extraction**: OCR for images, PDF parsing
- **AI Summarization**: Clear, simple summaries of complex legal documents
- **Risk Assessment**: Automatic risk level evaluation (Low/Medium/High)

### 🇮🇳 Indian Legal Compliance
- **Violation Detection**: Identifies clauses that may violate Government of India regulations
- **Legal References**: Cites specific Indian laws and acts
- **Compliance Highlighting**: Red highlights for potential violations with explanations

### 💬 Interactive Chat Interface
- **AI Assistant**: Ask questions about your documents
- **Contextual Responses**: AI understands your document content
- **Suggested Questions**: Pre-built queries for common legal concerns
- **Chat History**: Persistent conversation history

### 🎨 Professional UI/UX
- **Modern Design**: Material-UI components with smooth animations
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Loading Animations**: Beautiful loading states and progress indicators
- **Document Highlighting**: Interactive text highlighting with explanations

### 🔐 Security & Authentication
- **User Authentication**: Secure login/register system
- **JWT Tokens**: Secure session management
- **Private Documents**: Each user can only access their own documents
- **Rate Limiting**: API protection against abuse

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Material-UI (MUI)** - Professional component library
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Dropzone** - Drag & drop file uploads

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - Document database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **PDF-Parse** - PDF text extraction
- **Tesseract.js** - OCR for images

### AI Integration
- **Google Cloud Vertex AI** - Document analysis
- **Gemini API** - Conversational AI
- **Custom Legal Rules** - Indian law violation detection

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Google Cloud account with Vertex AI enabled

### 1. Clone the Repository
```bash
git clone <repository-url>
cd legal-ai-analyzer
```

### 2. Install Dependencies
```bash
npm run install-all
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/legal-ai
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here
CLIENT_URL=http://localhost:3000

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. MongoDB Setup
- Install MongoDB locally or use MongoDB Atlas
- Update the `MONGODB_URI` in your `.env` file

### 5. Google Cloud Setup
1. Create a Google Cloud project
2. Enable Vertex AI API
3. Create service account and download credentials
4. Set up Gemini API access
5. Update the API keys in `.env`

### 6. Start the Application

#### Development Mode
```bash
npm run dev
```
This starts both the backend server (port 5000) and React frontend (port 3000).

#### Production Mode
```bash
npm run build
npm start
```

## Usage Guide

### 1. User Registration
- Navigate to `/register`
- Create an account with name, email, and password
- Automatic login after registration

### 2. Document Upload
- Click "Upload Document" from dashboard
- Drag & drop or select files (PDF, JPG, PNG, TXT)
- Add a descriptive title
- Click "Upload & Analyze"

### 3. Document Analysis
- View AI-generated summary
- Check risk level assessment
- Review highlighted important clauses
- See legal violations (if any) with Indian law references
- Click highlighted text for explanations

### 4. Chat with AI
- Click "Chat with AI" on any analyzed document
- Ask questions about the document
- Use suggested questions or type your own
- Get contextual responses based on document content

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Documents
- `GET /api/documents` - Get user documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/:id` - Get specific document
- `DELETE /api/documents/:id` - Delete document

### Analysis
- `POST /api/analysis/analyze/:id` - Analyze document
- `POST /api/analysis/chat/:id` - Chat with AI
- `GET /api/analysis/chat/:id` - Get chat history

## Legal Compliance Features

### Indian Law Violations Detected
- **Consumer Protection Act, 2019** - Unfair contract terms
- **Indian Contract Act, 1872** - Excessive penalty clauses
- **Information Technology Act, 2000** - Privacy violations
- **Personal Data Protection Bill** - Data handling issues

### Highlighting System
- 🔴 **Red Border**: Legal violations
- 🟡 **Yellow**: Warnings and cautions
- 🔵 **Blue**: Important terms and clauses
- 🟣 **Purple**: Clarifications and explanations

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Sanitized user inputs
- **File Type Validation**: Only allowed file types
- **CORS Protection**: Configured for security
- **Helmet.js**: Security headers

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email [support@legaldost.com] or create an issue in the repository.

## Roadmap

- [ ] Multi-language support
- [ ] Advanced AI models integration
- [ ] Document comparison features
- [ ] Legal template library
- [ ] Mobile app development
- [ ] Integration with legal databases
- [ ] Blockchain document verification

---

**Disclaimer**: This tool provides AI-generated analysis for informational purposes only. Always consult with qualified legal professionals for official legal advice.