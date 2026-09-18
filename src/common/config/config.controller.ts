import { Controller, Get } from '@nestjs/common';
import { LMSConfigSingleton } from './lms-config.singleton';

@Controller('system-config')
export class ConfigController {
  @Get()
  getConfig() {
    const configInstance = LMSConfigSingleton.getInstance();
    return configInstance.getConfig();
  }
}
