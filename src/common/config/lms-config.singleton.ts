export class LMSConfigSingleton {
  private static instance: LMSConfigSingleton;

  private config = {
    appName: 'LMS Platform API',
    maxVideoUploadMB: 500,
    allowGuestBrowsing: true,
  };

  private constructor() {}

  public static getInstance(): LMSConfigSingleton {
    if (!LMSConfigSingleton.instance) {
      LMSConfigSingleton.instance = new LMSConfigSingleton();
    }
    return LMSConfigSingleton.instance;
  }

  public getConfig() {
    return this.config;
  }
}
