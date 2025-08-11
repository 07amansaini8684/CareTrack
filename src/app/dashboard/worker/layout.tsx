// Force worker dashboard to be client-side only
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 