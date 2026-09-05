import Replicate from 'replicate';
import { BaseAI } from '../ai.base';
import { config } from '@/config';
import logger from '@/utils/logger';
import { AppError } from '@/utils/errors';

class ReplicateService extends BaseAI {
  private replicate: Replicate;
  constructor() {
    super();
    if (!config.replicate.apiKey) {
      logger.warn('Replicate configuration is missing');
      throw new AppError(
        500,
        'REPLICATE_INIT_ERROR',
        'Failed to initialize replicate',
      );
    }
    this.replicate = new Replicate({
      auth: config.replicate.apiKey,
    });
  }

  override async generateImage(
    _imgUrl: string,
    prompt: string,
  ): Promise<string> {
    const input = {
      prompt,
      resolution: '1K',
      image_input: [_imgUrl],
      aspect_ratio: '1:1',
      output_format: 'png',
      safety_filter_level: 'block_only_high',
      allow_fallback_model: false,
    };
    const output: any = await this.replicate.run('google/nano-banana-pro', {
      input,
    });
    return output.url();
  }
}

export const replicateService = new ReplicateService();
