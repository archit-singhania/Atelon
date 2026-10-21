/// <reference types="vite/client" />
declare module 'virtual:pwa-register' { export function registerSW(options?: { onNeedRefresh?: () => void; onOfflineReady?: () => void; onRegisteredSW?: (url: string, registration?: ServiceWorkerRegistration) => void }): (reloadPage?: boolean) => Promise<void>; }
interface ImportMetaEnv { readonly VITE_API_URL?: string; readonly VITE_SUPABASE_URL?: string; readonly VITE_SUPABASE_ANON_KEY?: string }
