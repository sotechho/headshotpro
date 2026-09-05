export const AI_PROVIDERS = {
  REPLICATE: 'replicate',
  OPENAI: 'openai',
  OPENROUTER: 'openrouter',
  GEMINI: 'gemini',
} as const;

export type AIProvider = (typeof AI_PROVIDERS)[keyof typeof AI_PROVIDERS];
