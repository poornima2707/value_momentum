import React, { useState, useRef } from 'react';
import {
  Upload, Brain, FileText, AlertCircle, CheckCircle,
  Loader, Download, Eye, MessageCircle, X, Plus, Trash2
} from 'lucide-react';
import geminiApiService from '../services/geminiApi';

const GeminiAnalysis = ({ images, metadata, userDetails, onReportGenerated }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      // Limit to maximum 30 images
      const newImages = [...selectedImages, ...files].slice(0, 30);
      setSelectedImages(newImages);
      setAnalysisResult(null);
      setError(null);
      setShowReport(false);
    }
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setAnalysisResult(null);
    setError(null);
    setShowReport(false);
  };

  const handleAnalyze = async () => {
    if (selectedImages.length === 0) {
      setError('Please select at least one image to analyze');
      return;
    }

    if (selectedImages.length < 3) {
      setError('Please select at least 3 images for analysis');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Analyze all images and combine results
      const allResults = [];
      for (const image of selectedImages) {
        const result = await geminiApiService.analyzeImageWithGemini(image, metadata?.description || '');
        if (result.success) {
          allResults.push(result.data);
        }
      }

      if (allResults.length > 0) {
        // Combine all analysis results
        const combinedResult = geminiApiService.combineAnalysisResults(allResults);
        const report = await geminiApiService.generateReport(combinedResult, userDetails);
        setAnalysisResult(combinedResult);
        setShowReport(true);

        // Call the callback with the complete report
        if (onReportGenerated) {
          onReportGenerated(report);
        }
      } else {
        setError('Analysis failed for all images');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze images');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadReport = () => {
    if (!analysisResult) return;

    const report = geminiApiService.generateReport(analysisResult, userDetails);
    const reportText = geminiApiService.exportReportAsText(report);

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-assessment-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="gemini-analysis">
      {/* Header */}
      <div className="analysis-header">
        <Brain size={32} />
        <div>
          <h2>Gemini AI Damage Analysis</h2>
          <p>Advanced image analysis using Google's Gemini Vision Model</p>
        </div>
      </div>

      {/* Image Selection */}
      <div className="image-selection">
        <div className="upload-section">
          <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
            <Upload size={48} />
            <h3>Select Images for Analysis</h3>
            <p>Choose multiple damage images to analyze with Gemini AI (minimum 3)</p>
            {selectedImages.length > 0 && (
              <div className="selected-count">
                <CheckCircle size={20} />
                <span>{selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
        </div>

        {selectedImages.length > 0 && (
          <div className="image-gallery">
            {selectedImages.map((image, index) => (
              <div key={index} className="image-item">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Selected ${index + 1}`}
                  className="gallery-image"
                />
                <button
                  className="remove-btn"
                  onClick={() => removeImage(index)}
                  title="Remove image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analysis Controls */}
      <div className="analysis-controls">
        <button
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={selectedImages.length < 3 || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader size={20} className="spinning" />
              Analyzing {selectedImages.length} images with Gemini AI...
            </>
          ) : (
            <>
              <Brain size={20} />
              Analyze {selectedImages.length} Image{selectedImages.length > 1 ? 's' : ''} with Gemini AI
            </>
          )}
        </button>

        {analysisResult && (
          <div className="report-actions">
            <button className="view-report-btn" onClick={() => setShowReport(!showReport)}>
              <Eye size={18} />
              {showReport ? 'Hide Report' : 'View Report'}
            </button>
            <button className="download-btn" onClick={downloadReport}>
              <Download size={18} />
              Download Report
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Report Display */}
      {showReport && analysisResult && (
        <div className="report-container">
          <div className="report-header">
            <FileText size={24} />
            <h3>Gemini AI Analysis Report</h3>
          </div>

          <div className="report-content">
            <div className="report-section">
              <h4><strong>Damage Type</strong></h4>
              <p>{analysisResult.damageType || 'Not specified'}</p>
            </div>

            <div className="report-section">
              <h4><strong>Severity Level</strong></h4>
              <p>{analysisResult.severityLevel || 'Not specified'}</p>
            </div>

            <div className="report-section">
              <h4><strong>Affected Areas</strong></h4>
              <p>{analysisResult.affectedAreas || 'Not specified'}</p>
            </div>

            <div className="report-section">
              <h4><strong>Repair Requirements</strong></h4>
              <p>{analysisResult.repairRequirements || 'Not specified'}</p>
            </div>

            <div className="report-section">
              <h4><strong>Potential Causes</strong></h4>
              <p>{analysisResult.potentialCauses || 'Not specified'}</p>
            </div>

            <div className="report-section">
              <h4><strong>Safety Concerns</strong></h4>
              <p>{analysisResult.safetyConcerns || 'Not specified'}</p>
            </div>

            <div className="report-section">
              <h4><strong>Recommended Actions</strong></h4>
              <p>{analysisResult.immediateActions || 'Not specified'}</p>
            </div>

            <div className="report-section full-report">
              <h4><strong>Complete Analysis</strong></h4>
              <pre>{analysisResult.fullReport}</pre>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .gemini-analysis {
          background: white;
          border-radius: 16px;
          padding: 40px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .analysis-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .analysis-header h2 {
          margin: 0;
          color: #1f2937;
        }

        .analysis-header p {
          margin: 4px 0 0 0;
          color: #6b7280;
        }

        .image-selection {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }

        .upload-section {
          background: #f9fafb;
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upload-section:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .upload-area h3 {
          margin: 20px 0 10px 0;
          color: #1f2937;
        }

        .upload-area p {
          color: #6b7280;
          margin-bottom: 20px;
        }

        .selected-count {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #059669;
          font-weight: 500;
        }

        .image-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 15px;
          max-height: 400px;
          overflow-y: auto;
          padding: 20px;
          background: #f9fafb;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .image-item {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }

        .image-item:hover {
          transform: scale(1.02);
        }

        .gallery-image {
          width: 100%;
          height: 120px;
          object-fit: cover;
          display: block;
        }

        .remove-btn {
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .remove-btn:hover {
          background: rgba(220, 38, 38, 1);
          transform: scale(1.1);
        }

        .analysis-controls {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          align-items: center;
        }

        .analyze-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
        }

        .analyze-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }

        .analyze-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .report-actions {
          display: flex;
          gap: 12px;
        }

        .view-report-btn, .download-btn {
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .view-report-btn:hover, .download-btn:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          margin-bottom: 20px;
        }

        .report-container {
          background: #f9fafb;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .report-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .report-header h3 {
          margin: 0;
        }

        .report-content {
          padding: 30px;
        }

        .report-section {
          margin-bottom: 24px;
        }

        .report-section h4 {
          color: #2563eb;
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .report-section p {
          color: #4b5563;
          line-height: 1.6;
          margin: 0;
        }

        .full-report pre {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          white-space: pre-wrap;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.5;
          max-height: 400px;
          overflow-y: auto;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .image-selection {
            grid-template-columns: 1fr;
          }

          .analysis-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .report-actions {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default GeminiAnalysis;
