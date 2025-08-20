import { revalidatePath } from 'next/cache';
import { submitVital } from '../lib/api';

export default function VitalForm({ workerId }: { workerId: string }) {
  async function submitAction(formData: FormData) {
    'use server';

    const hrRaw = formData.get('heartRate');
    const tempRaw = formData.get('temperature');

    const heartRate = Number(hrRaw);
    const temperature = Number(tempRaw);

    if (!Number.isInteger(heartRate) || heartRate < 20 || heartRate > 300) {
      revalidatePath('/');
      return;
    }
    if (!Number.isFinite(temperature) || temperature < 25 || temperature > 45) {
      revalidatePath('/');
      return;
    }

    try {
      await submitVital({ workerId, heartRate, temperature: Number(temperature.toFixed(2)) });
    } finally {
      revalidatePath('/');
    }
  }

  return (
    <form className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end" action={submitAction}>
      <div className="inputGroup">
        <label htmlFor="heartRate">Heart Rate (bpm)</label>
        <input
          id="heartRate"
          name="heartRate"
          type="number"
          inputMode="numeric"
          min={20}
          max={300}
          step={1}
          placeholder="80"
          required
        />
      </div>

      <div className="inputGroup">
        <label htmlFor="temperature">Temperature (°C)</label>
        <input
          id="temperature"
          name="temperature"
          type="number"
          inputMode="decimal"
          min={25}
          max={45}
          step={0.1}
          placeholder="36.6"
          required
        />
      </div>

      <div className="inputGroup">
        <button type="submit">Send Data</button>
      </div>
    </form>
  );
}
