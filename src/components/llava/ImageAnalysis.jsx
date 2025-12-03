import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Grid,
  ZoomIn,
  Contrast,
  Ruler,
  Palette,
  Layers,
  Hash
} from 'lucide-react';

const ImageAnalysis = ({ images, onAnalysisComplete }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [analysis, setAnalysis] = useState({});
  const [activeTool, setActiveTool] = useState('overview');
  const [annotations, setAnnotations] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);

  // Analysis tools
  const tools = [
    { id: 'overview', label: 'Overview', icon: Grid },
    { id: 'zoom', label: 'Zoom', icon: ZoomIn },
    { id: 'contrast', label: 'Contrast', icon: Contrast },
    { id: 'measure', label: 'Measure', icon: Ruler },
    { id: 'color', label: 'Color', icon: Palette },
    { id: 'layers', label: 'Layers', icon: Layers }
  ];

  useEffect(() => {
    if (images.length > 0 && !selectedImage) {
      setSelectedImage(0);
      analyzeImage(0);
    }
  }, [images]);

  const analyzeImage = async (index) => {
    const image = images[index];
    
    // Simulate image analysis (in real app, this would use Qwen)
    const analysis = {
      dimensions: await getImageDimensions(image),
      colors: await analyzeColors(image),
      features: await detectFeatures(image),
      quality: await assessQuality(image),
      metadata: await extractMetadata(image)
    };

    setAnalysis(prev => ({
      ...prev,
      [index]: analysis
    }));

    if (onAnalysisComplete) {
      onAnalysisComplete(index, analysis);
    }
  };

  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: (img.width / img.height).toFixed(2),
          megapixels: ((img.width * img.height) / 1000000).toFixed(2)
        });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const analyzeColors = async (file) => {
    // Simplified color analysis
    return {
      dominantColors: ['#667eea', '#764ba2', '#f56565'],
      brightness: 'Medium',
      contrast: 'Good',
      saturation: 'Normal'
    };
  };

  const detectFeatures = async (file) => {
    // Simplified feature detection
    return {
      edges: 'Detected',
      textures: 'Varied',
      patterns: 'Visible',
      objects: 'Multiple'
    };
  };

  const assessQuality = async (file) => {
    return {
      resolution: 'High',
      sharpness: 'Good',
      noise: 'Low',
      compression: 'Minimal'
    };
  };

  const extractMetadata = async (file) => {
    return {
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type,
      lastModified: new Date(file.lastModified).toLocaleDateString()
    };
  };

  const addAnnotation = (type, data) => {
    setAnnotations(prev => [...prev, {
      id: Date.now(),
      type,
      data,
      imageIndex: selectedImage,
      timestamp: new Date()
    }]);
  };

  const renderAnalysisPanel = () => {
    const currentAnalysis = analysis[selectedImage];
    if (!currentAnalysis) return null;

    switch (activeTool) {
      case 'overview':
        return <OverviewPanel analysis={currentAnalysis} />;
      case 'measure':
        return <MeasurePanel onMeasure={addAnnotation} />;
      case 'color':
        return <ColorPanel colors={currentAnalysis.colors} />;
      case 'layers':
        return <LayersPanel annotations={annotations} />;
      default:
        return <div>Select a tool to start analysis</div>;
    }
  };

  return (
    <div className="image-analysis-container">
      {/* Header */}
      <div className="analysis-header">
        <h3>
          <ImageIcon size={24} />
          Image Analysis
        </h3>
        <div className="image-counter">
          <Hash size={16} />
          <span>{selectedImage !== null ? `${selectedImage + 1} / ${images.length}` : 'No images'}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="analysis-main">
        {/* Image Grid */}
        <div className="image-grid">
          {images.map((image, index) => (
            <div
              key={index}
              className={`image-thumbnail ${selectedImage === index ? 'selected' : ''}`}
              onClick={() => {
                setSelectedImage(index);
                analyzeImage(index);
              }}
            >
              <img
                src={URL.createObjectURL(image)}
                alt={`Damage ${index + 1}`}
              />
              <div className="image-overlay">
                <span>Image {index + 1}</span>
                {analysis[index] && (
                  <div className="image-stats">
                    <span>{analysis[index].dimensions?.megapixels}MP</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Image Display */}
        {selectedImage !== null && (
          <div className="selected-image-container">
            <div className="image-display">
              <img
                src={URL.createObjectURL(images[selectedImage])}
                alt="Selected damage"
              />
              {/* Annotations overlay */}
              {annotations
                .filter(ann => ann.imageIndex === selectedImage)
                .map(ann => (
                  <div
                    key={ann.id}
                    className="annotation"
                    style={ann.data.position}
                  >
                    {ann.data.label}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tools */}
        <div className="analysis-tools">
          <div className="tool-buttons">
            {tools.map(tool => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
                  onClick={() => setActiveTool(tool.id)}
                >
                  <Icon size={20} />
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>

          {/* Analysis Panel */}
          <div className="analysis-panel">
            {renderAnalysisPanel()}
          </div>
        </div>
      </div>

      {/* Comparison Mode */}
      {images.length >= 2 && (
        <div className="comparison-controls">
          <label>
            <input
              type="checkbox"
              checked={comparisonMode}
              onChange={(e) => setComparisonMode(e.target.checked)}
            />
            Enable Comparison Mode
          </label>
          {comparisonMode && (
            <div className="comparison-slider">
              <span>Before</span>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="50"
                className="slider"
              />
              <span>After</span>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .image-analysis-container {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .analysis-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .analysis-header h3 {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-primary);
        }

        .image-counter {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .analysis-main {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          gap: 24px;
          height: 400px;
        }

        .image-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .image-thumbnail {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s ease;
          aspect-ratio: 1;
        }

        .image-thumbnail:hover {
          border-color: var(--primary-color);
          transform: scale(1.02);
        }

        .image-thumbnail.selected {
          border-color: var(--primary-color);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        .image-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          color: white;
          padding: 8px;
          font-size: 11px;
          display: flex;
          justify-content: space-between;
        }

        .selected-image-container {
          border-radius: 8px;
          overflow: hidden;
          background: #f8fafc;
          border: 1px solid var(--border-color);
        }

        .image-display {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-display img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .annotation {
          position: absolute;
          background: rgba(37, 99, 235, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          pointer-events: none;
        }

        .analysis-tools {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .tool-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .tool-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px 8px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
        }

        .tool-btn:hover {
          border-color: var(--primary-color);
          background: #f0f9ff;
        }

        .tool-btn.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .analysis-panel {
          flex: 1;
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          overflow-y: auto;
          border: 1px solid var(--border-color);
        }

        .comparison-controls {
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .comparison-controls label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          cursor: pointer;
        }

        .comparison-slider {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .slider {
          flex: 1;
          height: 6px;
          border-radius: 3px;
          background: #e2e8f0;
          outline: none;
          -webkit-appearance: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--primary-color);
          cursor: pointer;
        }

        @media (max-width: 1024px) {
          .analysis-main {
            grid-template-columns: 1fr;
            height: auto;
          }
          
          .image-grid {
            max-height: 200px;
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 768px) {
          .tool-buttons {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .image-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

// Sub-components for different analysis panels
const OverviewPanel = ({ analysis }) => (
  <div className="overview-panel">
    <h4>Image Analysis</h4>
    <div className="stats-grid">
      <div className="stat">
        <span className="stat-label">Dimensions</span>
        <span className="stat-value">
          {analysis.dimensions?.width} × {analysis.dimensions?.height}
        </span>
      </div>
      <div className="stat">
        <span className="stat-label">Megapixels</span>
        <span className="stat-value">{analysis.dimensions?.megapixels} MP</span>
      </div>
      <div className="stat">
        <span className="stat-label">Aspect Ratio</span>
        <span className="stat-value">{analysis.dimensions?.aspectRatio}</span>
      </div>
      <div className="stat">
        <span className="stat-label">File Size</span>
        <span className="stat-value">{analysis.metadata?.size}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Brightness</span>
        <span className="stat-value">{analysis.colors?.brightness}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Contrast</span>
        <span className="stat-value">{analysis.colors?.contrast}</span>
      </div>
    </div>
  </div>
);

const MeasurePanel = ({ onMeasure }) => (
  <div className="measure-panel">
    <h4>Measurement Tools</h4>
    <div className="measure-buttons">
      <button onClick={() => onMeasure('distance', { label: 'Distance' })}>
        Measure Distance
      </button>
      <button onClick={() => onMeasure('area', { label: 'Area' })}>
        Measure Area
      </button>
      <button onClick={() => onMeasure('angle', { label: 'Angle' })}>
        Measure Angle
      </button>
    </div>
  </div>
);

const ColorPanel = ({ colors }) => (
  <div className="color-panel">
    <h4>Color Analysis</h4>
    <div className="color-swatches">
      {colors?.dominantColors?.map((color, index) => (
        <div
          key={index}
          className="color-swatch"
          style={{ backgroundColor: color }}
        >
          <span>{color}</span>
        </div>
      ))}
    </div>
  </div>
);

const LayersPanel = ({ annotations }) => (
  <div className="layers-panel">
    <h4>Annotations ({annotations.length})</h4>
    <div className="annotations-list">
      {annotations.map(ann => (
        <div key={ann.id} className="annotation-item">
          <span className="annotation-type">{ann.type}</span>
          <span className="annotation-time">
            {ann.timestamp.toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default ImageAnalysis;