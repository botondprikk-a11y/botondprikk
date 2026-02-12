import Link from "next/link";
import { PublicNav } from "@/components/layout/PublicNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  return (
    <div>
      <PublicNav />
      <main className="mx-auto w-[92%] max-w-4xl py-12">
        <h1 className="section-title">Árak</h1>
        <p className="mt-2 text-muted">Válassz csomagot az edzői csapatod méretéhez.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <h3 className="text-lg font-semibold">Starter</h3>
            <p className="mt-2 text-sm text-muted">Kisebb edzői praxisoknak.</p>
            <p className="mt-4 text-2xl font-semibold">19 900 Ft/hó</p>
          </Card>
          <Card className="border-2 border-primary">
            <h3 className="text-lg font-semibold">Pro</h3>
            <p className="mt-2 text-sm text-muted">Haladó riportokkal és extra támogatással.</p>
            <p className="mt-4 text-2xl font-semibold">34 900 Ft/hó</p>
          </Card>
        </div>
        <div className="mt-10">
          <Button>
            <Link href="/register-coach">Ingyenes próba</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
