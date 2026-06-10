const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export type HealthResponse = {
  status: "ok";
  service: string;
};

export async function getApiHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/health`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to reach the backend health endpoint.");
  }

  return response.json() as Promise<HealthResponse>;
}
