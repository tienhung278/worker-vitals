import type {VitalSign} from '../types/vitals';

export type SubmitVitalPayload = {
  workerId: string;
  heartRate: number;
  temperature: number;
};

export function getApiBase(): string {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000').trim();
  return base.replace(/\/$/, '');
}

export function getWorkerId(): string {
  return (process.env.NEXT_PUBLIC_WORKER_ID || 'worker-123').trim();
}

export async function fetchLatestVitals(workerId: string, limit = 10): Promise<VitalSign[]> {
  const base = getApiBase();
  const url = `${base}/api/v1/vitals/${encodeURIComponent(workerId)}?limit=${Math.max(1, Math.min(100, limit))}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch vitals: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as VitalSign[];
}

export async function submitVital(payload: SubmitVitalPayload) {
  const base = getApiBase();
  const url = `${base}/api/v1/vitals`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to submit vital: ${res.status} ${res.statusText} ${text}`);
  }
  return (await res.json()) as VitalSign;
}
