import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BarbedWire from '@/components/BarbedWire';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <BarbedWire />
      <Navigation />
      {children}
      <Footer />
    </>
  );
}
