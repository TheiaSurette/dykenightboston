'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNewsletterSubscription } from '@/hooks/useNewsletterSubscription';

export default function NewsletterSignup() {
  const { email, setEmail, status, message, isLoading, handleSubmit } = useNewsletterSubscription();

  return (
    <section className="px-6 pl-16 pr-16 md:pl-28 md:pr-28 py-4 text-white">
      <p className="text-center text-lg font-bold max-w-md mx-auto mb-4">
        Subscribe to our newsletter to stay to date on the latest news and upcoming events!
      </p>
      <div className="container mx-auto max-w-md">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 items-center justify-center"
        >
          <div className="flex-1 w-full sm:w-auto min-w-0">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/30 backdrop-blur-sm max-w-xs sm:max-w-none"
            />
          </div>
          <Button
            variant="outline"
            type="submit"
            disabled={isLoading || status === 'success'}
            className="w-full sm:w-auto bg-transparent border-white/30 text-white"
          >
            {isLoading
              ? 'Signing up...'
              : status === 'success'
              ? 'Signed up!'
              : 'Subscribe'}
          </Button>
        </form>
        {message && (
          <p
            className={`text-center mt-3 text-sm ${
              status === 'success' ? 'text-green-400' : 'text-red'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
