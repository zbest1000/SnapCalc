declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }

  interface Navigator {
    mediaDevices: MediaDevices;
  }
}

declare module 'tesseract.js' {
  export interface Worker {
    recognize(image: string | File): Promise<{ data: { text: string; confidence: number } }>;
    setParameters(params: Record<string, any>): Promise<void>;
    terminate(): Promise<void>;
  }

  export const PSM: {
    SINGLE_BLOCK: number;
    SINGLE_COLUMN: number;
    SINGLE_TEXTLINE: number;
    SINGLE_WORD: number;
    SINGLE_CHAR: number;
  };

  export function createWorker(
    language: string,
    oem?: number,
    options?: { logger?: (progress: any) => void }
  ): Promise<Worker>;
}

export {};