import { AI_PROVIDERS, type AIProvider } from '@/constants/ai.constants';
import { replicateService } from './replicate/replicate.service';
import { AppError } from '@/utils/errors';
import { config } from '@/config';

export function aiService(
  provider: AIProvider = config.aiProvider as AIProvider,
) {
  if (!Object.values(AI_PROVIDERS).includes(provider)) {
    throw new AppError(
      500,
      'AI_PROVIDER_SELECTION',
      `Unsupported AI provider: ${provider}`,
    );
  }
  const providers = {
    [AI_PROVIDERS.REPLICATE]: replicateService,
    [AI_PROVIDERS.OPENAI]: null,
    [AI_PROVIDERS.OPENROUTER]: null,
    [AI_PROVIDERS.GEMINI]: null,
  };
  return providers[provider];
}
