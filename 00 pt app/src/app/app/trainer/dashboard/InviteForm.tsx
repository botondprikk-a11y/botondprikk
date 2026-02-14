"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createInviteAction, type InviteState } from "@/lib/actions/invite";

const initialState: InviteState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Meghivo keszul..." : "Meghivo letrehozasa"}
    </button>
  );
}

export default function InviteForm() {
  const [state, action] = useFormState(createInviteAction, initialState);

  return (
    <form action={action} className="stack" noValidate>
      {state.error ? <div className="error">{state.error}</div> : null}
      <div className="stack">
        <label htmlFor="email">Kliens email</label>
        <input id="email" name="email" type="email" autoComplete="email" />
      </div>
      <SubmitButton />
      {state.invitePath ? (
        <div className="notice">
          Meghivo link: <strong>{state.invitePath}</strong>
          <div className="muted">
            Masold ki es kuldd el emailben.
          </div>
        </div>
      ) : null}
    </form>
  );
}
