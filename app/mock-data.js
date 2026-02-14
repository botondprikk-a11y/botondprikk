window.MOCK_DATA = {
  revenueSummary: "1 240 000 Ft",
  revenueTrend: "+8% vs előző hónap",
  hoursSummary: "24 óra",
  hoursTrend: "+2 óra vs előző hét",
  revenueSeries: [820000, 940000, 1020000, 980000, 1120000, 1240000],
  hoursSeries: [3, 4, 2, 5, 4, 4, 2],
  calendarLabelWeek: "Hét 6 · 2024.02.05–02.11",
  calendarLabelDay: "2024.02.12 · Hétfő",
  calendarWeek: [
    { label: "Hé", date: "02.05", count: 3 },
    { label: "Ke", date: "02.06", count: 4 },
    { label: "Sze", date: "02.07", count: 2 },
    { label: "Cs", date: "02.08", count: 5 },
    { label: "Pé", date: "02.09", count: 4 },
    { label: "Szo", date: "02.10", count: 3 },
    { label: "Va", date: "02.11", count: 1 }
  ],
  calendarDay: [
    { label: "09:00", count: 1, meta: "Erő + core" },
    { label: "11:00", count: 1, meta: "Mobilitás" },
    { label: "15:00", count: 1, meta: "Állóképesség" },
    { label: "17:00", count: 1, meta: "Funkcionális" }
  ],
  offlineSessions: [
    { name: "Tóth Erika", time: "09:00", status: "Megtartva", level: "ok", note: "Kezdő blokk" },
    { name: "Fazekas Milán", time: "11:00", status: "Lemondva", level: "critical", note: "" },
    { name: "Kiss Lili", time: "15:00", status: "Megtartva", level: "ok", note: "" },
    { name: "Mikó Zsuzsa", time: "17:00", status: "Lemondva 24 órán belül", level: "warn", note: "Új időpont kell" },
    { name: "Papp Levi", time: "18:30", status: "No-show", level: "critical", note: "" }
  ],
  kpis: [
    {
      label: "Aktív vendégek",
      value: 24,
      note: "18 online · 6 offline",
      delta: "+3 ezen a héten"
    },
    {
      label: "Check-in hiányzik (heti)",
      value: 5,
      note: "hétvégén zárul",
      delta: "-2 előző héthez"
    },
    {
      label: "Fizetés esedékes",
      value: 4,
      note: "következő 7 nap",
      delta: "2 késés"
    },
    {
      label: "Lejárt / 1 alkalom maradt",
      value: 3,
      note: "offline bérlet",
      delta: "1 megújítás vár"
    }
  ],
  todos: {
    checkin: [
      { name: "Nagy Dóra", last: "2024-02-10", status: "Hiányzik", level: "warn" },
      { name: "Varga Márton", last: "2024-02-09", status: "Hiányzik", level: "warn" },
      { name: "Kiss Lili", last: "2024-02-11", status: "Emlékeztető", level: "info" },
      { name: "Szabó Adél", last: "2024-02-08", status: "Hiányzik", level: "warn" },
      { name: "Horváth Lilla", last: "2024-02-10", status: "Utolsó nap", level: "critical" }
    ],
    payment: [
      { name: "Tóth Erika", last: "2024-02-12", status: "Késés", level: "critical" },
      { name: "Fazekas Milán", last: "2024-02-13", status: "Esedékes", level: "warn" },
      { name: "Csernai Zsófi", last: "2024-02-15", status: "Esedékes", level: "warn" },
      { name: "Sipos Gábor", last: "2024-02-18", status: "Rendben", level: "ok" },
      { name: "Kertész Ádám", last: "2024-02-12", status: "Esedékes", level: "warn" }
    ],
    pass: [
      { name: "Tóth Erika", last: "1 alkalom", status: "Új bérlet", level: "critical" },
      { name: "Fazekas Milán", last: "Lejárt", status: "Lejárt", level: "critical" },
      { name: "Kiss Lili", last: "2 alkalom", status: "Figyelendő", level: "warn" },
      { name: "Mikó Zsuzsa", last: "1 alkalom", status: "Új bérlet", level: "critical" },
      { name: "Papp Levi", last: "Lejárt", status: "Lejárt", level: "critical" }
    ]
  },
  clients: [
    {
      id: 1,
      name: "Nagy Dóra",
      type: "Online",
      checkinStatus: "Hiányzik",
      sessionsLeft: "-",
      lastActivityDate: "2024-02-10",
      paymentStatus: "Esedékes",
      weightSeries: [71.8, 71.4, 71.2, 70.9, 70.6],
      macroSeries: { kcal: 1850, p: 145, c: 190, f: 60 }
    },
    {
      id: 2,
      name: "Varga Márton",
      type: "Online",
      checkinStatus: "Kész",
      sessionsLeft: "-",
      lastActivityDate: "2024-02-11",
      paymentStatus: "Rendben",
      weightSeries: [82.2, 82.5, 82.7, 83.0, 83.2],
      macroSeries: { kcal: 2600, p: 180, c: 280, f: 70 }
    },
    {
      id: 3,
      name: "Horváth Lilla",
      type: "Online",
      checkinStatus: "Kész",
      sessionsLeft: "-",
      lastActivityDate: "2024-02-11",
      paymentStatus: "Esedékes",
      weightSeries: [65.4, 65.0, 64.8, 64.7, 64.6],
      macroSeries: { kcal: 2100, p: 130, c: 220, f: 55 }
    },
    {
      id: 4,
      name: "Kiss Lili",
      type: "Offline",
      checkinStatus: "-",
      sessionsLeft: "2",
      lastActivityDate: "2024-02-09",
      paymentStatus: "Rendben",
      weightSeries: [60.2, 60.0, 59.8, 59.7, 59.6],
      macroSeries: { kcal: 1750, p: 120, c: 160, f: 50 }
    },
    {
      id: 5,
      name: "Tóth Erika",
      type: "Offline",
      checkinStatus: "-",
      sessionsLeft: "1",
      lastActivityDate: "2024-02-12",
      paymentStatus: "Késés",
      weightSeries: [68.1, 67.9, 67.6, 67.4, 67.2],
      macroSeries: { kcal: 1900, p: 140, c: 200, f: 60 }
    },
    {
      id: 6,
      name: "Fazekas Milán",
      type: "Offline",
      checkinStatus: "-",
      sessionsLeft: "Lejárt",
      lastActivityDate: "2024-02-07",
      paymentStatus: "Esedékes",
      weightSeries: [79.0, 78.7, 78.4, 78.3, 78.1],
      macroSeries: { kcal: 2300, p: 165, c: 240, f: 65 }
    },
    {
      id: 7,
      name: "Szabó Adél",
      type: "Online",
      checkinStatus: "Hiányzik",
      sessionsLeft: "-",
      lastActivityDate: "2024-02-09",
      paymentStatus: "Rendben",
      weightSeries: [62.8, 62.5, 62.4, 62.3, 62.2],
      macroSeries: { kcal: 1800, p: 125, c: 170, f: 55 }
    },
    {
      id: 8,
      name: "Csernai Zsófi",
      type: "Online",
      checkinStatus: "Kész",
      sessionsLeft: "-",
      lastActivityDate: "2024-02-12",
      paymentStatus: "Esedékes",
      weightSeries: [58.4, 58.2, 58.1, 58.0, 57.9],
      macroSeries: { kcal: 1700, p: 110, c: 150, f: 50 }
    },
    {
      id: 9,
      name: "Bíró Soma",
      type: "Online",
      checkinStatus: "Kész",
      sessionsLeft: "-",
      lastActivityDate: "2024-02-11",
      paymentStatus: "Rendben",
      weightSeries: [74.2, 74.0, 73.8, 73.7, 73.5],
      macroSeries: { kcal: 2000, p: 150, c: 210, f: 58 }
    },
    {
      id: 10,
      name: "Kertész Ádám",
      type: "Offline",
      checkinStatus: "-",
      sessionsLeft: "3",
      lastActivityDate: "2024-02-08",
      paymentStatus: "Esedékes",
      weightSeries: [86.2, 86.0, 85.8, 85.6, 85.4],
      macroSeries: { kcal: 2400, p: 170, c: 250, f: 70 }
    },
    {
      id: 11,
      name: "Mikó Zsuzsa",
      type: "Offline",
      checkinStatus: "-",
      sessionsLeft: "1",
      lastActivityDate: "2024-02-10",
      paymentStatus: "Rendben",
      weightSeries: [69.4, 69.1, 68.9, 68.7, 68.5],
      macroSeries: { kcal: 1950, p: 135, c: 205, f: 62 }
    },
    {
      id: 12,
      name: "Papp Levi",
      type: "Online",
      checkinStatus: "Hiányzik",
      sessionsLeft: "-",
      lastActivityDate: "2024-02-07",
      paymentStatus: "Rendben",
      weightSeries: [90.1, 89.9, 89.7, 89.5, 89.3],
      macroSeries: { kcal: 2700, p: 190, c: 300, f: 80 }
    }
  ]
};
