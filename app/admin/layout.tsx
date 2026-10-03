import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read request headers to trigger dynamic server rendering per-request
  await headers();
  return <>{children}</>;
}
