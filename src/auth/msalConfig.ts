// Mock auth — יוחלף ב-Azure AD כשתהיה גישה לפורטל
export const msalInstance = {
  getAllAccounts: () => [],
  acquireTokenSilent: async () => ({ accessToken: 'mock-token' }),
  loginPopup: async () => {},
  logoutPopup: async () => {},
  initialize: async () => {},
};

export const loginRequest = { scopes: [] };
