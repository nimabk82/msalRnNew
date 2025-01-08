import MSALClient, {
  MSALResult,
  MSALAccount,
  MSALConfiguration,
} from 'react-native-msal';
import {MSALConfig} from '../config/authConfig';

class MSALService {
  private static instance: MSALService;
  private msalClient: MSALClient | null = null;

  private config: MSALConfiguration = {
    auth: MSALConfig.auth,
  };

  private constructor() {}

  public static getInstance(): MSALService {
    if (!MSALService.instance) {
      MSALService.instance = new MSALService();
    }
    return MSALService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      this.msalClient = new MSALClient(this.config);
      await this.msalClient.init();
    } catch (error) {
      console.error('Failed to initialize MSAL:', error);
      throw error;
    }
  }

  public async signIn(): Promise<MSALResult> {
    if (!this.msalClient) {
      throw new Error('MSAL client not initialized');
    }

    try {
      const result = await this.msalClient.acquireToken({
        scopes: ['User.Read'], // Add your required scopes
      });
      return result;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  }

  public async signOut(account: MSALAccount): Promise<boolean> {
    if (!this.msalClient) {
      throw new Error('MSAL client not initialized');
    }

    try {
      return await this.msalClient.signOut({account});
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }
}

export default MSALService;
