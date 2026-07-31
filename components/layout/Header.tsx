'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '../brand/Logo';
import { Navigation } from './Navigation';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-alfa-green focus:text-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
      >
        Ir al contenido principal
      </a>

      <header className="bg-alfa-surface border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alfa-green focus-visible:ring-offset-2 rounded"
            aria-label="Ir al inicio — Alfa Postventa 90"
          >
            <Logo />
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <Navigation />
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-alfa-text hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alfa-green focus-visible:ring-offset-2"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden border-t border-gray-200 bg-alfa-surface px-4 py-3"
          >
            <Navigation onLinkClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}
      </header>
    </>
  );
}
