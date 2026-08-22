import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { business } from "@/db/schema";
import BusinessSettingsForm from "@/components/dashboard/business-setting-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings - Slotly Dashboard",
};

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  const businesses = await db.select().from(business).limit(1);
  const biz = businesses[0];

  if (!biz) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No business configured. Run the seed script to set up your business.
      </div>
    );
  }

  return <BusinessSettingsForm initialData={biz} />;
}
