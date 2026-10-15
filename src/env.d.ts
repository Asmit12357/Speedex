/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PREDICTION_API_URL?: string;
  readonly VITE_TURN_CREDS_URL?: string;
  readonly VITE_TURN_SERVER_URI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
