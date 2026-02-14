"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  updateClientStatusAction,
  type ClientActionState
} from "@/lib/actions/clients";

type ClientStatusFormProps = {
  clientId: string;
  status: "ACTIVE" | "EXPIRED";
};

const initialState: ClientActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Mentes..." : "Statusz mentese"}
    </button>
  );
}

export default function ClientStatusForm({
  clientId,
  status
}: ClientStatusFormProps) {
  const [state, action] = useFormState(updateClientStatusAction, initialState);

  return (
    <form action={action} className="stack" noValidate>
      <input type="hidden" name="clientId" value={clientId} />
      {state.error ? <div className="error">{state.error}</div> : null}
      {state.success ? <div className="notice">{state.success}</div> : null}
      <div className="stack">
        <label htmlFor="status">Hozzaferes statusz</label>
        <select id="status" name="status" defaultValue={status}>
          <option value="ACTIVE">Aktiv</option>
          <option value="EXPIRED">Lejart</option>
        </select>
      </div>
      <SubmitButton />
    </form>
  );
}
