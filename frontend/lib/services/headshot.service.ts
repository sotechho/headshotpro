import { api } from '../api';
import {
  IHeadshot,
  IHeadshotsResponse,
  IHeadshotStyleInfo,
} from '../types/headshot';

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
  getHeadshots: async (
    limit: number = 10,
    offset: number = 0,
  ): Promise<IHeadshotsResponse> => {
    return api.get<IHeadshotsResponse>(
      `/headshots?limit=${limit}&offset=${offset}`,
    );
  },
};
