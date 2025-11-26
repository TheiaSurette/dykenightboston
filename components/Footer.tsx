import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

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
            <p className="text-white/90 [text-shadow:2px_2px_4px_rgb(0_0_0/60%)]">
              Follow us for updates on upcoming events and community news.
            </p>
          </div>

          {/* Empty column */}
          <div></div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/20 text-center text-white/80 [text-shadow:2px_2px_4px_rgb(0_0_0/60%)]">
          <p>&copy; {currentYear} Dyke Night Boston. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
