import { fetchLatestVitals, getWorkerId } from '../lib/api';
import VitalForm from '../components/VitalForm';
import type { VitalSign } from '../types/vitals';

export default async function Page() {
  const workerId = getWorkerId();
  let vitals: VitalSign[] = [];
  try {
    vitals = await fetchLatestVitals(workerId, 10);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch vitals:', e);
  }

  return (
    <section className="content">
      <VitalForm workerId={workerId} />

      <h2 style={{ marginTop: '2rem' }}>Latest Vitals for {workerId}</h2>
      {vitals.length === 0 ? (
        <p className="muted">No records yet. Submit the form to create the first record.</p>
      ) : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Heart Rate</th>
                <th>Temperature</th>
              </tr>
            </thead>
            <tbody>
              {vitals.map((v) => (
                <tr key={v.id}>
                  <td>{new Date(v.timestamp).toLocaleString()}</td>
                  <td>{v.heartRate} bpm</td>
                  <td>{v.temperature.toFixed(1)} °C</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
