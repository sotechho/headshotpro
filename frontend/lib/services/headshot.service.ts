import { api } from '../api';
import { IHeadshot, IHeadshotStyleInfo } from '../types/headshot';

export const headshotService = {
  getAvailableStyles: async (): Promise<IHeadshotStyleInfo[]> => {
    return api.get<IHeadshotStyleInfo[]>('/headshots/styles');
  },
  generateHeadshots: async (formData: FormData): Promise<IHeadshot> => {
    return api.post('/headshots/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
