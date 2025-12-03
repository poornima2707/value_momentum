// LLaVA Configuration
export const LLAVA_CONFIG = {
  // API Configuration
  API: {
    KEY: import.meta.env.VITE_LLAVA_API_KEY,
    BASE_URL: import.meta.env.VITE_LLAVA_BASE_URL || 'https://api.openai.com/v1',
    MODEL: 'gpt-4-vision-preview', // For LLaVA-compatible API
    MAX_TOKENS: 4000,
    TEMPERATURE: 0.1
  },

  // Analysis types
  ANALYSIS_TYPES: {
    DAMAGE: 'damage_assessment',
    SEVERITY: 'severity_analysis',
    ESTIMATE: 'cost_estimation',
    SAFETY: 'safety_assessment',
    CAUSE: 'cause_analysis'
  },

  // Prompt templates
  PROMPTS: {
    DAMAGE_ANALYSIS: `Analyze this image for {lossType} damage caused by {incidentType}. 
    Provide detailed observations of visible damage, affected components, and severity assessment.`,
    
    SEVERITY_ASSESSMENT: `Assess the severity of damage in this image on a scale of 1-10.
    1-3: Minor/Superficial
    4-6: Moderate/Repairable
    7-8: Severe/Extensive
    9-10: Critical/Total Loss`,
    
    COST_ESTIMATION: `Based on the visible damage, provide a cost estimation range for repairs.
    Consider:
    - Material costs
    - Labor requirements
    - Specialized equipment needed
    - Timeframe for completion`,
    
    SAFETY_CHECK: `Identify any immediate safety hazards in this image.
    Consider:
    - Structural integrity issues
    - Electrical hazards
    - Chemical/environmental risks
    - Fire hazards
    - Other safety concerns`
  },

  // Response formats
  FORMATS: {
    JSON: 'json',
    MARKDOWN: 'markdown',
    TEXT: 'text',
    HTML: 'html'
  },

  // Error messages
  ERRORS: {
    NO_IMAGES: 'Please upload at least one image for analysis',
    INVALID_IMAGE: 'Invalid image format. Please upload JPEG, PNG, or WebP images',
    API_ERROR: 'Unable to connect to LLaVA service. Please try again',
    TIMEOUT: 'Analysis timeout. Please try with fewer images',
    QUOTA_EXCEEDED: 'API quota exceeded. Please try again later'
  }
};