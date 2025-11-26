'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

interface NavigationProps {
  /**
   * If true, the navigation will always appear in its "scrolled" state (with background).
   * If false, it will be transparent initially and gain background on scroll.
   */
  alwaysScrolled?: boolean;
}

export default function Navigation({ alwaysScrolled = false }: NavigationProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(alwaysScrolled);

  useEffect(() => {
    if (alwaysScrolled) return; // Don't attach scroll listener if always scrolled

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [alwaysScrolled]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/events', label: 'Events' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/80' : 'bg-transparent'
      }`}
    >
      <div className=" mx-auto pl-16 pr-16 md:pl-28 md:pr-28 py-4 w-full">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-3 transition-all duration-300 text-white [text-shadow:2px_2px_6px_rgb(0_0_0/60%)]"
          >
            <img
              src="/img/small-logo.png"
              alt="Dyke Night Boston"
              className="h-12 w-auto drop-shadow-lg"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`hover:text-red transition-all duration-300 font-medium text-xl [text-shadow:2px_2px_6px_rgb(0_0_0/60%)] ${
                    active ? 'text-red' : 'text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="ml-auto md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="link"
                  size="icon"
                  className="transition-all duration-300 hover:text-red text-white [text-shadow:2px_2px_6px_rgb(0_0_0/60%)]"
                >
                  <Menu className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="top"
                className="bg-black/80 border-b border-red/20 gap-0 p-0 [&>button.absolute]:hidden"
              >
                <SheetHeader className="bg-black/80 backdrop-blur-sm border-b border-white/10 px-6 py-4 m-0 shadow-sm">
                  <div className="flex items-center justify-between">
                    <Link href="/">
                      <div className="flex items-center gap-2">
                        <Image
                          src="/img/small-logo.png"
                          alt="Dyke Night"
                          width={50}
                          height={50}
                          className="h-12 w-auto drop-shadow-lg"
                        />
                        <SheetTitle className="text-2xl font-bold text-white">
                          Dyke Night
                        </SheetTitle>
                      </div>
                    </Link>
                    <Button
                      variant="link"
                      size="icon"
                      onClick={() => setOpen(false)}
                      className="text-white hover:text-red"
                    >
                      <X className="size-6" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </div>
                </SheetHeader>
                <div className="flex flex-col px-6 py-2 divide-y divide-black/10">
                  {navLinks.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <div key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={`text-xl transition-colors duration-200 font-medium block py-2 ${
                            active ? 'text-red' : 'text-white/90 hover:text-red'
                          }`}
                        >
                          {link.label}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
