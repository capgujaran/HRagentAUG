import announcementsData from '../data/announcements.json';
import type { Announcement } from '../types';
import styles from './Dashboard.module.css';

const announcements = announcementsData as Announcement[];

const stats = [
  { label: 'Leave Balance', value: '18 days', detail: '25 days annual allowance', tone: 'teal' },
  { label: 'Pending Requests', value: '1', detail: 'Awaiting manager review', tone: 'navy' },
  { label: 'Next Payday', value: 'Aug 28', detail: '19 days remaining', tone: 'gold' },
];

export default function Dashboard() {
  return (
    <div className={styles.page}>
      <section className={styles.greeting}>
        <div>
          <p className={styles.eyebrow}>YOUR WORKSPACE</p>
          <h2>Good morning, Jordan <span aria-hidden="true">👋</span></h2>
          <p>Here’s a quick view of your time, requests, and company updates.</p>
        </div>
        <div className={styles.greetingBadge}>
          <span>JD</span>
          <div><strong>Jordan Davis</strong><small>Product Operations</small></div>
        </div>
      </section>

      <section className={styles.stats} aria-label="HR summary">
        {stats.map((stat) => (
          <article className={styles.stat} key={stat.label}>
            <span className={`${styles.statIcon} ${styles[stat.tone]}`} aria-hidden="true">
              {stat.label === 'Leave Balance' ? '✓' : stat.label === 'Pending Requests' ? '◷' : '₿'}
            </span>
            <div>
              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
              <small>{stat.detail}</small>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.announcements}>
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>STAY INFORMED</p><h2>Recent announcements</h2></div>
          <span>{announcements.length} updates</span>
        </div>
        <div className={styles.list}>
          {announcements.map((announcement) => (
            <article key={announcement.id} className={styles.announcement}>
              <div className={styles.dateBlock}>
                <strong>{announcement.date.split(' ')[1].replace(',', '')}</strong>
                <span>{announcement.date.split(' ')[0].slice(0, 3)}</span>
              </div>
              <div className={styles.announcementCopy}>
                <span>{announcement.category}</span>
                <h3>{announcement.title}</h3>
                <p>{announcement.description}</p>
              </div>
              <span className={styles.arrow} aria-hidden="true">→</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
