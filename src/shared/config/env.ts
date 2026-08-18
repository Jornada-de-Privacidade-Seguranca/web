export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8030/api",
  isDev: process.env.NODE_ENV === "development",
} as const;
