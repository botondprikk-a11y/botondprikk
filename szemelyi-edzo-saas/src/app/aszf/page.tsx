import { PublicNav } from "@/components/layout/PublicNav";

export default function TermsPage() {
  return (
    <div>
      <PublicNav />
      <main className="mx-auto w-[92%] max-w-4xl py-12">
        <h1 className="section-title">Általános Szerződési Feltételek</h1>
        <p className="mt-4 text-sm text-muted">
          Placeholder tartalom V1-hez. Itt szerepelnek majd a szolgáltatás használati feltételei,
          díjazás, felmondás és felelősségvállalás.
        </p>
      </main>
    </div>
  );
}
