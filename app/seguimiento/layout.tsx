import { GlobalJourneyProgress } from '@/components/journey';

export default function SeguimientoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GlobalJourneyProgress />
      {children}
    </>
  );
}
