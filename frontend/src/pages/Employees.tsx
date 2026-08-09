import { useMemo, useState } from 'react';
import employeesData from '../data/employees.json';
import type { Employee } from '../types';
import styles from './Employees.module.css';

const employees = employeesData as Employee[];

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('');
}

export default function Employees() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return employees.filter((employee) => Object.values(employee).some((value) => String(value).toLowerCase().includes(term)));
  }, [query]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeading}>
        <div><p>OUR PEOPLE</p><h2>Employees</h2><span>Find colleagues across the organization.</span></div>
        <span className={styles.headcount}><strong>{employees.length}</strong> employees</span>
      </div>

      <section className={styles.directory}>
        <div className={styles.toolbar}>
          <div><h3>Employee directory</h3><p>Search by name, role, department, or email</p></div>
          <label className={styles.search}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg>
            <span className={styles.srOnly}>Search employees</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search employees…" />
          </label>
        </div>

        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th>Name</th><th>Role</th><th>Department</th><th>Email</th></tr></thead>
            <tbody>
              {filtered.map((employee) => (
                <tr key={employee.id}>
                  <td><div className={styles.person}><span>{initials(employee.name)}</span><strong>{employee.name}</strong></div></td>
                  <td>{employee.role}</td>
                  <td><span className={styles.department}>{employee.department}</span></td>
                  <td><a href={`mailto:${employee.email}`}>{employee.email}</a></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={4} className={styles.empty}>No employees match “{query}”.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
