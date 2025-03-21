/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ICONIK_APP_ID: string
  readonly VITE_ICONIK_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
