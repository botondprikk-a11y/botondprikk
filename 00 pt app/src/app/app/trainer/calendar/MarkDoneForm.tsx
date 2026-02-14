"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  markCalendarEventDoneAction,
  type CalendarActionState
} from "@/lib/actions/calendar";

type MarkDoneFormProps = {
  eventId: string;
  isDone: boolean;
};

const initialState: CalendarActionState = {};

function SubmitButton({ isDone }: { isDone: boolean }) {
  const { pending } = useFormStatus();
  if (isDone) {
    return <span className="muted">Megtartott</span>;
  }
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Mentve..." : "Megtartott"}
    </button>
  );
}

export default function MarkDoneForm({ eventId, isDone }: MarkDoneFormProps) {
  const [state, action] = useFormState(markCalendarEventDoneAction, initialState);

  return (
    <form action={action} className="stack" noValidate>
      <input type="hidden" name="eventId" value={eventId} />
      {state.error ? <div className="error">{state.error}</div> : null}
      {state.success ? <div className="notice">{state.success}</div> : null}
      <SubmitButton isDone={isDone} />
    </form>
  );
}
