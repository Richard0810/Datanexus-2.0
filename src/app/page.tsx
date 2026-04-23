
import { DataDashboard } from '@/components/frontend/DataDashboard';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  return (
    <div className="max-w-[1400px] mx-auto min-h-screen">
      <DataDashboard />
      <Toaster />
    </div>
  );
}
