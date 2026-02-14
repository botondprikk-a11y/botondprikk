import Link from "next/link";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main>
      <div className="shell auth-wrap">
        <div className="card">
          <h1>Bejelentkezes</h1>
          <p className="muted">
            Edzo, kliens es admin fiokok egy helyen.
          </p>
          <LoginForm />
          <p className="muted">
            Edzo vagy?{" "}
            <Link href="/register">Regisztralj itt</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
