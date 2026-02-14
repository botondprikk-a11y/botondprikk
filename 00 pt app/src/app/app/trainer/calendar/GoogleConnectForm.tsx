"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  connectGoogleAction,
  type CalendarActionState
} from "@/lib/actions/calendar";

type GoogleConnectFormProps = {
  connectedEmail: string | null;
  calendarId: string | null;
};

const initialState: CalendarActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Mentve..." : "Osszekotes mentese"}
    </button>
  );
}

export default function GoogleConnectForm({
  connectedEmail,
  calendarId
}: GoogleConnectFormProps) {
  const [state, action] = useFormState(connectGoogleAction, initialState);

  return (
    <form action={action} className="stack" noValidate>
      {state.error ? <div className="error">{state.error}</div> : null}
      {state.success ? <div className="notice">{state.success}</div> : null}
      <div className="stack">
        <label htmlFor="email">Google email (opcionalis)</label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={connectedEmail || ""}
        />
      </div>
      <div className="stack">
        <label htmlFor="calendarId">Calendar ID (opcionalis)</label>
        <input
          id="calendarId"
          name="calendarId"
          type="text"
          defaultValue={calendarId || ""}
        />
      </div>
      <div className="stack">
        <label htmlFor="accessToken">Access token</label>
        <input id="accessToken" name="accessToken" type="password" />
      </div>
      <div className="stack">
        <label htmlFor="refreshToken">Refresh token</label>
        <input id="refreshToken" name="refreshToken" type="password" />
      </div>
      <SubmitButton />
    </form>
  );
}
