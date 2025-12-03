# Loss Description Generator

An AI-powered web application that transforms damage photos into professional insurance loss descriptions instantly. Using advanced multimodal AI models, this tool analyzes images and generates comprehensive, structured reports for insurance claims processing.

## 🚀 Features

- *AI-Powered Image Analysis*: Upload up to 6 damage photos for instant analysis
- *Multiple AI Models*: Supports Google Gemini, LLaVA, and Qwen vision models
- *Structured Reports*: Generates professional insurance-grade loss descriptions
- *Interactive Chat*: AI assistant for clarifying assessment details
- *PDF Generation*: Creates formatted reports ready for submission
- *Damage Categories*: Supports property, vehicle, agricultural, and natural disaster damage
- *Confidence Scoring*: Shows AI confidence levels for each assessment section
- *Responsive Design*: Works seamlessly on desktop and mobile devices

## 🛠 Tech Stack

### Frontend
- *React 18* - Modern UI framework
- *Vite* - Fast build tool and development server
- *React Router* - Client-side routing
- *Lucide React* - Beautiful icons
- *CSS3* - Responsive styling

### Backend & AI
- *Google Gemini Pro Vision* - Primary AI model for image analysis
- *LLaVA* - Open-source vision-language model
- *Qwen* - Alternative AI model for analysis
- *OpenRouter SDK* - Unified AI model access
- *Express.js* - Backend API server

### Data & Storage
- *Supabase* - Cloud database and real-time features
- *Axios* - HTTP client for API calls
- *jsPDF* - PDF report generation

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- API keys for AI services (Gemini, OpenRouter)

## 🔧 Installation

1. *Clone the repository*
   bash
   git clone https://github.com/yourusername/loss-description-generator.git
   cd loss-description-generator
   

2. *Install dependencies*
   bash
   npm install
   

3. *Set up environment variables*

   Create a .env file in the root directory:
   env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key
   

4. *Start development server*
   bash
   npm run dev
   

5. *Build for production*
   bash
   npm run build
   

## 🚀 Usage

1. *Access the application* at http://localhost:3000

2. *Upload Images*: Drag and drop or select up to 6 damage photos

3. *Provide Details*: Fill in incident information and select loss type

4. *AI Analysis*: The system analyzes images and generates assessment

5. *Review & Edit*: Review the generated report and make adjustments

6. *Generate PDF*: Download professional PDF report for insurance submission

7. *Chat Support*: Use the AI chat for clarification or additional questions

## 🔑 API Keys Setup

### Google Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to .env as VITE_GEMINI_API_KEY

### OpenRouter API 
1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up and get API key
3. Add to .env as VITE_OPENROUTER_API_KEY

## 📁 Project Structure
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


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

## 📝 Supported Damage Types

- *Property Damage*: Fire, flood, earthquake, roof damage
- *Vehicle Damage*: Collision, hail, fire, comprehensive
- *Agricultural*: Crop damage, farm equipment, livestock
- *Natural Disasters*: Hurricane, tornado, tsunami, earthquake
- *Commercial Loss*: Factory, warehouse, equipment damage

## 🔒 Security

- Images are processed client-side and not stored permanently
- API keys are managed securely through environment variables
- No sensitive user data is retained after session
- All AI processing happens through secure API endpoints

## 🙏 Acknowledgments

- Google Gemini for advanced AI vision capabilities
- LLaVA and Qwen communities for open-source AI models
- Supabase for reliable backend services
- React and Vite communities for excellent development tools

