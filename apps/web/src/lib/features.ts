export const features = {
  spatialBackdrop: import.meta.env.VITE_FEATURE_SPATIAL !== 'false',
  accounts: import.meta.env.VITE_FEATURE_ACCOUNTS !== 'false',
  streamingAi: import.meta.env.VITE_FEATURE_STREAMING_AI !== 'false',
  catalogueStudio: import.meta.env.DEV || import.meta.env.VITE_FEATURE_ADMIN === 'true'
} as const;
