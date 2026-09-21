import { notFound } from "next/navigation";
import { RecoverForm } from "./recover-form";

export const dynamic = "force-dynamic";

export default function AdminRecoverPage() {
  const isRecoveryEnabled = process.env.ADMIN_RECOVERY_ENABLED === "true";

  if (!isRecoveryEnabled) {
    notFound();
  }

  return <RecoverForm />;
}
