import { PublicNav } from "@/components/layout/PublicNav";
import { Card } from "@/components/ui/card";

const questions = [
  {
    q: "Mennyire gyors a bevezetés?",
    a: "A regisztráció után azonnal meghívhatod a vendégeidet."
  },
  {
    q: "Van mobil app?",
    a: "V1-ben webes felület van, mobilon is reszponzív."
  },
  {
    q: "Kezeli az offline bérleteket?",
    a: "Igen, rögzítheted a bérleteket, alkalmakat és a bevételeket."
  }
];

export default function FaqPage() {
  return (
    <div>
      <PublicNav />
      <main className="mx-auto w-[92%] max-w-4xl py-12">
        <h1 className="section-title">GYIK</h1>
        <div className="mt-8 grid gap-4">
          {questions.map((item) => (
            <Card key={item.q}>
              <h3 className="text-lg font-semibold">{item.q}</h3>
              <p className="mt-2 text-sm text-muted">{item.a}</p>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
