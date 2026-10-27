export const features = {
  spatialBackdrop: import.meta.env.VITE_FEATURE_SPATIAL !== 'false',
  accounts: import.meta.env.VITE_FEATURE_ACCOUNTS !== 'false',
  garageSync: import.meta.env.VITE_FEATURE_GARAGE_SYNC === 'true',
  accountDeletion: import.meta.env.VITE_FEATURE_ACCOUNT_DELETION === 'true',
  collectionSharing: import.meta.env.VITE_FEATURE_COLLECTION_SHARING === 'true',
  collectionSync: import.meta.env.VITE_FEATURE_COLLECTION_SYNC === 'true',
  streamingAi: import.meta.env.VITE_FEATURE_STREAMING_AI !== 'false',
  catalogueStudio: import.meta.env.DEV || import.meta.env.VITE_FEATURE_ADMIN === 'true'
} as const;
