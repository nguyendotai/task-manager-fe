const DEFAULT_API_URL = "http://localhost:5000/api/v1";
const DEFAULT_MOCK_API_URL = "/api/mock";

function readBoolean(value: string | undefined, fallback = false) {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === "true";
}

export const env = {
  realApiUrl: process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL,
  mockApiUrl: process.env.NEXT_PUBLIC_MOCK_API_URL ?? DEFAULT_MOCK_API_URL,
  useMock: readBoolean(process.env.NEXT_PUBLIC_USE_MOCK, false),
  get apiBaseUrl() {
    return this.useMock ? this.mockApiUrl : this.realApiUrl;
  }
};
