# Loss Description Generator

An AI-powered web application that transforms damage photos into professional insurance loss descriptions instantly. Using advanced multimodal AI models (vision + language), this tool analyzes images and generates comprehensive, structured reports for insurance claims processing.

## 🎯 Project Overview

**Category**: Vision + Language Models, Multimodal AI  
**Purpose**: Automated insurance claims documentation  
**Demo Flow**: Upload damage photos → AI analyzes → Generate professional loss description paragraph

### Problem Statement
Insurance adjusters spend significant time writing detailed loss descriptions from damage photos. This tool automates that process using multimodal AI to analyze images and generate accurate, professional documentation.

### Solution
Combines computer vision and natural language processing to:
- Analyze damage severity from images
- Identify damage types and affected areas
- Generate structured, professional loss descriptions
- Provide confidence scores for AI assessments

## 🚀 Features

- **AI-Powered Image Analysis**: Upload up to 6 damage photos for instant analysis
- **Multiple AI Models**: Supports Google Gemini, LLaVA, and Qwen vision models
- **Structured Reports**: Generates professional insurance-grade loss descriptions
- **Interactive Chat**: AI assistant for clarifying assessment details
- **PDF Generation**: Creates formatted reports ready for submission
- **Damage Categories**: Supports property, vehicle, agricultural, and natural disaster damage
- **Confidence Scoring**: Shows AI confidence levels for each assessment section
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **CSS3** - Responsive styling

### Backend & AI
- **Google Gemini Pro Vision** - Primary AI model for image analysis
- **LLaVA** - Open-source vision-language model
- **Qwen** - Alternative AI model for analysis
- **OpenRouter SDK** - Unified AI model access
- **Express.js** - Backend API server

### Data & Storage
- **Axios** - HTTP client for API calls
- **jsPDF** - PDF report generation

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- API keys for AI services (Gemini, OpenRouter)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/loss-description-generator.git
   cd loss-description-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🚀 Usage

### Quick Start Demo

1. **Access the application** at `http://localhost:3000`

2. **Upload Images**: 
   - Drag and drop or select up to 6 damage photos
   - Supported formats: JPG, PNG, WEBP
   - Example: Photos of hail damage to car roof, flood damage to basement

3. **Provide Details**: 
   - Fill in incident information
   - Select loss type (property, vehicle, agricultural, natural disaster)
   - Add date and location

4. **AI Analysis**: 
   - The system analyzes images using multimodal AI
   - Vision models identify damage patterns
   - Language models generate descriptive text

5. **Review Generated Description**: 
   - AI writes comprehensive "Loss Description" paragraph
   - Review damage severity, affected areas, and estimated scope
   - Edit or refine as needed

6. **Generate PDF**: 
   - Download professional PDF report for insurance submission
   - Includes images, descriptions, and metadata

7. **Chat Support**: 
   - Use the AI chat for clarification or additional questions
   - Ask for specific details or alternative descriptions

### Example Use Cases

**Hail Damage to Vehicle**
- Upload: Photos of dented car roof and hood
- AI generates: "Extensive hail damage observed across vehicle roof and hood. Multiple impact points ranging from 1-3 inches in diameter. Paint integrity compromised in 15+ locations. Structural damage assessment required for roof panel."

**Flood Damage to Basement**
- Upload: Photos of water-damaged basement
- AI generates: "Severe water intrusion detected in basement area. Water line visible at 18-24 inches on walls. Carpet and drywall showing saturation damage. Visible mold growth on baseboards. HVAC system partially submerged."

## 🔑 API Keys Setup

### Google Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `.env` as `VITE_GEMINI_API_KEY`

### OpenRouter API 
1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up and get API key
3. Add to `.env` as `VITE_OPENROUTER_API_KEY`

## 📁 Project Structure

```
loss-description-generator/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── assessment/     # Assessment-related components
│   │   ├── chatbot/        # Chat interface components
│   │   ├── gemini/         # Gemini AI integration
│   │   ├── llava/          # LLaVA AI integration
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   └── ui/            # Reusable UI components
│   ├── config/            # Configuration files
│   ├── styles/            # CSS stylesheets
│   └── App.jsx            # Main app component
├── 00-damage/             # Sample damage images
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Key Components

### Multimodal AI Pipeline
1. **Image Processing**: Upload and preprocess damage photos
2. **Vision Analysis**: AI models identify damage patterns, severity, and affected areas
3. **Context Integration**: Combine visual analysis with user-provided incident details
4. **Language Generation**: Generate professional loss description paragraphs
5. **Report Formatting**: Structure output for insurance submission

### AI Models Explained

**Google Gemini Pro Vision**
- Primary model for image analysis
- Excellent at identifying damage types and severity
- Strong natural language generation capabilities

**LLaVA (Large Language and Vision Assistant)**
- Open-source alternative
- Good for detailed visual descriptions
- Cost-effective option

**Qwen Vision**
- Additional model for comparison
- Useful for specialized damage types
- Provides alternative perspectives

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow React best practices
- Write descriptive commit messages
- Add tests for new features
- Update documentation

## 📝 Supported Damage Types

- **Property Damage**: Fire, flood, earthquake, roof damage, structural issues
- **Vehicle Damage**: Collision, hail, fire, comprehensive, vandalism
- **Agricultural**: Crop damage, farm equipment, livestock facilities
- **Natural Disasters**: Hurricane, tornado, tsunami, earthquake aftermath
- **Commercial Loss**: Factory, warehouse, equipment damage, business interruption

## 🔒 Security & Privacy

- Images are processed client-side and not stored permanently
- API keys are managed securely through environment variables
- No sensitive user data is retained after session
- All AI processing happens through secure API endpoints
- HTTPS encryption for all data transmission
- No third-party data sharing

## 🚀 Performance Optimization

- Lazy loading for components
- Image compression before upload
- Efficient API call management
- Caching for repeated requests
- Progressive web app capabilities

## 📊 Future Enhancements

- [ ] Real-time damage estimation
- [ ] Integration with insurance claim systems
- [ ] Mobile app development
- [ ] OCR for extracting text from damage photos
- [ ] Multi-language support
- [ ] Video analysis capabilities
- [ ] Blockchain verification for report integrity

## 🐛 Troubleshooting

**API Key Issues**
- Ensure all environment variables are set correctly
- Check API key validity and quotas
- Verify `.env` file is in root directory

**Image Upload Problems**
- Check file size (max 10MB per image)
- Verify supported formats (JPG, PNG, WEBP)
- Clear browser cache and retry

**AI Generation Errors**
- Check internet connection
- Verify API credits/quotas
- Try alternative AI model

## 📖 Documentation

For detailed documentation on:
- AI model selection and tuning
- Custom damage type definitions
- API integration examples
- Advanced configuration options

## 🙏 Acknowledgments

- Google Gemini for advanced AI vision capabilities
- LLaVA and Qwen communities for open-source AI models
- Supabase for reliable backend services
- React and Vite communities for excellent development tools
- Insurance industry professionals for domain expertise



---

**Made with ❤️ for the insurance industry** | **Powered by Multimodal AI** | **Built with React & Vite*
