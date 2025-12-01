import Link from 'next/link';
import { getPayloadClient } from '@/lib/payload';
import { unstable_cache } from 'next/cache';
import * as LucideIcons from 'lucide-react';

export default async function Footer() {
  const currentYear = new Date().getFullYear();

  // Fetch social links from CMS
  const payload = await getPayloadClient();
  const socialLinksData = await unstable_cache(
    async () =>
      payload.findGlobal({
        slug: 'social-links',
      }),
    ['footer-social-links'],
    { tags: ['footer'], revalidate: 3600 }
  )();

  const socialLinks = socialLinksData?.socialLinks || [];

  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  return (
    <footer className="bg-black/60 text-white py-12">
      <div className="container mx-auto pl-16 pr-16 md:pl-28 md:pr-28">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white [text-shadow:2px_2px_6px_rgb(0_0_0/60%)]">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-white/90 hover:text-red transition-colors [text-shadow:2px_2px_4px_rgb(0_0_0/60%)]"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-white/90 hover:text-red transition-colors [text-shadow:2px_2px_4px_rgb(0_0_0/60%)]"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-white/90 hover:text-red transition-colors [text-shadow:2px_2px_4px_rgb(0_0_0/60%)]"
                >
                  Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white [text-shadow:2px_2px_6px_rgb(0_0_0/60%)]">
              Connect
            </h3>
            {socialLinks.length > 0 && (
              <ul className="space-y-2">
                {socialLinks.map((link: any, index: number) => {
                  const iconElement = getIcon(link.icon);
                  return (
                    <li key={index}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/90 hover:text-red transition-colors [text-shadow:2px_2px_4px_rgb(0_0_0/60%)] flex items-center gap-2"
                      >
                        {iconElement && <span>{iconElement}</span>}
                        {link.platform}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Empty column */}
          <div></div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/20 text-center text-white/80 [text-shadow:2px_2px_4px_rgb(0_0_0/60%)]">
          <div className="flex items-center justify-center gap-4">
            <p>&copy; {currentYear} Dyke Night Boston. All rights reserved.</p>
            <span>|</span>
            <span>
              Built by{' '}
              <Link
                href="https://tsurette.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-red transition-colors"
              >
                Theia
              </Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
