import PublicClientApplication, {MSALConfiguration} from 'react-native-msal';
import MsalConfig from '../../android/app/src/main/assets/msal_config.json';
import {
  loadAzureConfig,
  removeAzureConfig,
  storeAzureConfig,
} from './oauthConfigStore';

const AZURE_CLIENT_ID = MsalConfig.client_id;
// const scope = `api://${AZURE_CLIENT_ID}/authorize`;
const scopes = ['openid', 'profile', 'email', 'user.read'];
const azureConfig = {
  auth: {
    clientId: AZURE_CLIENT_ID,
    redirectUri: MsalConfig.redirect_uri,
    authority: MsalConfig.authorities,
  },
  cache: {
    cacheLocation: 'sessionStorage', // or "localStorage"
    storeAuthStateInCookie: true, // recommended for IE11 or older browsers
  },
  system: {
    allowRedirectInIframe: true, // for embedded experiences
  },
};
const pca = new PublicClientApplication(azureConfig, false);

export default class Oauth {
  static needAzureTokenRefresh() {
    // Token was acquired?
    if (global.azureTokenExpirationDate) {
      // Token has expired?
      if (new Date().getTime() > global.azureTokenExpirationDate) {
        return true;
      }
      return false;
    }
    return true;
  }

  static async signInInteractively() {
    const params = {
      scopes,
    };

    try {
      await pca.init();

      const result = await pca.acquireToken(params);
      await storeAzureConfig(result);

      console.log(`signInInteractively: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      console.log(`signInInteractively: ${error}`);
      return false;
    }
  }

  static async signInSilently() {
    if (!global.azureAccount) {
      await loadAzureConfig();

      if (!global.azureAccount) {
        console.log('signInSilently: No Azure account was acquired!');
        return false;
      }
    }
    const params = {
      scopes,
      account: global.azureAccount,
      // forceRefresh: true,
    };

    try {
      await pca.init();
      const result = await pca.acquireTokenSilent(params);
      await storeAzureConfig(result);
      console.log(`signInSilently: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      console.log(`signInSilently`, error);
      return false;
    }
  }

  static async signOut() {
    if (!global.azureAccount) {
      await loadAzureConfig();

      if (!global.azureAccount) {
        console.log('signOut: No Azure account was acquired!');
        return false;
      }
    }

    const params = {
      account: global.azureAccount,
      signoutFromBrowser: true,
    };

    try {
      await pca.init();
      const result = await pca.signOut(params);
      console.log(`signOut: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      console.log(`signOut: ${error}`);
      return false;
    } finally {
      removeAzureConfig();
    }
  }
}
