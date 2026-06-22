const ACCESS_TOKEN_KEY = "accessToken";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAccessTokenFromStorage() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessTokenToStorage(accessToken: string) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function removeAccessTokenFromStorage() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getAccessTokenFromState(state: {
  auth?: {
    accessToken?: string | null;
  };
}) {
  return state.auth?.accessToken ?? null;
}

export function getAccessToken(state?: {
  auth?: {
    accessToken?: string | null;
  };
}) {
  return (state ? getAccessTokenFromState(state) : null) ?? getAccessTokenFromStorage();
}
