"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  createCalendarEventAction,
  type CalendarActionState
} from "@/lib/actions/calendar";

type ClientOption = {
  id: string;
  fullName: string;
  type: "ONLINE" | "OFFLINE";
  email: string | null;
};

type CreateEventModalProps = {
  clients: ClientOption[];
};

const initialState: CalendarActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Letrehozas..." : "Esemeny letrehozasa"}
    </button>
  );
}

export default function CreateEventModal({ clients }: CreateEventModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, action] = useFormState(createCalendarEventAction, initialState);

  useEffect(() => {
    if (state.success) {
      setIsOpen(false);
    }
  }, [state.success]);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Uj esemeny
      </button>
      {isOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Uj esemeny</h3>
              <button
                type="button"
                className="ghost"
                onClick={() => setIsOpen(false)}
              >
                Zaras
              </button>
            </div>
            <form action={action} className="stack" noValidate>
              {state.error ? <div className="error">{state.error}</div> : null}
              <div className="stack">
                <label htmlFor="clientId">Kliens</label>
                <select id="clientId" name="clientId" required>
                  <option value="">Valassz klienst</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.fullName} (
                      {client.type === "ONLINE" ? "online" : "offline"})
                      {client.email ? "" : " - nincs email"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="stack">
                <label htmlFor="title">Cim</label>
                <input id="title" name="title" type="text" />
              </div>
              <div className="grid">
                <div className="stack">
                  <label htmlFor="date">Datum</label>
                  <input id="date" name="date" type="date" />
                </div>
                <div className="stack">
                  <label htmlFor="time">Idopont</label>
                  <input id="time" name="time" type="time" />
                </div>
              </div>
              <div className="stack">
                <label htmlFor="durationMinutes">Hossz (perc)</label>
                <input
                  id="durationMinutes"
                  name="durationMinutes"
                  type="number"
                  min="15"
                  defaultValue="60"
                />
              </div>
              <div className="stack">
                <label>
                  <input type="checkbox" name="workoutReminder" />
                  Holnap edzes email
                </label>
                <label>
                  <input type="checkbox" name="paymentReminder" />
                  Fizetes esedekes email
                </label>
              </div>
              <SubmitButton />
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
