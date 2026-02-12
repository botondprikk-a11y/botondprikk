import Link from "next/link";

export function PublicNav() {
  return (
    <header className="border-b border-border bg-card/70">
      <div className="mx-auto flex w-[92%] max-w-6xl items-center justify-between py-4">
        <Link href="/" className="text-xl font-display">EdzőSaaS</Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/arak">Árak</Link>
          <Link href="/gyik">GYIK</Link>
          <Link href="/adatkezeles">Adatkezelés</Link>
          <Link href="/aszf">ÁSZF</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold">
            Belépés
          </Link>
          <Link
            href="/register-coach"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow transition hover:opacity-90"
          >
            Ingyenes próba
          </Link>
        </div>
      </div>
    </header>
  );
}
