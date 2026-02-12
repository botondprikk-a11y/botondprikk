import { PublicNav } from "@/components/layout/PublicNav";

export default function DataPolicyPage() {
  return (
    <div>
      <PublicNav />
      <main className="mx-auto w-[92%] max-w-4xl py-12">
        <h1 className="section-title">Adatkezelési tájékoztató</h1>
        <p className="mt-4 text-sm text-muted">
          Ez egy V1 placeholder. Rögzíti a személyes adatok kezelésének célját, jogalapját és
          időtartamát. Később bővíthető részletes jogi szöveggel.
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-muted">
          <li>Adatkezelő: EdzőSaaS</li>
          <li>Kezelt adatok: név, email, edzés- és táplálkozási logok</li>
          <li>Jogalap: szerződés teljesítése és jogos érdek</li>
        </ul>
      </main>
    </div>
  );
}
