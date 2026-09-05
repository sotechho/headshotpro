import { api } from '../api';

export const headshotService = {
  getAvailableStyles: async (): Promise<IHeadshotStyleInfo[]> => {
    return api.get<IHeadshotStyleInfo[]>('/headshots/styles');
  },
};
