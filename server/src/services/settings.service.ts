import { SettingsRepository } from '../repositories/settings.repository';
import { Settings } from '@prisma/client';

export class SettingsService {
  private settingsRepo = new SettingsRepository();

  async getAll(): Promise<Record<string, string>> {
    const list = await this.settingsRepo.findAll();
    const config: Record<string, string> = {};
    for (const item of list) {
      config[item.key] = item.value;
    }
    return config;
  }

  async update(config: Record<string, string>): Promise<void> {
    for (const key of Object.keys(config)) {
      await this.settingsRepo.upsert(key, config[key]);
    }
  }

  async getByKey(key: string): Promise<string | null> {
    const item = await this.settingsRepo.findByKey(key);
    return item ? item.value : null;
  }
}
export default SettingsService;
