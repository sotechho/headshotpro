export enum HeadshotStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export type GeneratedResponse = {
  style: string;
  url: string;
  success: boolean;
};

export type PersistedHeadshot = {
  style: string;
  key: string;
  url: string;
};

export type GenerationJob = {
  style: string;
  prompt: string;
};
