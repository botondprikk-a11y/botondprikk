# Szemelyi edzo platform - PROJECT_SPEC (MVP)

## Cel es alapelvek
- Magyar nyelvu, multi-tenant platform.
- 1 edzo = 1 fiok; az edzo meghiv online klienseket emaillel.
- Offline klienseknek nincs login.
- Online kliens csak a sajat adatait latja.
- Edzo csak a sajat kliensei adatait latja.
- Stabil adatmodell, modularis felepites, kesobb bovitheto.
- Minden domain adat trainerId-hoz kotott es ezen szurt.

## Stack
- Next.js App Router + TypeScript
- PostgreSQL + Prisma
- Auth (edzo, kliens, admin szerepkorok)

## MVP funkciok
### Edzo
- Dashboard
- Kliensek: online/offline
- Platform naptar
- Esemennyel letrehozasa
- "Megtartott" pipa
- Fizetes esedekes jelzes
- Email emlekeztetok
- Google Calendar egyiranyu szinkron

### Online kliens
- Edzes inditas tervbol
- Heavy-szeru logolas (szettek, reps, suly, utolso alkalom mutatasa)
- Napi kaja es meres log
- Heti check-in fix kerdesekkel
- Opcionis progress foto link

### Hozzaferes lejarat
- Lejart allapotban csak "lejart" kepernyo.

### Elsofizetes es szamlazas
- Edzo fizet a platformnak, automata szamlazas Szamlazz.hu integracioval.
- Kliens fizetes platformon kivul tortenik.
- Edzo manualisan hosszabbit hozzaferest.

### Admin
- Edzok listaja
- Csomag
- Szamlazasi log

## Non-goals (MVP-ben nem resz)
- Nincs extra funkcio, ami nem szerepel a fenti listaban.

## Jogosultsagok es tenancy
- Minden domain entitas tartalmaz `trainerId`-t.
- Minden lekerdezes trainerId-alapu, role szerinti szures.
- Online kliens: csak a sajat `clientId`-hez tartozo adatokat latja.
- Offline kliens: nincs user/login.
- Admin: edzok listaja es szamlazasi logok, cross-tenant betekintes (csak olvasas).

## Modulok (logikai bontas)
- Auth es szerepkorok
- Edzo dashboard
- Kliens kezeles (online/offline, meghivo)
- Naptar es esemenyek
- Edzes tervek es naplozas
- Napi kaja es meres log
- Heti check-in
- Hozzaferes kezeles (lejart/allapot)
- Szamlazas (Szamlazz.hu) es admin

## Adatmodell (tervezet, Prisma)
Megjegyzes: Az auth provider sajat tablai (User/Account/Session) lehetnek kivetelek, de minden domain tabla tartalmaz trainerId-t.

### Alap szerepkorok
- Role: TRAINER | CLIENT | ADMIN

### Trainer
- id (PK)
- userId (FK -> User)
- status (ACTIVE | SUSPENDED)
- plan (FREE | PRO | ENTERPRISE)
- billingCustomerId (Szamlazz.hu azonosito)
- createdAt, updatedAt

### Client
- id (PK)
- trainerId (FK -> Trainer)
- userId (FK -> User, nullable; csak online kliens)
- type (ONLINE | OFFLINE)
- status (ACTIVE | EXPIRED)
- fullName
- email (nullable; offline kliensnel ures)
- accessEndsAt (datum)
- createdAt, updatedAt

### Invitation
- id (PK)
- trainerId (FK -> Trainer)
- email
- token
- status (PENDING | ACCEPTED | EXPIRED | REVOKED)
- expiresAt
- createdAt

### CalendarEvent
- id (PK)
- trainerId (FK -> Trainer)
- clientId (FK -> Client, nullable)
- title
- startsAt, endsAt
- status (PLANNED | DONE | CANCELED)
- paymentDue (boolean)
- reminderStatus (PENDING | SENT | FAILED)
- googleEventId (nullable)
- lastSyncedAt (nullable)
- createdAt, updatedAt

### WorkoutPlan
- id (PK)
- trainerId (FK -> Trainer)
- clientId (FK -> Client)
- title
- notes (nullable)
- createdAt, updatedAt

### WorkoutPlanItem
- id (PK)
- trainerId (FK -> Trainer)
- planId (FK -> WorkoutPlan)
- orderIndex
- exerciseName
- targetSets (nullable)
- targetReps (nullable)
- targetWeight (nullable)

### WorkoutSession
- id (PK)
- trainerId (FK -> Trainer)
- clientId (FK -> Client)
- planId (FK -> WorkoutPlan, nullable)
- status (IN_PROGRESS | COMPLETED)
- startedAt, endedAt (nullable)
- createdAt, updatedAt

### WorkoutSet
- id (PK)
- trainerId (FK -> Trainer)
- sessionId (FK -> WorkoutSession)
- exerciseName
- setNumber
- reps
- weight
- isCompleted (boolean)

### FoodLogDay
- id (PK)
- trainerId (FK -> Trainer)
- clientId (FK -> Client)
- date
- notes (nullable)
- createdAt, updatedAt

### MeasurementLog
- id (PK)
- trainerId (FK -> Trainer)
- clientId (FK -> Client)
- date
- type (WEIGHT | WAIST | HIP | CHEST | OTHER)
- value
- unit

### WeeklyCheckIn
- id (PK)
- trainerId (FK -> Trainer)
- clientId (FK -> Client)
- weekStart (datum)
- answersJson (string/JSON)
- progressPhotoUrl (nullable)
- createdAt

### TrainerSubscription
- id (PK)
- trainerId (FK -> Trainer)
- status (ACTIVE | PAST_DUE | CANCELED)
- plan (FREE | PRO | ENTERPRISE)
- currentPeriodEnd
- createdAt, updatedAt

### InvoiceLog
- id (PK)
- trainerId (FK -> Trainer)
- provider (SZAMLAZZ_HU)
- providerInvoiceId
- amount
- currency
- status (ISSUED | FAILED | VOID)
- createdAt

## UI kovetelmenyek
- Minden listaban legyen ures allapot.
- Hibakezeles minden kritikusan fontos muveletnel (UI uzenet).
- Lejart hozzaferesnel dedikalt "lejart" kepernyo.

## Megvalositasra vonatkozo kotelezettsegek
- Prisma schema valtozasnal mindig add migrationt.
- Az adatokat mindig trainerId-ra szurjuk.
