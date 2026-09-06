export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const QUALITY_SCORE_LABELS = {
  excellent: { min: 85, max: 100, label: 'Excellent', color: '#10B981' },
  good:      { min: 70, max: 84,  label: 'Good',      color: '#6366F1' },
  fair:      { min: 50, max: 69,  label: 'Fair',      color: '#F59E0B' },
  poor:      { min: 0,  max: 49,  label: 'Poor',      color: '#EF4444' },
}

export const ACCEPTED_FILE_TYPES = {
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
}

export const MAX_FILE_SIZE_MB = 50
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export const DATASET_STATUS = {
  UPLOADED:   'uploaded',
  PROFILING:  'profiling',
  VALIDATING: 'validating',
  CLEANING:   'cleaning',
  COMPLETED:  'completed',
  ERROR:      'error',
}

export const PROCESSING_STEPS = [
  { id: 'upload',     label: 'Uploading' },
  { id: 'profile',    label: 'Profiling' },
  { id: 'validate',   label: 'Validating' },
  { id: 'anomaly',    label: 'Anomaly Detection' },
  { id: 'complete',   label: 'Complete' },
]
