'use client';

export default function BarbedWire() {
  return (
    <>
      {/* Left side - scrolling up */}
      <div className="fixed left-0 top-0 bottom-0 w-12 md:w-24 z-40 pointer-events-none overflow-hidden">
        <div className="barbed-wire-left"></div>
      </div>

      {/* Right side - scrolling down */}
      <div className="fixed right-0 top-0 bottom-0 w-12 md:w-24 z-40 pointer-events-none overflow-hidden">
        <div className="barbed-wire-right"></div>
      </div>
    </>
  );
}
