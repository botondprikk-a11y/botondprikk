import Link from "next/link";
import { db } from "@/lib/db";
import RegisterTrainerForm from "./RegisterTrainerForm";
import RegisterClientForm from "./RegisterClientForm";

type RegisterPageProps = {
  searchParams?: { invite?: string };
};

export default async function RegisterPage({
  searchParams
}: RegisterPageProps) {
  const inviteToken = searchParams?.invite?.trim();

  if (inviteToken) {
    const invitation = await db.invitation.findUnique({
      where: { token: inviteToken }
    });

    return (
      <main>
        <div className="shell auth-wrap">
          <div className="card">
            <h1>Kliens regisztracio</h1>
            {invitation &&
            invitation.status === "PENDING" &&
            invitation.expiresAt > new Date() ? (
              <>
                <p className="muted">
                  A meghivo ervenyes. Fejezd be a regisztraciot.
                </p>
                <RegisterClientForm
                  inviteToken={inviteToken}
                  inviteEmail={invitation.email}
                />
              </>
            ) : (
              <>
                <div className="error">
                  A meghivo ervenytelen vagy lejart.
                </div>
                <p className="muted">
                  Kerj uj meghivot az edzodtol.
                </p>
              </>
            )}
          </div>
          <p className="muted">
            Mar van fiokod? <Link href="/login">Bejelentkezes</Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="shell auth-wrap">
        <div className="card">
          <h1>Edzo regisztracio</h1>
          <p className="muted">
            Hozd letre az edzoi fiokodat, hogy meghivhass klienseket.
          </p>
          <RegisterTrainerForm />
          <p className="muted">
            Mar van fiokod? <Link href="/login">Bejelentkezes</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
