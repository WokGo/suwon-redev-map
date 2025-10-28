const resolveApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (typeof window !== "undefined" && window.location) {
    return `${window.location.origin}/api`;
  }

  return "http://localhost:5000";
};

export const API_URL = resolveApiUrl();
