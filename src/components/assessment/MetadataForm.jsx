import React from 'react'

const MetadataForm = ({ metadata, onMetadataChange }) => {
  const lossTypes = [
    { value: '', label: 'Select category' },
    { value: 'property', label: 'Property Damage' },
    { value: 'vehicle', label: 'Vehicle Damage' },
    { value: 'commercial', label: 'Commercial Loss' },
    { value: 'agricultural', label: 'Agricultural' },
    { value: 'natural_disaster', label: 'Natural Disaster' }
  ]

  const incidentTypes = {
    property: [
      { value: '', label: 'Select incident type' },
      { value: 'fire', label: 'Fire' },
      { value: 'flood', label: 'Flood' },
      { value: 'earthquake', label: 'Earthquake' },
      { value: 'theft', label: 'Theft' },
      { value: 'vandalism', label: 'Vandalism' },
      { value: 'storm', label: 'Storm' },
      { value: 'water_leakage', label: 'Water Leakage' }
    ],
    vehicle: [
      { value: '', label: 'Select incident type' },
      { value: 'collision', label: 'Collision' },
      { value: 'hail', label: 'Hail' },
      { value: 'flood', label: 'Flood' },
      { value: 'fire', label: 'Fire' },
      { value: 'theft', label: 'Theft' },
      { value: 'vandalism', label: 'Vandalism' },
      { value: 'natural_disaster', label: 'Natural Disaster' }
    ],
    commercial: [
      { value: '', label: 'Select incident type' },
      { value: 'fire', label: 'Fire' },
      { value: 'flood', label: 'Flood' },
      { value: 'equipment_breakdown', label: 'Equipment Breakdown' },
      { value: 'theft', label: 'Theft' },
      { value: 'vandalism', label: 'Vandalism' },
      { value: 'storm', label: 'Storm' }
    ],
    agricultural: [
      { value: '', label: 'Select incident type' },
      { value: 'crop_damage', label: 'Crop Damage' },
      { value: 'livestock', label: 'Livestock' },
      { value: 'equipment', label: 'Equipment Damage' },
      { value: 'drought', label: 'Drought' },
      { value: 'flood', label: 'Flood' },
      { value: 'storm', label: 'Storm' },
      { value: 'pest_infestation', label: 'Pest Infestation' }
    ],
    natural_disaster: [
      { value: '', label: 'Select incident type' },
      { value: 'hurricane', label: 'Hurricane' },
      { value: 'earthquake', label: 'Earthquake' },
      { value: 'flood', label: 'Flood' },
      { value: 'tornado', label: 'Tornado' },
      { value: 'cyclone', label: 'Cyclone' },
      { value: 'landslide', label: 'Landslide' },
      { value: 'tsunami', label: 'Tsunami' }
    ]
  }

  const handleChange = (field, value) => {
    onMetadataChange({
      ...metadata,
      [field]: value
    })
  }

  const getIncidentTypes = () => {
    return incidentTypes[metadata.lossType] || [{ value: '', label: 'Select category first' }]
  }

  return (
    <div>
      <div className="form-group">
        <label className="form-label">Loss Category *</label>
        <select
          className="form-select"
          value={metadata.lossType}
          onChange={(e) => handleChange('lossType', e.target.value)}
        >
          {lossTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Incident Type *</label>
        <select
          className="form-select"
          value={metadata.incidentType}
          onChange={(e) => handleChange('incidentType', e.target.value)}
          disabled={!metadata.lossType}
        >
          {getIncidentTypes().map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">AI Analysis Model *</label>
        <select
          className="form-select"
          value={metadata.aiModel || ''}
          onChange={(e) => handleChange('aiModel', e.target.value)}
        >
          <option value="">Select AI model</option>
          <option value="llava">LLaVA AI</option>
          <option value="gemini">Gemini AI</option>
        </select>
        <div className="form-hint">
          Choose the AI model for damage analysis. LLaVA uses vision-language models, Gemini uses Google's advanced AI.
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Location</label>
        <input
          type="text"
          className="form-input"
          placeholder="Enter location (city, state)"
          value={metadata.location}
          onChange={(e) => handleChange('location', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Date of Incident</label>
        <input
          type="date"
          className="form-input"
          value={metadata.date}
          onChange={(e) => handleChange('date', e.target.value)}
        />
      </div>

      {/* Vehicle Specific Fields */}
      {metadata.lossType === 'vehicle' && (
        <>
          <div className="form-group">
            <label className="form-label">Vehicle Make</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Maruti, Hyundai, Toyota, Honda"
              value={metadata.vehicleMake}
              onChange={(e) => handleChange('vehicleMake', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Vehicle Model</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Swift, i20, Innova, City"
              value={metadata.vehicleModel}
              onChange={(e) => handleChange('vehicleModel', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Vehicle Year</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g., 2022"
              min="1990"
              max="2025"
              value={metadata.vehicleYear}
              onChange={(e) => handleChange('vehicleYear', e.target.value)}
            />
          </div>
        </>
      )}

      {/* Agricultural Specific Fields */}
      {metadata.lossType === 'agricultural' && (
        <>
          <div className="form-group">
            <label className="form-label">Crop Type</label>
            <select
              className="form-select"
              value={metadata.cropType}
              onChange={(e) => handleChange('cropType', e.target.value)}
            >
              <option value="">Select crop type</option>
              <option value="paddy">Paddy/Rice</option>
              <option value="wheat">Wheat</option>
              <option value="corn">Corn/Maize</option>
              <option value="cotton">Cotton</option>
              <option value="sugarcane">Sugarcane</option>
              <option value="soybean">Soybean</option>
              <option value="pulses">Pulses</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Estimated Area (acres)</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g., 5"
              min="0"
              step="0.1"
              value={metadata.estimatedArea}
              onChange={(e) => handleChange('estimatedArea', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Crop Stage</label>
            <select
              className="form-select"
              value={metadata.cropStage}
              onChange={(e) => handleChange('cropStage', e.target.value)}
            >
              <option value="">Select crop stage</option>
              <option value="sowing">Sowing</option>
              <option value="germination">Germination</option>
              <option value="vegetative">Vegetative Growth</option>
              <option value="flowering">Flowering</option>
              <option value="fruiting">Fruiting</option>
              <option value="harvest">Ready for Harvest</option>
            </select>
          </div>
        </>
      )}

      {/* Commercial Specific Fields */}
      {metadata.lossType === 'commercial' && (
        <>
          <div className="form-group">
            <label className="form-label">Business Type</label>
            <select
              className="form-select"
              value={metadata.businessType}
              onChange={(e) => handleChange('businessType', e.target.value)}
            >
              <option value="">Select business type</option>
              <option value="retail">Retail Store</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="warehouse">Warehouse</option>
              <option value="office">Office</option>
              <option value="restaurant">Restaurant</option>
              <option value="hotel">Hotel</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Business Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter business name"
              value={metadata.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
            />
          </div>
        </>
      )}

      {/* Property Specific Fields */}
      {metadata.lossType === 'property' && (
        <>
          <div className="form-group">
            <label className="form-label">Property Type</label>
            <select
              className="form-select"
              value={metadata.propertyType}
              onChange={(e) => handleChange('propertyType', e.target.value)}
            >
              <option value="">Select property type</option>
              <option value="residential_house">Residential House</option>
              <option value="apartment">Apartment</option>
              <option value="commercial_building">Commercial Building</option>
              <option value="farmhouse">Farmhouse</option>
              <option value="vacation_home">Vacation Home</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Area Affected (sq. ft.)</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g., 500"
              min="0"
              value={metadata.areaAffected}
              onChange={(e) => handleChange('areaAffected', e.target.value)}
            />
          </div>
        </>
      )}

      {/* Natural Disaster Specific Fields */}
      {metadata.lossType === 'natural_disaster' && (
        <>
          <div className="form-group">
            <label className="form-label">Scale of Damage</label>
            <select
              className="form-select"
              value={metadata.damageScale}
              onChange={(e) => handleChange('damageScale', e.target.value)}
            >
              <option value="">Select damage scale</option>
              <option value="localized">Localized (Single Property)</option>
              <option value="community">Community Level</option>
              <option value="regional">Regional Level</option>
              <option value="widespread">Widespread</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Number of Properties Affected</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g., 1"
              min="1"
              value={metadata.propertiesAffected}
              onChange={(e) => handleChange('propertiesAffected', e.target.value)}
            />
          </div>
        </>
      )}

      <div className="form-group">
        <label className="form-label">Short Description</label>
        <textarea
          className="form-textarea"
          placeholder="Briefly describe what happened, circumstances, and immediate impact..."
          value={metadata.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows="4"
        />
        <div className="form-hint">
          Please provide details about how the incident occurred, time of day, weather conditions, and immediate effects.
        </div>
      </div>

      <style jsx>{`
        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: var(--text-primary);
          font-size: 14px;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          font-size: 14px;
          transition: all 0.2s ease;
          background: white;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .form-select:disabled {
          background-color: #f8fafc;
          color: var(--text-secondary);
          cursor: not-allowed;
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
          font-family: inherit;
        }

        .form-hint {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 6px;
          font-style: italic;
        }

        /* Conditional fields animation */
        .form-group {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .form-input,
          .form-select,
          .form-textarea {
            padding: 10px 12px;
          }
        }
      `}</style>
    </div>
  )
}

export default MetadataForm