import React, { useState, useEffect } from 'react';
import { 
  Brain, Camera, FileText, Download, CheckCircle, 
  AlertTriangle, Clock, BarChart, TrendingUp, Zap,
  Eye, Target, Ruler, Shield, DollarSign
} from 'lucide-react';
import { realLlavaService } from '../services/llavaApi';
import { pdfService } from '../services/pdfService';

const LLaVAAnalysis = ({ images, metadata, userDetails, onReportGenerated }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [apiStatus, setApiStatus] = useState('checking');
  const [detailedAnalyses, setDetailedAnalyses] = useState([]);
  const [generatedReport, setGeneratedReport] = useState(null);

  // Check API status on mount
  useEffect(() => {
    checkAPIStatus();
  }, []);

  const checkAPIStatus = async () => {
    try {
      const status = await realLlavaService.checkAPIStatus();
      setApiStatus(status.status === 'active' ? 'active' : 'inactive');
    } catch (error) {
      setApiStatus('error');
    }
  };

  // ✅ REAL LLaVA ANALYSIS FUNCTION
  const performRealAnalysis = async () => {
    if (images.length === 0) {
      alert('Please upload images first');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setCurrentStep('Initializing LLaVA AI...');
    setAnalysis(null);
    setDetailedAnalyses([]);

    try {
      // Convert images to base64
      setCurrentStep('Processing images...');
      setProgress(10);
      
      const imagePromises = images.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      const imagesBase64 = await Promise.all(imagePromises);
      setProgress(20);

      // Perform analysis for each image
      const analyses = [];
      for (let i = 0; i < imagesBase64.length; i++) {
        setCurrentStep(`Analyzing image ${i + 1}/${imagesBase64.length}...`);
        
        const analysis = await realLlavaService.analyzeImage(
          imagesBase64[i],
          `Analyze damage for insurance claim: ${metadata.lossType} - ${metadata.incidentType}`
        );
        
        analyses.push({
          imageNumber: i + 1,
          text: analysis,
          timestamp: new Date().toISOString()
        });
        
        setDetailedAnalyses([...analyses]);
        setProgress(20 + ((i + 1) / imagesBase64.length) * 60);
        
        // Small delay between requests
        if (i < imagesBase64.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Compile final report
      setCurrentStep('Compiling final report...');
      setProgress(90);
      
      const compiledReport = realLlavaService.compileReport(analyses, metadata);
      setAnalysis(compiledReport);
      
      // Generate structured data for PDF using API-parsed data
      const parsedData = realLlavaService.parseAnalysisText(analyses);

      const reportData = {
        metadata,
        images: images.map((img, idx) => ({
          name: img.name,
          size: img.size,
          analysis: analyses[idx]?.text || 'No analysis'
        })),
        llavaAnalysis: {
          totalImages: images.length,
          detailedAnalyses: analyses,
          summary: 'LLaVA AI Vision Analysis Complete',
          severity: parsedData.severity,
          estimatedCost: parsedData.estimatedCost,
          estimatedTime: '5-10 business days', // Keep as fallback since API doesn't provide this
          safety: parsedData.safety,
          confidence: 'High',
          recommendations: parsedData.recommendations
        },
        userDetails,
        timestamp: new Date()
      };

      setGeneratedReport(reportData);
      
      if (onReportGenerated) {
        onReportGenerated(reportData);
      }

      setCurrentStep('Analysis complete!');
      setProgress(100);

    } catch (error) {
      console.error('Analysis error:', error);
      setCurrentStep(`Error: ${error.message}`);
      
      // Fallback analysis
      const fallback = realLlavaService.getFallbackAnalysis();
      setAnalysis(fallback);
      
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
        setCurrentStep('');
      }, 1000);
    }
  };

  // ✅ GENERATE PDF REPORT
  const generatePDFReport = async () => {
    if (!generatedReport) {
      alert('Please complete analysis first');
      return;
    }

    try {
      await pdfService.generateReport(generatedReport);
      alert('PDF report downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // ✅ QUICK ANALYSIS TYPES
  const analysisTypes = [
    { id: 'full', label: 'Full Damage Assessment', icon: Brain, color: '#2563eb' },
    { id: 'quick', label: 'Quick Damage Scan', icon: Zap, color: '#10b981' },
    { id: 'safety', label: 'Safety Check', icon: Shield, color: '#ef4444' },
    { id: 'cost', label: 'Cost Estimation', icon: DollarSign, color: '#f59e0b' },
    { id: 'detailed', label: 'Detailed Analysis', icon: BarChart, color: '#8b5cf6' }
  ];

  const formatAnalysisText = (text) => {
    if (!text) return null;
    
    return text.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h3 key={index} className="report-section-title">{line.substring(2)}</h3>;
      } else if (line.startsWith('## ')) {
        return <h4 key={index} className="report-subtitle">{line.substring(3)}</h4>;
      } else if (line.startsWith('• ') || line.startsWith('- ')) {
        return <div key={index} className="analysis-bullet">{line}</div>;
      } else if (line.includes(':')) {
        const [label, value] = line.split(':');
        return (
          <div key={index} className="analysis-key-value">
            <strong>{label}:</strong> {value}
          </div>
        );
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <div key={index} className="analysis-text">{line}</div>;
      }
    });
  };

  return (
    <div className="llava-analysis-container">
      {/* API Status Indicator */}
      <div className={`api-status ${apiStatus}`}>
        {apiStatus === 'active' ? (
          <>
            <CheckCircle size={16} />
            <span>LLaVA API Connected</span>
          </>
        ) : apiStatus === 'checking' ? (
          <>
            <Clock size={16} />
            <span>Checking API Connection...</span>
          </>
        ) : (
          <>
            <AlertTriangle size={16} />
            <span>API Connection Required</span>
          </>
        )}
      </div>

      {/* Analysis Type Selector */}
      <div className="analysis-type-selector">
        <h3>
          <Brain size={24} />
          LLaVA AI Analysis
        </h3>
        <p>Powered by LLaVA 13B Vision Language Model</p>
        
        <div className="type-buttons">
          {analysisTypes.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                className="type-btn"
                style={{ '--btn-color': type.color }}
                onClick={performRealAnalysis}
                disabled={isAnalyzing}
              >
                <Icon size={20} />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Indicator */}
      {isAnalyzing && (
        <div className="analysis-progress">
          <div className="progress-header">
            <div className="spinner"></div>
            <h4>LLaVA AI Analysis in Progress</h4>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="progress-info">
            <span className="step-text">{currentStep}</span>
            <span className="step-percent">{Math.round(progress)}%</span>
          </div>

          <div className="progress-details">
            <div className="detail">
              <Camera size={16} />
              <span>Images: {images.length}</span>
            </div>
            <div className="detail">
              <Target size={16} />
              <span>Model: LLaVA 13B</span>
            </div>
            <div className="detail">
              <Clock size={16} />
              <span>ETA: {Math.round((100 - progress) / 10)}s</span>
            </div>
          </div>

          {/* Real-time Analysis Results */}
          {detailedAnalyses.length > 0 && (
            <div className="real-time-results">
              <h5>🔍 Live Analysis Results</h5>
              <div className="real-time-analyses">
                {detailedAnalyses.map((item, index) => (
                  <div key={index} className="real-time-analysis-item">
                    <div className="analysis-header">
                      <span className="image-label">Image {item.imageNumber}</span>
                      <span className="timestamp">{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="analysis-content">
                      {formatAnalysisText(item.text)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !isAnalyzing && (
        <div className="analysis-results">
          <div className="results-header">
            <h3>
              <FileText size={24} />
              LLaVA Analysis Results
            </h3>
            <div className="results-meta">
              <span><Clock size={14} /> Just generated</span>
              <span><Eye size={14} /> {images.length} images analyzed</span>
              <span><CheckCircle size={14} /> AI Confidence: High</span>
            </div>
          </div>
          
          <div className="results-content">
            <div className="analysis-text">
              {formatAnalysisText(analysis)}
            </div>
            
            {/* Detailed Analyses */}
            {detailedAnalyses.length > 0 && (
              <div className="detailed-analyses">
                <h4>Individual Image Analyses</h4>
                {detailedAnalyses.map((item, index) => (
                  <div key={index} className="image-analysis">
                    <h5>Image {item.imageNumber}</h5>
                    <div className="analysis-content">
                      {formatAnalysisText(item.text)}
                    </div>
                    <div className="analysis-meta">
                      <small>{new Date(item.timestamp).toLocaleTimeString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={generatePDFReport}
            >
              <Download size={18} />
              Download PDF Report
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={performRealAnalysis}
            >
              <Brain size={18} />
              Re-analyze
            </button>
            
            <button className="btn btn-secondary">
              <FileText size={18} />
              Save to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Start Analysis Button */}
      {!analysis && !isAnalyzing && (
        <div className="start-analysis">
          <button
            className="btn btn-primary btn-lg"
            onClick={performRealAnalysis}
            disabled={images.length === 0}
          >
            <Brain size={24} />
            Start LLaVA AI Analysis
          </button>
          
          {images.length === 0 && (
            <p className="hint">Please upload images first</p>
          )}
        </div>
      )}

      <style jsx>{`
        .llava-analysis-container {
          background: white;
          border-radius: 16px;
          padding: 30px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .api-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 24px;
        }

        .api-status.active {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #10b981;
        }

        .api-status.checking {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #f59e0b;
        }

        .api-status.error, .api-status.inactive {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #ef4444;
        }

        .analysis-type-selector {
          margin-bottom: 32px;
        }

        .analysis-type-selector h3 {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          color: #1f2937;
        }

        .analysis-type-selector p {
          color: #6b7280;
          margin-bottom: 24px;
        }

        .type-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .type-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #374151;
        }

        .type-btn:hover:not(:disabled) {
          border-color: var(--btn-color);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          color: var(--btn-color);
        }

        .type-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .type-btn svg {
          color: var(--btn-color);
        }

        .analysis-progress {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
          border: 1px solid #e2e8f0;
        }

        .progress-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .progress-header h4 {
          margin: 0;
          color: #1f2937;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .progress-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2563eb, #0ea5e9);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 14px;
          color: #6b7280;
        }

        .progress-details {
          display: flex;
          gap: 24px;
        }

        .detail {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #4b5563;
        }

        .real-time-results {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .real-time-results h5 {
          margin: 0 0 16px 0;
          color: #2563eb;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .real-time-analyses {
          max-height: 300px;
          overflow-y: auto;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .real-time-analysis-item {
          padding: 16px;
          border-bottom: 1px solid #f3f4f6;
        }

        .real-time-analysis-item:last-child {
          border-bottom: none;
        }

        .analysis-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .image-label {
          font-weight: 600;
          color: #2563eb;
          font-size: 14px;
        }

        .timestamp {
          font-size: 12px;
          color: #9ca3af;
        }

        .analysis-content {
          font-size: 14px;
          color: #374151;
          line-height: 1.5;
        }

        .analysis-results {
          margin-top: 32px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }

        .results-header {
          padding: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .results-header h3 {
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .results-meta {
          display: flex;
          gap: 20px;
          font-size: 14px;
          opacity: 0.9;
        }

        .results-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .results-content {
          padding: 24px;
          max-height: 500px;
          overflow-y: auto;
          background: white;
        }

        .analysis-text {
          line-height: 1.6;
          color: #374151;
        }

        .report-section-title {
          color: #2563eb;
          margin: 24px 0 12px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .report-subtitle {
          color: #4b5563;
          margin: 20px 0 8px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .analysis-bullet {
          margin: 6px 0;
          padding-left: 20px;
          position: relative;
        }

        .analysis-bullet::before {
          content: '•';
          position: absolute;
          left: 0;
          color: #2563eb;
          font-weight: bold;
        }

        .analysis-key-value {
          margin: 8px 0;
          padding: 4px 0;
        }

        .analysis-key-value strong {
          color: #1f2937;
          min-width: 150px;
          display: inline-block;
        }

        .detailed-analyses {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 2px solid #e5e7eb;
        }

        .detailed-analyses h4 {
          color: #2563eb;
          margin-bottom: 16px;
        }

        .image-analysis {
          margin-bottom: 24px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }

        .image-analysis h5 {
          margin: 0 0 12px 0;
          color: #1f2937;
        }

        .analysis-content {
          font-size: 14px;
          color: #4b5563;
        }

        .analysis-meta {
          margin-top: 12px;
          font-size: 12px;
          color: #9ca3af;
          text-align: right;
        }

        .action-buttons {
          padding: 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 16px;
          justify-content: center;
          background: #f9fafb;
        }

        .btn {
          padding: 14px 28px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 15px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
        }

        .btn-secondary {
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .btn-lg {
          padding: 18px 36px;
          font-size: 16px;
        }

        .start-analysis {
          text-align: center;
          padding: 40px 20px;
        }

        .hint {
          margin-top: 12px;
          color: #6b7280;
          font-size: 14px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .type-buttons {
            grid-template-columns: 1fr;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .results-meta {
            flex-direction: column;
            gap: 8px;
          }
          
          .progress-details {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default LLaVAAnalysis;