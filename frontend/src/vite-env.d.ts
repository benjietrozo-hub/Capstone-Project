/// <reference types="vite/client" />

// Global window extensions
declare global {
  interface Window {
    __LOGGING_OUT__?: boolean;
  }
}

export {};
