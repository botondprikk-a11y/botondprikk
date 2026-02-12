import Link from "next/link";
import { PublicNav } from "@/components/layout/PublicNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div>
      <PublicNav />
      <main className="mx-auto w-[92%] max-w-6xl">
        <section className="grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-accent">Online + Offline</p>
            <h1 className="mt-4 text-4xl font-display md:text-5xl">
              Online és offline vendégeid egy helyen
            </h1>
            <p className="mt-4 text-lg text-muted">
              Egy platform a programozáshoz, táplálkozás követéshez és a klasszikus PT adminhoz.
              Kevesebb admin, több figyelem a vendégeidre.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button>
                <Link href="/register-coach">Ingyenes próba</Link>
              </Button>
              <Button variant="outline">
                <Link href="/arak">Árak megtekintése</Link>
              </Button>
            </div>
          </div>
          <Card className="bg-white">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Mai fókusz</h3>
              <div>
                <p className="text-sm text-muted">Vendég: Nagy Petra</p>
                <p className="text-xl font-semibold">Erő + core</p>
              </div>
              <div className="rounded-xl bg-background p-4">
                <p className="text-sm text-muted">Heti check-in</p>
                <p className="text-sm">Alvás: 4/5 · Stressz: 2/5 · Energia: 4/5</p>
              </div>
              <div className="rounded-xl bg-background p-4">
                <p className="text-sm text-muted">Offline bérlet</p>
                <p className="text-sm">10 alkalmas · 4 maradt</p>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 py-12 md:grid-cols-3">
          {[
            {
              title: "Kevesebb admin",
              text: "Automatizált riportok és egy helyen lévő adatok."
            },
            {
              title: "Jobb megtartás",
              text: "Követhető progress, heti check-in és üzenetek."
            },
            {
              title: "Havi riport",
              text: "Bevétel, alkalmak, státuszok egyetlen nézetben."
            }
          ].map((item) => (
            <Card key={item.title}>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.text}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-8 py-12 lg:grid-cols-2">
          <Card>
            <h3 className="text-lg font-semibold">Online coaching</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>Edzéstervek és napi log</li>
              <li>Táplálkozás és makró célok</li>
              <li>Check-in, üzenetek, progress fotók</li>
            </ul>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold">Offline admin</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>Bérletek, alkalmak, lemondások</li>
              <li>Bevétel nyilvántartás</li>
              <li>Havi riportok és figyelmeztetések</li>
            </ul>
          </Card>
        </section>

        <section className="py-12">
          <h2 className="section-title">Hogyan működik?</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[
              "Regisztrálsz edzőként",
              "Meghívod a vendégeidet",
              "Követitek a közös haladást"
            ].map((step, index) => (
              <Card key={step}>
                <p className="text-sm text-muted">0{index + 1}</p>
                <p className="mt-2 text-lg font-semibold">{step}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-12">
          <h2 className="section-title">Árazás</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card>
              <h3 className="text-lg font-semibold">Starter</h3>
              <p className="mt-2 text-sm text-muted">Alap funkciók kisebb edzői csapatoknak.</p>
              <p className="mt-4 text-2xl font-semibold">19 900 Ft/hó</p>
            </Card>
            <Card className="border-2 border-primary">
              <h3 className="text-lg font-semibold">Pro</h3>
              <p className="mt-2 text-sm text-muted">Haladó riportok és priorizált támogatás.</p>
              <p className="mt-4 text-2xl font-semibold">34 900 Ft/hó</p>
            </Card>
          </div>
        </section>

        <section className="py-12">
          <h2 className="section-title">GYIK</h2>
          <div className="mt-6 grid gap-4">
            {["Van ingyenes próba?", "Mennyi vendéget kezelhetek?", "Lehet offline adatokat rögzíteni?"]
              .map((q) => (
                <Card key={q}>
                  <p className="font-semibold">{q}</p>
                  <p className="mt-2 text-sm text-muted">
                    Igen, a V1-ben minden fő funkció elérhető. A részletek hamarosan bővülnek.
                  </p>
                </Card>
              ))}
          </div>
        </section>

        <section className="py-16">
          <Card className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="section-title">Kezdjük el együtt</h2>
              <p className="mt-2 text-sm text-muted">Kérj ingyenes próbát, és hívd meg az első vendégeidet.</p>
            </div>
            <Button>
              <Link href="/register-coach">Ingyenes próba</Link>
            </Button>
          </Card>
        </section>
      </main>
    </div>
  );
}
