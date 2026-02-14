import { requireTrainer } from "@/lib/auth";
import { db } from "@/lib/db";
import CreateEventModal from "./CreateEventModal";
import GoogleConnectForm from "./GoogleConnectForm";
import MarkDoneForm from "./MarkDoneForm";

type CalendarPageProps = {
  searchParams?: { view?: string };
};

function startOfWeek(date: Date) {
  const current = new Date(date);
  const day = (current.getDay() + 6) % 7;
  current.setDate(current.getDate() - day);
  current.setHours(0, 0, 0, 0);
  return current;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDateTime(value: Date) {
  return value.toLocaleString("hu-HU", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

export default async function CalendarPage({
  searchParams
}: CalendarPageProps) {
  const { trainer } = await requireTrainer();
  const view = searchParams?.view === "list" ? "list" : "week";

  const clients = await db.client.findMany({
    where: { trainerId: trainer.id },
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      type: true,
      email: true
    }
  });

  const weekStart = startOfWeek(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  const weekEndDisplay = new Date(weekEnd);
  weekEndDisplay.setDate(weekEnd.getDate() - 1);

  const events = await db.calendarEvent.findMany({
    where: {
      trainerId: trainer.id,
      startsAt: {
        gte: weekStart,
        lt: weekEnd
      }
    },
    include: {
      client: {
        select: {
          fullName: true,
          type: true
        }
      }
    },
    orderBy: {
      startsAt: "asc"
    }
  });

  const eventsByDay = new Map<string, typeof events>();
  for (const event of events) {
    const key = dayKey(event.startsAt);
    const existing = eventsByDay.get(key) ?? [];
    existing.push(event);
    eventsByDay.set(key, existing);
  }

  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });

  const googleAccount = await db.trainerGoogleAccount.findUnique({
    where: { trainerId: trainer.id }
  });

  return (
    <section className="stack">
      <div className="topbar">
        <div>
          <strong>Naptar</strong>
          <div className="muted">
            Heti nezet: {weekStart.toLocaleDateString("hu-HU")} -{" "}
            {weekEndDisplay.toLocaleDateString("hu-HU")}
          </div>
        </div>
        <CreateEventModal clients={clients} />
      </div>

      <div className="panel">
        <h3>Google Naptar osszekotes</h3>
        <p className="muted">
          Az osszekotes utan az esemenyek felkerulnek a Google Naptarba. A
          szinkron statuszt az esemenyeknel latod.
        </p>
        <GoogleConnectForm
          connectedEmail={googleAccount?.email ?? null}
          calendarId={googleAccount?.calendarId ?? null}
        />
      </div>

      <div className="panel">
        <div className="grid">
          <a
            className="ghost"
            href="/app/trainer/calendar?view=week"
            aria-current={view === "week" ? "page" : undefined}
          >
            Heti nezet
          </a>
          <a
            className="ghost"
            href="/app/trainer/calendar?view=list"
            aria-current={view === "list" ? "page" : undefined}
          >
            Lista nezet
          </a>
        </div>
      </div>

      {view === "week" ? (
        <div className="grid">
          {days.map((date) => {
            const key = dayKey(date);
            const dayEvents = eventsByDay.get(key) ?? [];
            return (
              <div key={key} className="panel">
                <strong>{date.toLocaleDateString("hu-HU")}</strong>
                {dayEvents.length === 0 ? (
                  <div className="empty">Nincs esemeny.</div>
                ) : (
                  <div className="stack">
                    {dayEvents.map((event) => (
                      <div key={event.id} className="panel">
                        <div>
                          <strong>{event.title}</strong>
                          <div className="muted">
                            {formatDateTime(event.startsAt)} -{" "}
                            {formatDateTime(event.endsAt)}
                          </div>
                          <div className="muted">
                            {event.client.fullName} (
                            {event.client.type === "ONLINE"
                              ? "online"
                              : "offline"}
                            )
                          </div>
                          <div className="muted">
                            Google: {event.googleSyncStatus}
                            {event.googleSyncError
                              ? ` - ${event.googleSyncError}`
                              : ""}
                          </div>
                        </div>
                        <MarkDoneForm
                          eventId={event.id}
                          isDone={event.status === "DONE"}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="panel stack">
          <h3>Heti lista</h3>
          {events.length === 0 ? (
            <div className="empty">Nincs esemeny.</div>
          ) : (
            <div className="stack">
              {events.map((event) => (
                <div key={event.id} className="panel">
                  <div className="stack">
                    <div>
                      <strong>{event.title}</strong>
                      <div className="muted">
                        {formatDateTime(event.startsAt)} -{" "}
                        {formatDateTime(event.endsAt)}
                      </div>
                      <div className="muted">
                        {event.client.fullName} (
                        {event.client.type === "ONLINE" ? "online" : "offline"}
                        )
                      </div>
                      <div className="muted">
                        Statusz: {event.status}
                        {event.paymentDue ? " | Fizetes esedekes" : ""}
                      </div>
                      <div className="muted">
                        Reminder:{" "}
                        {event.workoutReminderStatus ?? "nincs"} /{" "}
                        {event.paymentReminderStatus ?? "nincs"}
                      </div>
                      <div className="muted">
                        Google: {event.googleSyncStatus}
                        {event.googleSyncError
                          ? ` - ${event.googleSyncError}`
                          : ""}
                      </div>
                    </div>
                    <MarkDoneForm
                      eventId={event.id}
                      isDone={event.status === "DONE"}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
