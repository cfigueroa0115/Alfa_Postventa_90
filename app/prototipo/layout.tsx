import { GlobalJourneyProgress } from '@/components/journey';

export default function PrototipoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GlobalJourneyProgress />
      {children}
    </>
  );
}
