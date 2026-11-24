import type { Metadata } from 'next';
import VolunteerForm from './VolunteerForm';
import styles from './volunteer.module.css';

export const metadata: Metadata = {
  title: 'Volunteer | Dyke Night Boston',
  description: 'Help make Dyke Night happen. Tell us how you would like to get involved at future events.',
};

export default function VolunteerPage() {
  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <VolunteerForm />
        <p className={`${styles.small} ${styles.disclaimer}`}>This is an expression of interest in future events. We’ll contact you about opportunities; signing up doesn’t assign you a shift.</p>
      </div>
    </main>
  );
}
