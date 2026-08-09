import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import ChatAgent from './ChatAgent';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

const links = [
  { to: '/', label: 'Dashboard', icon: 'grid' },
  { to: '/leave', label: 'Leave', icon: 'calendar' },
  { to: '/employees', label: 'Employees', icon: 'people' },
  { to: '/policies', label: 'Policies', icon: 'document' },
];

function NavIcon({ name }: { name: string }) {
  if (name === 'calendar') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3M17 3v3M4.5 9h15M6 5h12a2 2 0 0 1 2 2v12H4V7a2 2 0 0 1 2-2Z" /></svg>;
  }
  if (name === 'people') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2.5 21v-2.2A5.8 5.8 0 0 1 8.3 13h1.4a5.8 5.8 0 0 1 5.8 5.8V21M16 4.2a3.7 3.7 0 0 1 0 7.1M17 14a5 5 0 0 1 4.5 5v2" /></svg>;
  }
  if (name === 'document') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6V3Zm8 0v5h4M9 12h6M9 16h6" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" /></svg>;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logo}>P</span>
          <span>PeopleHub</span>
        </div>
        <nav className={styles.navigation} aria-label="HR Portal navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.navIcon}><NavIcon name={link.icon} /></span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <span className={styles.userAvatar}>JD</span>
          <div>
            <strong>Jordan Davis</strong>
            <span>Employee</span>
          </div>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.header}>
          <div>
            <p>EMPLOYEE EXPERIENCE</p>
            <h1>PeopleHub — HR Portal</h1>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.notification} type="button" aria-label="Notifications">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></svg>
              <span />
            </button>
            <span className={styles.date}>Sunday, August 9</span>
          </div>
        </header>
        <main className={styles.main}>{children}</main>
      </div>
      <ChatAgent />
    </div>
  );
}
