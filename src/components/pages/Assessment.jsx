import React, { useState, useRef } from 'react';
import {
  Upload, FileText, MessageCircle, Brain, Camera,
  Layers, Download, CheckCircle, AlertCircle, Users,
  Home, Car, TreePine, Factory, Cloud, Loader, Code
} from 'lucide-react';
import ImageUploader from '../assessment/ImageUploader';
import MetadataForm from '../assessment/MetadataForm';
import LLaVAAnalysis from '../llava/LLaVAAnalysis';
import ImageAnalysis from '../llava/ImageAnalysis';
import GeminiAnalysis from '../gemini/GeminiAnalysis';
import ChatbotInterface from '../chatbot/ChatbotInterface';
import { pdfService } from '../services/pdfService';
import geminiApiService from '../services/geminiApi';
import { realLlavaService } from '../services/llavaApi';

const Assessment = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [images, setImages] = useState([]);
  const [metadata, setMetadata] = useState({
    lossType: '',
    incidentType: '',
    location: '',
    date: '',
    description: '',
    aiModel: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    cropType: '',
    estimatedArea: '',
    cropStage: '',
    businessType: '',
    businessName: '',
    propertyType: '',
    areaAffected: '',
    damageScale: '',
    propertiesAffected: ''
  });
  const [userDetails, setUserDetails] = useState({
    name: '',
    contact: '',
    email: '',
    policyNumber: ''
  });
  const [llavaReport, setLlavaReport] = useState(null);
  const [geminiReport, setGeminiReport] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    language: 'en',
    history: []
  });

  const handleImagesChange = (newImages) => {
    setImages(newImages);
  };

  const handleMetadataChange = (newMetadata) => {
    setMetadata(newMetadata);
  };

  const handleUserDetailsChange = (field, value) => {
    setUserDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLlavaReport = (reportData) => {
    setLlavaReport(reportData);
    setActiveTab('report');
  };

  const handleGeminiReport = (reportData) => {
    setGeminiReport(reportData);
    setActiveTab('report');
  };

  const handleDirectAnalysis = async () => {
    if (images.length === 0 || !metadata.lossType || !metadata.aiModel) {
      return;
    }

    // If LLaVA is selected, redirect to LLaVA tab instead of direct analysis
    if (metadata.aiModel === 'llava') {
      setActiveTab('llava');
      return;
    }

    // For Gemini, perform direct analysis
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentAnalysisStep('Initializing analysis...');

    try {
      if (metadata.aiModel === 'gemini') {
        setCurrentAnalysisStep('Analyzing images with Gemini AI...');
        setAnalysisProgress(10);

        // Analyze each image individually in parallel
        const individualResults = [];
        setCurrentAnalysisStep(`Analyzing ${images.length} images...`);
        setAnalysisProgress(15);

        try {
          // Process images sequentially to avoid rate limiting
          for (let i = 0; i < images.length; i++) {
            setCurrentAnalysisStep(`Analyzing image ${i + 1} of ${images.length}...`);
            setAnalysisProgress(15 + (i / images.length) * 60); // Progress from 15% to 75%

            try {
              const result = await geminiApiService.analyzeImageWithGemini(images[i], `Loss Type: ${metadata.lossType}, Incident: ${metadata.incidentType}, Location: ${metadata.location}, Image ${i + 1} of ${images.length}`);

              if (result.success) {
                individualResults.push({
                  imageIndex: i,
                  imageName: images[i].name || `Image ${i + 1}`,
                  analysis: result.data,
                  raw: result.raw
                });
              } else {
                individualResults.push({
                  imageIndex: i,
                  imageName: images[i].name || `Image ${i + 1}`,
                  analysis: null,
                  error: result.error || 'Analysis failed',
                  raw: result.raw
                });
              }
            } catch (imageError) {
              console.error(`Error analyzing image ${i + 1}:`, imageError);
              individualResults.push({
                imageIndex: i,
                imageName: images[i].name || `Image ${i + 1}`,
                analysis: null,
                error: imageError.message || 'Unknown error occurred',
                raw: null
              });
            }

            // Add small delay between requests to avoid rate limiting
            if (i < images.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          setAnalysisProgress(80);
        } catch (error) {
          console.error('Sequential analysis error:', error);
          // If sequential processing fails completely, show error
          alert(`Analysis failed: ${error.message}. Please try again with fewer images or check your API configuration.`);
          setIsAnalyzing(false);
          setAnalysisProgress(0);
          setCurrentAnalysisStep('');
          return;
        }

        setCurrentAnalysisStep('Generating comprehensive report...');

        // Generate combined report from all individual analyses
        const combinedAnalysis = geminiApiService.combineAnalysisResults(individualResults.map(r => r.analysis).filter(Boolean));
        const detailedReport = await geminiApiService.generateReport(combinedAnalysis || { fullReport: 'Analysis completed for individual images' }, userDetails);

        // Add individual results to the report
        detailedReport.individualAnalyses = individualResults;

        setAnalysisProgress(100);
        setCurrentAnalysisStep('Analysis complete');
        setGeminiReport(detailedReport);
        setActiveTab('report');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert(`Analysis failed: ${error.message}. Please check your API keys and try again.`);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setCurrentAnalysisStep('');
    }
  };

  const generateCompletePDF = async () => {
    if (!llavaReport) {
      alert('Please complete LLaVA analysis first');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      await pdfService.generateReport({
        ...llavaReport,
        userDetails
      });
      alert('✅ PDF report downloaded successfully!');
    } catch (error) {
      console.error('PDF error:', error);
      alert('❌ Error generating PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const lossTypeIcons = {
    property: Home,
    vehicle: Car,
    agricultural: TreePine,
    commercial: Factory,
    natural_disaster: Cloud
  };

  const LossTypeIcon = lossTypeIcons[metadata.lossType] || AlertCircle;

  const tabs = [
    { id: 'upload', label: 'Upload & Details', icon: Upload },
    { id: 'llava', label: 'LLaVA AI', icon: Brain },
    { id: 'gemini', label: 'Gemini AI', icon: Brain },
    { id: 'analysis', label: 'Image Analysis', icon: Layers },
    { id: 'report', label: 'Report', icon: FileText },
    { id: 'chat', label: 'AI Assistant', icon: MessageCircle }
  ];

  return (
    <div className="assessment-page">
      {/* Header */}
      <div className="assessment-header">
        <div className="header-content">
          <h1>
            <Brain size={36} />
            AI Damage Assessment
          </h1>
          <p>Powered by LLaVA Vision AI • Professional Insurance Documentation</p>
        </div>
        
        <div className="header-stats">
          <div className="stat">
            <CheckCircle size={20} />
            <span>Real AI Analysis</span>
          </div>
          <div className="stat">
            <FileText size={20} />
            <span>PDF Reports</span>
          </div>
          <div className="stat">
            <Users size={20} />
            <span>Insurance Ready</span>
          </div>
        </div>
      </div>

      {/* Incident Summary */}
      {metadata.lossType && (
        <div className="incident-summary">
          <div className="summary-header">
            <LossTypeIcon size={24} />
            <div>
              <h3>{metadata.lossType.replace('_', ' ').toUpperCase()} CLAIM</h3>
              <p>{metadata.incidentType} • {metadata.location || 'Location not specified'}</p>
            </div>
          </div>
          <div className="summary-details">
            <span>Images: {images.length}</span>
            <span>Status: {llavaReport ? 'Analyzed' : 'Pending'}</span>
            <span>Report: {llavaReport ? 'Ready' : 'Not generated'}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="assessment-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
              {tab.id === 'report' && llavaReport && (
                <span className="tab-badge">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="assessment-content">
        {/* Tab 1: Upload & Details */}
        {activeTab === 'upload' && (
          <div className="upload-tab">
            <div className="upload-section">
              <div className="section-header">
                <Upload size={28} />
                <div>
                  <h2>Upload Damage Images</h2>
                  <p>Upload clear photos from multiple angles</p>
                </div>
              </div>
              <ImageUploader 
                images={images} 
                onImagesChange={handleImagesChange}
              />
              
              {images.length > 0 && (
                <div className="upload-success">
                  <CheckCircle size={20} />
                  <span>{images.length} image(s) ready for analysis</span>
                </div>
              )}
            </div>

            <div className="details-section">
              <div className="section-header">
                <FileText size={28} />
                <div>
                  <h2>Incident Details</h2>
                  <p>Provide information about the loss</p>
                </div>
              </div>
              
              <MetadataForm 
                metadata={metadata}
                onMetadataChange={handleMetadataChange}
              />
              
              {/* User Details Form */}
              <div className="user-details-form">
                <h3>Claimant Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={userDetails.name}
                      onChange={(e) => handleUserDetailsChange('name', e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Number</label>
                    <input
                      type="tel"
                      value={userDetails.contact}
                      onChange={(e) => handleUserDetailsChange('contact', e.target.value)}
                      placeholder="Enter contact number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={userDetails.email}
                      onChange={(e) => handleUserDetailsChange('email', e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="form-group">
                    <label>Policy Number (Optional)</label>
                    <input
                      type="text"
                      value={userDetails.policyNumber}
                      onChange={(e) => handleUserDetailsChange('policyNumber', e.target.value)}
                      placeholder="Enter insurance policy number"
                    />
                  </div>
                </div>
              </div>
              
              <div className="next-step">
                <button
                  className="btn btn-primary"
                  onClick={handleDirectAnalysis}
                  disabled={images.length === 0 || !metadata.lossType || !metadata.aiModel || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="spinner-small"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain size={20} />
                      Generate Report
                    </>
                  )}
                </button>
                {isAnalyzing && (
                  <div className="analysis-progress">
                    <p>{currentAnalysisStep}</p>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${analysisProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {(!metadata.lossType || images.length === 0 || !metadata.aiModel) && !isAnalyzing && (
                  <p className="hint">Please upload images, select loss type, and choose AI model</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: LLaVA AI */}
        {activeTab === 'llava' && (
          <div className="llava-tab">
            <div className="tab-header">
              <Brain size={32} />
              <div>
                <h2>LLaVA AI Damage Analysis</h2>
                <p>Real image analysis using LLaVA 13B Vision Language Model</p>
              </div>
            </div>

            <LLaVAAnalysis
              images={images}
              metadata={metadata}
              userDetails={userDetails}
              onReportGenerated={handleLlavaReport}
            />
          </div>
        )}

        {/* Tab 3: Gemini AI */}
        {activeTab === 'gemini' && (
          <div className="gemini-tab">
            <div className="tab-header">
              <Brain size={32} />
              <div>
                <h2>Gemini AI Damage Analysis</h2>
                <p>Advanced image analysis using Google's Gemini Vision Model</p>
              </div>
            </div>

            <GeminiAnalysis
              images={images}
              metadata={metadata}
              userDetails={userDetails}
              onReportGenerated={handleGeminiReport}
            />
          </div>
        )}



        {/* Tab 5: Image Analysis */}
        {activeTab === 'analysis' && (
          <div className="analysis-tab">
            <div className="tab-header">
              <Layers size={32} />
              <div>
                <h2>Advanced Image Analysis</h2>
                <p>Detailed inspection and comparison tools</p>
              </div>
            </div>
            
            <ImageAnalysis 
              images={images}
              onAnalysisComplete={(index, analysis) => {
                console.log('Image analysis:', index, analysis);
              }}
            />
          </div>
        )}

        {/* Tab 6: Report */}
        {activeTab === 'report' && (
          <div className="report-tab">
            {(llavaReport || geminiReport) ? (
              <div className="report-container">
                <div className="report-header">
                  <div className="report-badge">
                    <CheckCircle size={24} />
                    <span>AI Analysis Complete</span>
                  </div>
                  <h2>Damage Assessment Report</h2>
                  <p>Ready for insurance submission</p>
                </div>

                {/* Report Content */}
                {llavaReport && (
                  <div className="report-content">
                    <div className="report-preview">
                      <div className="preview-header">
                        <h3>LLaVA AI Report Preview</h3>
                        <div className="preview-stats">
                          <span><FileText size={16} /> {images.length} images</span>
                          <span><Brain size={16} /> LLaVA AI Analysis</span>
                          <span><CheckCircle size={16} /> Insurance Ready</span>
                        </div>
                      </div>

                      <div className="preview-content">
                        {/* LLaVA Analysis Summary */}
                        <div className="section">
                          <h4>1. Incident Summary</h4>
                          <p><strong>Type:</strong> {metadata.lossType}</p>
                          <p><strong>Incident:</strong> {metadata.incidentType}</p>
                          <p><strong>Location:</strong> {metadata.location || 'Not specified'}</p>
                        </div>

                        <div className="section">
                          <h4>2. LLaVA AI Analysis Summary</h4>
                          <p>{llavaReport.llavaAnalysis?.summary || 'Analysis completed successfully'}</p>
                        </div>

                        <div className="section">
                          <h4>3. Severity Assessment</h4>
                          <p>{llavaReport.llavaAnalysis?.severity || 'Not specified'}</p>
                        </div>

                        <div className="section">
                          <h4>4. Estimated Cost</h4>
                          <p>{llavaReport.llavaAnalysis?.estimatedCost || 'Not specified'}</p>
                        </div>

                        <div className="section">
                          <h4>5. Safety Assessment</h4>
                          <p>{llavaReport.llavaAnalysis?.safety || 'Not specified'}</p>
                        </div>

                        {/* Individual Image Analyses */}
                        {llavaReport.llavaAnalysis?.detailedAnalyses && llavaReport.llavaAnalysis.detailedAnalyses.length > 0 && (
                          <div className="individual-analyses">
                            <h4>6. Individual Image Analyses</h4>
                            {llavaReport.llavaAnalysis.detailedAnalyses.map((analysis, index) => (
                              <div key={index} className="image-analysis-container">
                                <div className="image-analysis-header">
                                  <h5>Image {analysis.imageNumber}: {llavaReport.images[index]?.name || `Image ${analysis.imageNumber}`}</h5>
                                  <span className="analysis-status success">Analysis Complete</span>
                                </div>
                                <div className="analysis-details">
                                  <div className="analysis-content">
                                    {analysis.text.split('\n').map((line, lineIndex) => {
                                      if (line.startsWith('# ')) {
                                        return <h6 key={lineIndex}>{line.substring(2)}</h6>;
                                      } else if (line.startsWith('## ')) {
                                        return <h6 key={lineIndex} style={{fontSize: '14px'}}>{line.substring(3)}</h6>;
                                      } else if (line.startsWith('• ') || line.startsWith('- ')) {
                                        return <div key={lineIndex} style={{margin: '4px 0', paddingLeft: '16px', position: 'relative'}}>
                                          <span style={{position: 'absolute', left: '0'}}>•</span>{line.substring(2)}
                                        </div>;
                                      } else if (line.includes(':')) {
                                        const [label, value] = line.split(':');
                                        return (
                                          <div key={lineIndex} style={{margin: '6px 0'}}>
                                            <strong>{label}:</strong> {value}
                                          </div>
                                        );
                                      } else if (line.trim() === '') {
                                        return <br key={lineIndex} />;
                                      } else {
                                        return <p key={lineIndex} style={{margin: '4px 0'}}>{line}</p>;
                                      }
                                    })}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="section">
                          <h4>7. Recommendations</h4>
                          <p>{llavaReport.llavaAnalysis?.recommendations || 'Not specified'}</p>
                        </div>

                        <div className="section full-report">
                          <h4>8. Complete LLaVA Analysis Report</h4>
                          <div className="analysis-content">
                            {llavaReport.llavaAnalysis?.detailedAnalyses?.[0]?.text
                              .replace(/\*\*/g, '') // Remove bold markers
                              .replace(/^#+\s*/gm, '') // Remove header markers
                              .split('\n')
                              .filter(line => line.trim())
                              .map((line, index) => (
                                <p key={index}>{line.trim()}</p>
                              )) || 'Full analysis report not available'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="report-actions">
                      <button
                        className="btn btn-primary"
                        onClick={generateCompletePDF}
                        disabled={isGeneratingPDF}
                      >
                        {isGeneratingPDF ? (
                          <>
                            <div className="spinner-small"></div>
                            Generating PDF...
                          </>
                        ) : (
                          <>
                            <Download size={18} />
                            Download PDF Report
                          </>
                        )}
                      </button>

                      <div className="secondary-actions">
                        <button className="btn btn-secondary">
                          <FileText size={18} />
                          View Full Report
                        </button>
                        <button className="btn btn-secondary">
                          <MessageCircle size={18} />
                          Ask AI Questions
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setActiveTab('llava')}
                        >
                          <Brain size={18} />
                          Go to LLaVA Analysis
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setActiveTab('gemini')}
                        >
                          <Brain size={18} />
                          Go to Gemini Analysis
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {geminiReport && (
                  <div className="report-content">
                    <div className="report-preview">
                      <div className="preview-header">
                        <h3>Gemini AI Report Preview</h3>
                        <div className="preview-stats">
                          <span><FileText size={16} /> {images.length} images</span>
                          <span><Brain size={16} /> Gemini AI Analysis</span>
                          <span><CheckCircle size={16} /> Insurance Ready</span>
                        </div>
                      </div>

                      <div className="preview-content">
                        {/* Combined Analysis Summary */}
                        <div className="section">
                          <h4>1. Incident Summary</h4>
                          <p><strong>Type:</strong> {metadata.lossType}</p>
                          <p><strong>Incident:</strong> {metadata.incidentType}</p>
                          <p><strong>Location:</strong> {metadata.location || 'Not specified'}</p>
                        </div>

                        <div className="section">
                          <h4>2. Combined Damage Assessment</h4>
                          <p>{geminiReport.damageType || 'Not specified'}</p>
                        </div>

                        <div className="section">
                          <h4>3. Overall Severity Level</h4>
                          <p>{geminiReport.severityLevel || 'Not specified'}</p>
                        </div>

                        {/* Individual Image Analyses */}
                        {geminiReport.individualAnalyses && geminiReport.individualAnalyses.length > 0 && (
                          <div className="individual-analyses">
                            <h4>4. Individual Image Analyses</h4>
                            {geminiReport.individualAnalyses.map((analysis, index) => (
                              <div key={index} className="image-analysis-container">
                                <div className="image-analysis-header">
                                  <h5>Image {index + 1}: {analysis.imageName}</h5>
                                  {analysis.error ? (
                                    <span className="analysis-status error">Analysis Failed</span>
                                  ) : (
                                    <span className="analysis-status success">Analysis Complete</span>
                                  )}
                                </div>

                                {analysis.error ? (
                                  <div className="analysis-error">
                                    <p><strong>Error:</strong> {analysis.error}</p>
                                  </div>
                                ) : analysis.analysis ? (
                                  <div className="analysis-details">
                                    <div className="analysis-row">
                                      <strong>Damage Type:</strong> {analysis.analysis.damageType || 'Not detected'}
                                    </div>
                                    <div className="analysis-row">
                                      <strong>Severity:</strong> {analysis.analysis.severityLevel || 'Not assessed'}
                                    </div>
                                    <div className="analysis-row">
                                      <strong>Affected Areas:</strong> {analysis.analysis.affectedAreas || 'Not specified'}
                                    </div>
                                    <div className="analysis-row">
                                      <strong>Repair Needs:</strong> {analysis.analysis.repairRequirements || 'Not specified'}
                                    </div>
                                    <div className="analysis-row">
                                      <strong>Potential Causes:</strong> {analysis.analysis.potentialCauses || 'Not identified'}
                                    </div>
                                    <div className="analysis-row">
                                      <strong>Safety Concerns:</strong> {analysis.analysis.safetyConcerns || 'None identified'}
                                    </div>
                                    <div className="analysis-row">
                                      <strong>Recommendations:</strong> {analysis.analysis.immediateActions || 'None specified'}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="analysis-missing">
                                    <p>No analysis data available for this image.</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="section">
                          <h4>5. Overall Repair Requirements</h4>
                          <p>{geminiReport.repairRequirements || 'Not specified'}</p>
                        </div>

                        <div className="section">
                          <h4>6. Combined Safety Concerns</h4>
                          <p>{geminiReport.safetyConcerns || 'Not specified'}</p>
                        </div>

                        <div className="section">
                          <h4>7. Recommended Actions</h4>
                          <p>{geminiReport.immediateActions || 'Not specified'}</p>
                        </div>

                        <div className="section full-report">
                          <h4>8. Complete Combined Analysis</h4>
                          <div className="analysis-content">
                            {geminiReport.fullReport
                              .replace(/\*\*/g, '') // Remove bold markers
                              .replace(/^#+\s*/gm, '') // Remove header markers
                              .split('\n')
                              .filter(line => line.trim())
                              .map((line, index) => (
                                <p key={index}>{line.trim()}</p>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="report-actions">
                      <div className="secondary-actions">
                        <button className="btn btn-secondary">
                          <FileText size={18} />
                          View Full Report
                        </button>
                        <button className="btn btn-secondary">
                          <MessageCircle size={18} />
                          Ask AI Questions
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setActiveTab('llava')}
                        >
                          <Brain size={18} />
                          Go to LLaVA Analysis
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setActiveTab('gemini')}
                        >
                          <Brain size={18} />
                          Go to Gemini Analysis
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-report">
                <Brain size={64} />
                <h3>No Report Generated Yet</h3>
                <p>Complete AI analysis to generate your insurance report</p>
                <div className="analysis-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab('llava')}
                  >
                    <Brain size={20} />
                    Go to LLaVA Analysis
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setActiveTab('gemini')}
                  >
                    <Brain size={20} />
                    Go to Gemini Analysis
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 7: AI Assistant */}
        {activeTab === 'chat' && (
          <div className="chat-tab">
            <div className="tab-header">
              <MessageCircle size={32} />
              <div>
                <h2>AI Assistant</h2>
                <p>Get help with your report and claim process</p>
              </div>
            </div>
            
            <ChatbotInterface 
              images={images}
              metadata={metadata}
              generatedReport={llavaReport}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .assessment-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .assessment-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 40px;
          color: white;
          margin-bottom: 30px;
          position: relative;
          overflow: hidden;
        }

        .header-content h1 {
          font-size: 2.8rem;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-content p {
          font-size: 1.2rem;
          opacity: 0.9;
          max-width: 800px;
        }

        .header-stats {
          display: flex;
          gap: 30px;
          margin-top: 30px;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.1);
          padding: 12px 24px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .incident-summary {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .summary-header h3 {
          margin: 0;
          color: #1f2937;
        }

        .summary-header p {
          margin: 4px 0 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        .summary-details {
          display: flex;
          gap: 24px;
        }

        .summary-details span {
          padding: 6px 16px;
          background: #f3f4f6;
          border-radius: 20px;
          font-size: 14px;
          color: #4b5563;
        }

        .assessment-tabs {
          display: flex;
          background: white;
          border-radius: 16px;
          padding: 8px;
          margin-bottom: 30px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          overflow-x: auto;
        }

        .tab {
          flex: 1;
          min-width: 140px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 20px;
          border: none;
          background: transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          color: #6b7280;
          position: relative;
        }

        .tab:hover {
          background: #f9fafb;
          color: #1f2937;
        }

        .tab.active {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
          transform: translateY(-2px);
        }

        .tab-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #10b981;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .assessment-content {
          min-height: 600px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          padding: 40px;
          margin-bottom: 30px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        /* Upload Tab */
        .upload-tab {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        .upload-section, .details-section {
          background: #f9fafb;
          padding: 30px;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .section-header h2 {
          margin: 0;
          color: #1f2937;
        }

        .section-header p {
          margin: 4px 0 0 0;
          color: #6b7280;
        }

        .upload-success {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #d1fae5;
          border: 1px solid #10b981;
          border-radius: 12px;
          margin-top: 24px;
          color: #065f46;
          font-weight: 500;
        }

        .user-details-form {
          margin-top: 32px;
          padding-top: 32px;
          border-top: 2px solid #e5e7eb;
        }

        .user-details-form h3 {
          margin: 0 0 24px 0;
          color: #1f2937;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .next-step {
          margin-top: 32px;
          text-align: center;
        }

        .hint {
          margin-top: 12px;
          color: #6b7280;
          font-size: 14px;
        }

        /* Report Tab */
        .report-container {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }

        .report-header {
          padding: 40px;
          text-align: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          position: relative;
        }

        .report-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .report-header h2 {
          margin: 0 0 12px 0;
          font-size: 2.2rem;
        }

        .report-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 1.1rem;
        }

        .report-type-tabs {
          display: flex;
          background: #f9fafb;
          border-radius: 12px;
          padding: 8px;
          margin: 0 40px;
          border: 1px solid #e5e7eb;
        }

        .report-type-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 24px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          color: #6b7280;
        }

        .report-type-tab:hover {
          background: #f3f4f6;
          color: #1f2937;
        }

        .report-type-tab.active {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .report-content {
          margin-top: 20px;
        }

        .report-preview {
          padding: 40px;
          background: #fafbfc;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }

        .preview-header h3 {
          margin: 0;
          color: #1f2937;
        }

        .preview-stats {
          display: flex;
          gap: 20px;
        }

        .preview-stats span {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #6b7280;
        }

        .preview-content {
          background: white;
          border-radius: 12px;
          padding: 30px;
          border: 1px solid #e5e7eb;
        }

        .section {
          margin-bottom: 30px;
        }

        .section h4 {
          margin: 0 0 16px 0;
          color: #2563eb;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }

        .section p {
          margin: 8px 0;
          color: #4b5563;
          line-height: 1.6;
        }

        .section ul {
          margin: 16px 0;
          padding-left: 24px;
        }

        .section li {
          margin: 8px 0;
          color: #4b5563;
        }

        .report-actions {
          padding: 40px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          background: #f9fafb;
        }

        .secondary-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-top: 24px;
        }

        .no-report {
          text-align: center;
          padding: 80px 40px;
          color: #6b7280;
        }

        .no-report h3 {
          margin: 24px 0 16px 0;
          color: #1f2937;
        }

        .spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid #f3f4f6;
          border-top: 2px solid #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Tab Headers */
        .tab-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .tab-header h2 {
          margin: 0;
          color: #1f2937;
        }

        .tab-header p {
          margin: 4px 0 0 0;
          color: #6b7280;
        }

        /* Buttons */
        .btn {
          padding: 16px 32px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 16px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(37, 99, 235, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
          padding: 20px 40px;
          font-size: 18px;
        }

        @media (max-width: 1024px) {
          .upload-tab {
            grid-template-columns: 1fr;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .header-stats {
            flex-direction: column;
            gap: 16px;
          }
        }

        @media (max-width: 768px) {
          .assessment-header {
            padding: 30px 20px;
          }
          
          .header-content h1 {
            font-size: 2rem;
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
          
          .assessment-tabs {
            flex-direction: column;
          }
          
          .tab {
            flex-direction: row;
            justify-content: center;
            min-width: auto;
          }
          
          .incident-summary {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          
          .summary-details {
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .secondary-actions {
            flex-direction: column;
          }
          
          .preview-header {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
          
          .preview-stats {
            flex-direction: column;
            gap: 12px;
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Assessment;