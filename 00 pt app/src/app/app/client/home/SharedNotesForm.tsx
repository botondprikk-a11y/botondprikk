"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  updateClientNotesByClientAction,
  type ClientActionState
} from "@/lib/actions/clients";

type SharedNotesFormProps = {
  initialNotes: string | null;
};

const initialState: ClientActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Mentes..." : "Jegyzet mentese"}
    </button>
  );
}

export default function SharedNotesForm({
  initialNotes
}: SharedNotesFormProps) {
  const [state, action] = useFormState(
    updateClientNotesByClientAction,
    initialState
  );

  return (
    <form action={action} className="stack" noValidate>
      {state.error ? <div className="error">{state.error}</div> : null}
      {state.success ? <div className="notice">{state.success}</div> : null}
      <div className="stack">
        <label htmlFor="sharedNotes">Kozos jegyzet</label>
        <textarea
          id="sharedNotes"
          name="sharedNotes"
          rows={6}
          defaultValue={initialNotes || ""}
        />
      </div>
      <SubmitButton />
    </form>
  );
}
