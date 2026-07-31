'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/prototipo', label: 'Prototipo' },
  { href: '/metricas', label: 'Métricas' },
  { href: '/acerca-del-prototipo', label: 'Acerca del prototipo' },
];

export function Navigation({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal">
      <ul className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onLinkClick}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    isActive
                      ? 'bg-alfa-green/10 text-alfa-green'
                      : 'text-alfa-text hover:bg-gray-100 hover:text-alfa-navy'
                  }
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alfa-green focus-visible:ring-offset-2`}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
