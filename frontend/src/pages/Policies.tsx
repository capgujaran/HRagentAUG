import { useState } from 'react';
import policiesData from '../data/policies.json';
import type { Policy } from '../types';
import styles from './Policies.module.css';

const policies = policiesData as Policy[];

export default function Policies() {
  const [openId, setOpenId] = useState<number | null>(1);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeading}>
        <div><p>KNOW YOUR WORKPLACE</p><h2>Policies</h2><span>Clear guidance for common workplace questions.</span></div>
        <span className={styles.version}>Policy library · 2026</span>
      </div>

      <section className={styles.policyPanel}>
        <div className={styles.intro}>
          <div className={styles.introIcon}>i</div>
          <div><h3>HR policy library</h3><p>Select a policy to read its latest guidance. For personal advice, open Ask HR.</p></div>
        </div>
        <div className={styles.accordion}>
          {policies.map((policy) => {
            const open = openId === policy.id;
            return (
              <article key={policy.id} className={`${styles.policy} ${open ? styles.open : ''}`}>
                <button type="button" onClick={() => setOpenId(open ? null : policy.id)} aria-expanded={open}>
                  <div><h3>{policy.title}</h3><p>{policy.summary}</p></div>
                  <span>{open ? '−' : '+'}</span>
                </button>
                {open && (
                  <div className={styles.content}>
                    <p>{policy.content}</p>
                    <small>Last updated: {policy.updated}</small>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
