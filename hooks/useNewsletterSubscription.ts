import { useState, useCallback } from 'react';

type SubscriptionStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseNewsletterSubscriptionReturn {
  email: string;
  setEmail: (email: string) => void;
  status: SubscriptionStatus;
  message: string;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useNewsletterSubscription(): UseNewsletterSubscriptionReturn {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubscriptionStatus>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
      setMessage(data.message || 'Thanks for signing up!');
      setEmail('');

      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
    }
  }, [email]);

  return {
    email,
    setEmail,
    status,
    message,
    isLoading: status === 'loading',
    handleSubmit,
  };
}

