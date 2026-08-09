import { FormEvent, useState } from 'react';
import leaveData from '../data/leaveRequests.json';
import type { LeaveRequest } from '../types';
import styles from './Leave.module.css';

export default function Leave() {
  const [requests, setRequests] = useState<LeaveRequest[]>(leaveData as LeaveRequest[]);
  const [notice, setNotice] = useState('');

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const from = String(form.get('from'));
    const to = String(form.get('to'));
    const start = new Date(`${from}T00:00:00`);
    const end = new Date(`${to}T00:00:00`);
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);

    setRequests((current) => [
      {
        id: Math.max(...current.map((item) => item.id), 0) + 1,
        employee: 'Jordan Davis',
        type: String(form.get('type')),
        from,
        to,
        days,
        status: 'Pending',
      },
      ...current,
    ]);
    event.currentTarget.reset();
    setNotice('Your leave request has been submitted for approval.');
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeading}>
        <div><p>TIME AWAY</p><h2>Leave</h2><span>Plan time off and track your requests.</span></div>
        <strong>18 <small>days available</small></strong>
      </div>

      <div className={styles.layout}>
        <section className={styles.tablePanel}>
          <div className={styles.panelHeading}><div><h3>Leave requests</h3><p>Your recent and upcoming time off</p></div><span>{requests.length} total</span></div>
          <div className={styles.tableWrap}>
            <table>
              <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th></tr></thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td><strong>{request.type}</strong></td>
                    <td>{new Date(`${request.from}T00:00:00`).toLocaleDateString('en-AE', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>{new Date(`${request.to}T00:00:00`).toLocaleDateString('en-AE', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>{request.days}</td>
                    <td><span className={`${styles.status} ${styles[request.status.toLowerCase()]}`}>{request.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.formPanel}>
          <div className={styles.panelHeading}><div><h3>Request Leave</h3><p>Send a new request to your manager</p></div></div>
          {notice && <div className={styles.notice} role="status">✓ {notice}</div>}
          <form onSubmit={submitRequest}>
            <label>Leave type<select name="type" required defaultValue="Annual Leave"><option>Annual Leave</option><option>Sick Leave</option><option>Personal Leave</option><option>Parental Leave</option></select></label>
            <div className={styles.dateFields}>
              <label>From<input type="date" name="from" required min="2026-08-10" /></label>
              <label>To<input type="date" name="to" required min="2026-08-10" /></label>
            </div>
            <label>Reason<textarea name="reason" rows={4} placeholder="Add a short note for your manager" required /></label>
            <button type="submit">Submit request</button>
          </form>
        </section>
      </div>
    </div>
  );
}
