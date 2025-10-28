const envBase = process.env.REACT_APP_API_BASE;
const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";

export const URL =
  envBase ||
  (browserOrigin ? `${browserOrigin}/admin/api` : "http://localhost:5001");
