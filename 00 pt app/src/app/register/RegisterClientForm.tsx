"use client";

import { useFormState, useFormStatus } from "react-dom";
import { registerClientAction, type AuthState } from "@/lib/actions/auth";

type RegisterClientFormProps = {
  inviteToken: string;
  inviteEmail: string;
};

const initialState: AuthState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Regisztralas..." : "Regisztralas"}
    </button>
  );
}

export default function RegisterClientForm({
  inviteToken,
  inviteEmail
}: RegisterClientFormProps) {
  const [state, action] = useFormState(registerClientAction, initialState);

  return (
    <form action={action} className="stack" noValidate>
      {state.error ? <div className="error">{state.error}</div> : null}
      <input type="hidden" name="inviteToken" value={inviteToken} />
      <div className="stack">
        <label htmlFor="fullName">Teljes nev</label>
        <input id="fullName" name="fullName" type="text" />
      </div>
      <div className="stack">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={inviteEmail}
          readOnly
        />
      </div>
      <div className="stack">
        <label htmlFor="password">Jelszo</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
        />
      </div>
      <SubmitButton />
    </form>
  );
}
