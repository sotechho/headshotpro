import { HEADSHOT_STYLES } from '@/constants';
export type HeadshotStyle = keyof typeof HEADSHOT_STYLES;

class HeadshotService {
  getAvailableStyles(): { name: string; key: string; description: string }[] {
    const styles = (Object.keys(HEADSHOT_STYLES) as HeadshotStyle[]).map(
      (key) => ({
        ...HEADSHOT_STYLES[key],
        prompt: undefined,
      }),
    );
    return styles;
  }
}

export const headshotService = new HeadshotService();
