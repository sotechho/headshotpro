const HEADSHOT_BASE =
  "photorealistic headshot, preserve the person's identity and facial characteristics, realistic skin texture, natural facial proportions, sharp detailed eyes, natural skin tones, head and shoulders framing, centered composition, professional photography, no distortion, no artificial-looking skin";

export const HEADSHOT_STYLES = {
  professional: {
    name: 'Professional',
    description: 'Clean, corporate headshot with neutral background',
    prompt: `${HEADSHOT_BASE}, business attire, neutral studio background, soft balanced studio lighting, polished corporate appearance, subtle confident expression`,
    key: 'professional',
  },

  casual: {
    name: 'Casual',
    description: 'Relaxed, friendly headshot with soft lighting',
    prompt: `${HEADSHOT_BASE}, smart-casual clothing, relaxed friendly expression, genuine natural smile, soft natural daylight, subtle outdoor background, gentle background blur`,
    key: 'casual',
  },

  creative: {
    name: 'Creative',
    description: 'Artistic headshot with creative elements',
    prompt: `${HEADSHOT_BASE}, stylish contemporary clothing, artistic editorial styling, colorful but tasteful background, dramatic cinematic lighting, expressive confident pose`,
    key: 'creative',
  },

  executive: {
    name: 'Executive',
    description: 'High-end executive portrait',
    prompt: `${HEADSHOT_BASE}, tailored formal business suit, sophisticated modern office background, premium studio lighting, composed confident expression, refined executive appearance`,
    key: 'executive',
  },

  linkedin: {
    name: 'LinkedIn',
    description: 'Perfect for LinkedIn profiles',
    prompt: `${HEADSHOT_BASE}, professional business attire, clean minimal background, approachable natural smile, soft flattering lighting, trustworthy and confident appearance`,
    key: 'linkedin',
  },
} as const;
