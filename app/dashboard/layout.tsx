import { DashboardNav } from '@/components/dashboard/nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardNav />
      <main className="flex-1 bg-muted/10">{children}</main>
    </div>
  );
}