export interface VitalSign {
  id: string;
  workerId: string;
  heartRate: number;
  temperature: number;
  timestamp: string; // ISO 8601 string
}
