# CodeSahayak - AI-Powered Coding Education Platform

> Empowering students to learn coding with AI assistance in multiple Indian languages

## Features

- **AI-Powered Learning**: Get instant help from Gurujii, your AI coding tutor
- **Multi-Language Support**: Learn in 9 Indian languages
- **Interactive IDE**: Write, run, and debug code in real-time
- **Real-Time Error Detection**: Understand errors with clear explanations
- **Voice Explanations**: Listen to error explanations in your language
- **Progress Tracking**: Monitor your learning journey

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL (optional)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/codesahayak.git
cd codesahayak
```

2. Install dependencies
```bash
# Frontend
cd app
npm install

# Backend
cd backend
npm install

# Gurujii AI API
cd ../../gurujii-api
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

3. Configure environment
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:3001/api
VITE_GURUJII_API_URL=http://localhost:5000

# Backend (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/codesahayak"
JWT_SECRET="your-secret-key"
GURUJII_API_URL="http://localhost:5000"
```

4. Start the application
```bash
start-all.bat
```

5. Access at http://localhost:5173

## Technology Stack

### Frontend
- React 19.2, TypeScript, Vite
- Tailwind CSS, Monaco Editor
- Framer Motion, Zustand

### Backend
- Node.js, Express, Prisma
- PostgreSQL, JWT, TypeScript

### AI Engine
- Python Flask, PyTorch
- Transformers, TinyLlama
- NLLB-200, MMS-TTS

## Documentation

- [Requirements](requirements.md) - System requirements and specifications
- [Design](design.md) - Architecture and design decisions

## Supported Languages

### Programming
Python, JavaScript, TypeScript, Java, C/C++, HTML/CSS, SQL

### Natural Languages
English, Hindi, Tamil, Bengali, Telugu, Marathi, Gujarati, Kannada, Malayalam

## API Endpoints

### Gurujii AI
- `POST /api/gurujii/analyze` - Analyze code
- `POST /api/gurujii/explain-error` - Explain errors
- `POST /api/gurujii/suggest` - Get suggestions

## Development

```bash
# Frontend
cd app
npm run dev

# Backend
cd app/backend
npm run dev

# Gurujii API
cd gurujii-api
venv\Scripts\activate
python app.py
```

## Project Structure

```
codesahayak/
├── app/                    # Frontend & Backend
│   ├── src/               # React application
│   └── backend/           # Express API
├── gurujii-api/           # AI API
│   ├── app.py            # Flask application
│   └── requirements.txt  # Python dependencies
├── requirements.md        # Requirements document
├── design.md             # Design document
└── README.md             # This file
```

## License

MIT License - See LICENSE file for details

---

**Developed by Hood_Technoid**
