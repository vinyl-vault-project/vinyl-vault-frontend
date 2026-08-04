const API_URL = import.meta.env.VITE_API_URL;

export interface HealthStatus {
  status: string;
  message: string;
}

export async function getHealthStatus(): Promise<HealthStatus> {
  if (!API_URL) {
    throw new Error('VITE_API_URL is not configured');
  }

  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status}`);
  }

  return response.json() as Promise<HealthStatus>;
}
