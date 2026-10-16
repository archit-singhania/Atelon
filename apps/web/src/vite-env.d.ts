/// <reference types="vite/client" />
declare module 'virtual:pwa-register' { export function registerSW(options?: { onNeedRefresh?: () => void; onOfflineReady?: () => void; onRegisteredSW?: (url: string, registration?: ServiceWorkerRegistration) => void }): (reloadPage?: boolean) => Promise<void>; }
