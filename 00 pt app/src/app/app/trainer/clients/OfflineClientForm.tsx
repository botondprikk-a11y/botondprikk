"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  createOfflineClientAction,
  type ClientActionState
} from "@/lib/actions/clients";

const initialState: ClientActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Letrehozas..." : "Offline kliens letrehozasa"}
    </button>
  );
}

export default function OfflineClientForm() {
  const [state, action] = useFormState(createOfflineClientAction, initialState);

  return (
    <form action={action} className="stack" noValidate>
      {state.error ? <div className="error">{state.error}</div> : null}
      {state.success ? <div className="notice">{state.success}</div> : null}
      <div className="stack">
        <label htmlFor="fullName">Teljes nev</label>
        <input id="fullName" name="fullName" type="text" />
      </div>
      <div className="stack">
        <label htmlFor="email">Email (opcionalis)</label>
        <input id="email" name="email" type="email" autoComplete="email" />
      </div>
      <SubmitButton />
    </form>
  );
}
