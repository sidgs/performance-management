/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AGENT_API_URL?: string;
  readonly VITE_WIDGET_MODE?: string;
  readonly DEV?: boolean;
  readonly MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

