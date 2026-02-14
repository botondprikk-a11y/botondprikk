"use client";

import { useFormState, useFormStatus } from "react-dom";
import { registerTrainerAction, type AuthState } from "@/lib/actions/auth";

const initialState: AuthState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Regisztralas..." : "Regisztralas"}
    </button>
  );
}

export default function RegisterTrainerForm() {
  const [state, action] = useFormState(registerTrainerAction, initialState);

  return (
    <form action={action} className="stack" noValidate>
      {state.error ? <div className="error">{state.error}</div> : null}
      <div className="stack">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" />
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
