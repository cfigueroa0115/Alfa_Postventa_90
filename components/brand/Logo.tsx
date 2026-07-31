import Image from 'next/image';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/brand/seguros-alfa-logo.png"
      alt="Seguros Alfa - Logo"
      width={140}
      height={40}
      className={className}
      priority
    />
  );
}
