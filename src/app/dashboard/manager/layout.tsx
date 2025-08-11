// Force manager dashboard to be client-side only
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 