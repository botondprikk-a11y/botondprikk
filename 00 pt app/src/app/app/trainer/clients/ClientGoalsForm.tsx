"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  updateClientGoalsAction,
  type ClientActionState
} from "@/lib/actions/clients";

type ClientGoalsFormProps = {
  clientId: string;
  initialGoals: {
    kcalGoal: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
  };
};

const initialState: ClientActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Mentes..." : "Celok mentese"}
    </button>
  );
}

export default function ClientGoalsForm({
  clientId,
  initialGoals
}: ClientGoalsFormProps) {
  const [state, action] = useFormState(updateClientGoalsAction, initialState);

  return (
    <form action={action} className="stack" noValidate>
      <input type="hidden" name="clientId" value={clientId} />
      {state.error ? <div className="error">{state.error}</div> : null}
      {state.success ? <div className="notice">{state.success}</div> : null}
      <div className="grid">
        <div className="stack">
          <label htmlFor="kcalGoal">Kaloria cel (kcal)</label>
          <input
            id="kcalGoal"
            name="kcalGoal"
            type="number"
            min="0"
            defaultValue={initialGoals.kcalGoal ?? ""}
          />
        </div>
        <div className="stack">
          <label htmlFor="proteinG">Protein (g)</label>
          <input
            id="proteinG"
            name="proteinG"
            type="number"
            min="0"
            defaultValue={initialGoals.proteinG ?? ""}
          />
        </div>
        <div className="stack">
          <label htmlFor="carbsG">Szenhidrat (g)</label>
          <input
            id="carbsG"
            name="carbsG"
            type="number"
            min="0"
            defaultValue={initialGoals.carbsG ?? ""}
          />
        </div>
        <div className="stack">
          <label htmlFor="fatG">Zsir (g)</label>
          <input
            id="fatG"
            name="fatG"
            type="number"
            min="0"
            defaultValue={initialGoals.fatG ?? ""}
          />
        </div>
      </div>
      <SubmitButton />
    </form>
  );
}
