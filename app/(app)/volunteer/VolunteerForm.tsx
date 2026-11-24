'use client';

import { useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { volunteerRoles } from '@/lib/volunteer';
import { submitVolunteerInterest, type VolunteerResult } from './actions';
import styles from './volunteer.module.css';

export default function VolunteerForm() {
  const [other, setOther] = useState(false);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<VolunteerResult>({ status: 'idle' });
  const statusRef = useRef<HTMLDivElement>(null);
  const sending = useRef(false);

  const error = (field: string) => result.errors?.[field]?.[0];
  const errorProps = (field: string) => ({
    'aria-invalid': Boolean(error(field)),
    'aria-describedby': error(field) ? `${field}-error` : undefined,
  });
  const fieldError = (field: string) => error(field)
    ? <span className={styles.fieldError} id={`${field}-error`}>{error(field)}</span> : null;

  if (result.status === 'saved') return (
    <section className={styles.panel} aria-labelledby="volunteer-heading">
      <div className={styles.success} role="status" tabIndex={-1} ref={statusRef}>
        <h1 id="volunteer-heading">Thank you for your interest!</h1>
        <p>Your submission has been recorded. If we think you might be a good fit, we&apos;ll reach out using the contact info you provided.</p>
      </div>
    </section>
  );

  return (
    <section className={styles.panel} aria-labelledby="volunteer-heading">
      <h1 id="volunteer-heading">Volunteer with us</h1>
      <p className={styles.small}>All fields are required unless marked optional.</p>
      <form className={styles.form} onSubmit={async (event) => {
        event.preventDefault();
        if (sending.current || result.status === 'uncertain') return;
        sending.current = true;
        const data = new FormData(event.currentTarget);
        const reference = crypto.randomUUID();
        data.set('reference', reference);
        setPending(true);
        try {
          setResult(await submitVolunteerInterest(data));
        } catch {
          // The server may have saved the row even if its response was lost.
          setResult({ status: 'uncertain', reference });
        } finally {
          sending.current = false;
          setPending(false);
          requestAnimationFrame(() => statusRef.current?.focus());
        }
      }}>
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="website">Leave this blank</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <fieldset disabled={pending || result.status === 'uncertain'} className={styles.fields}>
          <label htmlFor="name">Your name<input id="name" name="name" autoComplete="name" required maxLength={200} {...errorProps('name')} />{fieldError('name')}</label>
          <label htmlFor="contact">How can we contact you?<span className={styles.hint}>Instagram preferred. Email or another contact works too.</span><input id="contact" name="contact" required maxLength={300} placeholder="@yourhandle or you@example.com" {...errorProps('contact')} />{fieldError('contact')}</label>
          <label htmlFor="experience">Tell us about your experience or interests<textarea id="experience" name="experience" required maxLength={3000} rows={4} {...errorProps('experience')} />{fieldError('experience')}</label>
          <label htmlFor="referral">Do you have any members of the community that could act as a character reference? <span className={styles.optional}>(optional)</span><textarea id="referral" name="referral" maxLength={500} rows={4} {...errorProps('referral')} />{fieldError('referral')}</label>
          <fieldset className={styles.preferences} {...errorProps('roles')}>
            <legend>What would you like to help with?</legend>
            <p className={styles.hint}>Choose all that interest you.</p>
            <div className={styles.choices}>{volunteerRoles.map(role => (
              <label className={styles.choice} key={role}>
                <input type="checkbox" name="roles" value={role} onChange={role === 'Other' ? event => setOther(event.target.checked) : undefined} />
                <span>{role === 'Setting up/breaking down' ? 'Setup & breakdown' : role}</span>
              </label>
            ))}</div>
            {fieldError('roles')}
          </fieldset>
          {other ? <label htmlFor="other">What else would you like to do?<textarea id="other" name="other" required maxLength={1000} rows={2} {...errorProps('other')} />{fieldError('other')}</label> : null}
          <p className={styles.small}>We’ll use your answers to coordinate volunteering and contact you about opportunities.</p>
          <button type="submit" className={styles.submit}>{pending ? 'Submitting…' : 'Submit'}<Send size={18} aria-hidden="true" /></button>
        </fieldset>
        <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite" className={styles.status}>
          {result.status === 'invalid' ? 'Check the fields above. Choose at least one volunteer preference.' : null}
          {result.status === 'unavailable' ? 'We couldn’t connect to our signup list. Your answers are still here; please try again in a moment.' : null}
          {result.status === 'uncertain' ? <>We couldn’t confirm whether your interest was saved. Please don’t send it again yet. Contact us using the links below so we can check.{result.reference ? <> Your reference: <code>{result.reference}</code>.</> : null}</> : null}
        </div>
      </form>
    </section>
  );
}
