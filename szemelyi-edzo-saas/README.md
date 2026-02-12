# EdzőSaaS V1

Egy Next.js (App Router) alapú SaaS MVP személyi edzőknek Magyarországra. Web-only, nincs időpontfoglalás és számlázás.

## Fő funkciók
- Marketing oldal, árak, GYIK, adatkezelés, ÁSZF
- Edző regisztráció és belépés
- Meghívó link vendégeknek (7 nap, egyszer használható)
- Online coaching: edzésterv, napi log, 1RM becslés, táplálkozás, testsúly, check-in, üzenetek
- Offline PT admin: bérletek, alkalmak, lemondások, bevételek
- Havi riportok és figyelmeztetések

## Tech stack
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn-szerű UI komponensek
- Prisma + PostgreSQL (docker-compose)
- Zod validáció
- Email: Resend vagy SMTP
- File upload: local /uploads vagy S3 kompatibilis

## Gyors indítás

1) Környezeti változók
```bash
cp .env.example .env
```

2) PostgreSQL indítása
```bash
docker-compose up -d
```

3) Függőségek
```bash
npm install
```

4) Prisma migráció és seed
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

5) Fejlesztői szerver
```bash
npm run dev
```

## Demo belépések
- Edző: `coach@demo.hu` / `password123`
- Vendég: `client@demo.hu` / `password123`

## Meghívó email
A meghívó linket az edző a Vendégek oldalon küldi. A link 7 napig él.

## Upload beállítás
- **Local (alap)**: `UPLOAD_DRIVER=local`, a fájlok az `uploads/` mappába kerülnek.
- **S3 kompatibilis**: állítsd be `UPLOAD_DRIVER=s3`, `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT` (ha kell), `S3_PUBLIC_URL` (ha publikus URL kell).

## Email beállítás
- **Resend**: `RESEND_API_KEY`
- **SMTP**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- Fejlesztéskor fallback konzol log van.

## Fontos útvonalak
- Public: `/`, `/arak`, `/gyik`, `/adatkezeles`, `/aszf`
- Auth: `/register-coach`, `/login`, `/invite/[token]`
- App (coach): `/app/coach/dashboard`, `/app/coach/clients`, `/app/coach/programs`, `/app/coach/offline`, `/app/coach/reports/monthly`
- App (client): `/app/client/today`, `/app/client/workouts`, `/app/client/nutrition`, `/app/client/progress`, `/app/client/checkin`, `/app/client/messages`

## Megjegyzések
- Role-based route protection middleware + server oldali védelem.
- A coach csak a saját vendégeit látja.
- A client csak a saját adatait éri el.
