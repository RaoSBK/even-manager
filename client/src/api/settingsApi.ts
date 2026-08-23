import { httpClient } from './httpClient';

export const settingsApi = {
  getAll: () =>
    httpClient.get<Record<string, string>>('/settings'),

  update: (config: Record<string, string>) =>
    httpClient.post<{ message: string }>('/settings', config)
};
