import { PublicClientApplication, Configuration } from '@azure/msal-browser';

const tenantId = import.meta.env.VITE_AZURE_TENANT_ID as string;
const clientId = import.meta.env.VITE_AZURE_CLIENT_ID as string;

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority:   `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: window.location.origin,
  },
  cache: { cacheLocation: 'localStorage' }, // localStorage for PWA persistence
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'email', `api://${clientId}/attendance`],
};

export const msalInstance = new PublicClientApplication(msalConfig);
