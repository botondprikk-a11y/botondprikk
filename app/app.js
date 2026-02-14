const sidebar = document.getElementById("appSidebar");
const topbar = document.getElementById("appTopbar");
const shell = document.getElementById("appShell");
const page = document.body.dataset.page || "";

const sidebarHtml = `
  <div class="brand">
    <span class="brand-mark">E+</span>
    <span class="brand-text">Energize</span>
  </div>
  <nav class="side-nav">
    <a data-page="dashboard" href="dashboard.html">Dashboard</a>
    <a data-page="clients" href="clients.html">Vendégek</a>
    <a data-page="settings" href="settings.html">Beállítások</a>
    <a data-page="billing" href="billing.html">Billing</a>
  </nav>
`;

const topbarHtml = `
  <div class="topbar-left">
    <button class="btn ghost" id="menuToggle" type="button">Menü</button>
    <input class="search" type="search" placeholder="Keresés vendégre" />
  </div>
  <div class="topbar-right">
    <div class="filter-group">
      <button class="filter-btn" type="button">Ma</button>
      <button class="filter-btn" type="button">Hét</button>
      <button class="filter-btn" type="button">Hónap</button>
    </div>
    <div class="profile-chip">KM</div>
  </div>
`;

if (sidebar) {
  sidebar.innerHTML = sidebarHtml;
}

if (topbar) {
  topbar.innerHTML = topbarHtml;
}

const setActiveNav = () => {
  const links = document.querySelectorAll(".side-nav a");
  links.forEach((link) => {
    link.classList.toggle("active", link.dataset.page === page);
  });
};

const menuToggle = document.getElementById("menuToggle");
if (menuToggle && shell) {
  menuToggle.addEventListener("click", () => {
    shell.classList.toggle("sidebar-open");
  });
}

setActiveNav();

const badgeClass = (level) => {
  const map = {
    ok: "badge-ok",
    warn: "badge-warn",
    critical: "badge-critical",
    info: "badge"
  };
  return map[level] || "badge";
};

const renderDashboard = (data) => {
  const kpiGrid = document.getElementById("kpiGrid");
  const revenueChart = document.getElementById("revenueChart");
  const hoursChart = document.getElementById("hoursChart");
  const calendarGrid = document.getElementById("calendarGrid");
  const sessionList = document.getElementById("sessionList");
  const revenueTotal = document.getElementById("revenueTotal");
  const revenueTrend = document.getElementById("revenueTrend");
  const hoursTotal = document.getElementById("hoursTotal");
  const hoursTrend = document.getElementById("hoursTrend");
  const calendarRange = document.getElementById("calendarRange");
  const viewButtons = document.querySelectorAll(".view-toggle button");
  const addSessionBtn = document.getElementById("addSessionBtn");
  const addSessionBtnAlt = document.getElementById("addSessionBtnAlt");
  const sessionModal = document.getElementById("sessionModal");

  if (!kpiGrid || !revenueChart || !hoursChart || !calendarGrid || !sessionList) {
    return;
  }

  kpiGrid.innerHTML = data.kpis
    .map(
      (kpi) => `
        <div class="card kpi-card">
          <div class="kpi-label">${kpi.label}</div>
          <div class="kpi-value">${kpi.value}</div>
          <div class="kpi-meta">
            <span>${kpi.note}</span>
            <span>${kpi.delta}</span>
          </div>
        </div>
      `
    )
    .join("");

  if (revenueTotal) {
    revenueTotal.textContent = data.revenueSummary;
  }

  if (revenueTrend) {
    revenueTrend.textContent = data.revenueTrend;
  }

  if (hoursTotal) {
    hoursTotal.textContent = data.hoursSummary;
  }

  if (hoursTrend) {
    hoursTrend.textContent = data.hoursTrend;
  }

  const renderChart = (element, series) => {
    const max = Math.max(...series, 1);
    element.innerHTML = series
      .map((value) => `<span style="height:${Math.round((value / max) * 100)}%"></span>`)
      .join("");
  };

  renderChart(revenueChart, data.revenueSeries);
  renderChart(hoursChart, data.hoursSeries);

  const renderCalendar = (view) => {
    const dataSet = view === "day" ? data.calendarDay : data.calendarWeek;
    if (calendarRange) {
      calendarRange.textContent = view === "day" ? data.calendarLabelDay : data.calendarLabelWeek;
    }
    calendarGrid.classList.toggle("day-view", view === "day");
    calendarGrid.innerHTML = dataSet
      .map(
        (day) => `
          <div class="calendar-day">
            <span class="calendar-label">${day.label}</span>
            <strong>${day.count}</strong>
            <span class="calendar-meta">${day.meta || day.date}</span>
          </div>
        `
      )
      .join("");
  };

  const setCalendarView = (view) => {
    viewButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === view);
    });
    renderCalendar(view);
  };

  if (viewButtons.length) {
    viewButtons.forEach((btn) => {
      btn.addEventListener("click", () => setCalendarView(btn.dataset.view));
    });
  }

  setCalendarView("week");

  const statusOptions = [
    { label: "Megtartva", value: "Megtartva", level: "ok" },
    { label: "Lemondva", value: "Lemondva", level: "critical" },
    { label: "Lemondva 24 órán belül", value: "Lemondva 24 órán belül", level: "warn" },
    { label: "No-show", value: "No-show", level: "critical" }
  ];

  sessionList.innerHTML = data.offlineSessions
    .map(
      (session, index) => `
        <div class="session-item" data-session-index="${index}">
          <button class="session-name" type="button">${session.name}</button>
          <span class="session-time">${session.time}</span>
          <span class="badge ${badgeClass(session.level)}">${session.status}</span>
          <button class="btn ghost btn-sm status-toggle" type="button">Állapot</button>
          <div class="status-menu">
            ${statusOptions
              .map(
                (opt) =>
                  `<button type="button" data-value="${opt.value}" data-level="${opt.level}">${opt.label}</button>`
              )
              .join("")}
            <button type="button" data-action="note">Megjegyzés hozzáadása</button>
          </div>
          <div class="session-note">
            <textarea rows="3" placeholder="Megjegyzés...">${session.note || ""}</textarea>
            <div class="session-note-actions">
              <button class="btn ghost btn-sm note-cancel" type="button">Mégse</button>
              <button class="btn primary btn-sm note-save" type="button">Mentés</button>
            </div>
          </div>
          ${session.note ? `<div class="session-note-preview">Megjegyzés: ${session.note}</div>` : ""}
        </div>
      `
    )
    .join("");

  const toggleModal = (open) => {
    if (!sessionModal) return;
    sessionModal.hidden = !open;
  };

  if (addSessionBtn) {
    addSessionBtn.addEventListener("click", () => toggleModal(true));
  }

  if (addSessionBtnAlt) {
    addSessionBtnAlt.addEventListener("click", () => toggleModal(true));
  }

  if (sessionModal) {
    sessionModal.addEventListener("click", (event) => {
      if (event.target.matches("[data-close]") || event.target === sessionModal) {
        toggleModal(false);
      }
      if (event.target.matches("[data-save]")) {
        toggleModal(false);
      }
    });
  }

  const closeMenus = () => {
    document.querySelectorAll(".session-item.open").forEach((item) => {
      item.classList.remove("open");
    });
  };

  sessionList.addEventListener("click", (event) => {
    const toggle = event.target.closest(".status-toggle");
    const sessionName = event.target.closest(".session-name");
    const menuButton = toggle || sessionName;
    const sessionItem = event.target.closest(".session-item");

    if (menuButton && sessionItem) {
      const isOpen = sessionItem.classList.contains("open");
      closeMenus();
      sessionItem.classList.toggle("open", !isOpen);
      return;
    }

    const option = event.target.closest(".status-menu button");
    if (option && sessionItem) {
      if (option.dataset.action === "note") {
        sessionItem.classList.add("note-open");
        sessionItem.classList.remove("open");
        return;
      }
      const badge = sessionItem.querySelector(".badge");
      badge.textContent = option.dataset.value;
      badge.className = `badge ${badgeClass(option.dataset.level)}`;
      sessionItem.classList.remove("open");
    }

    if (event.target.closest(".note-cancel") && sessionItem) {
      sessionItem.classList.remove("note-open");
    }

    if (event.target.closest(".note-save") && sessionItem) {
      const textarea = sessionItem.querySelector(".session-note textarea");
      const preview = sessionItem.querySelector(".session-note-preview");
      const text = textarea ? textarea.value.trim() : "";
      if (text) {
        if (preview) {
          preview.textContent = `Megjegyzés: ${text}`;
        } else {
          const noteEl = document.createElement("div");
          noteEl.className = "session-note-preview";
          noteEl.textContent = `Megjegyzés: ${text}`;
          sessionItem.appendChild(noteEl);
        }
      }
      sessionItem.classList.remove("note-open");
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".session-item")) {
      closeMenus();
    }
  });
};

const renderClients = (data) => {
  const table = document.getElementById("clientsTable");
  const empty = document.getElementById("clientsEmpty");
  const search = document.getElementById("clientSearch");
  const filterType = document.getElementById("filterType");
  const filterStatus = document.getElementById("filterStatus");
  const filterCheckin = document.getElementById("filterCheckin");
  const filterPass = document.getElementById("filterPass");

  if (!table || !empty) return;

  const applyFilters = () => {
    let items = [...data.clients];

    const query = search?.value?.toLowerCase() || "";
    if (query) {
      items = items.filter((client) => client.name.toLowerCase().includes(query));
    }

    if (filterType?.value) {
      items = items.filter((client) => client.type === filterType.value);
    }

    if (filterStatus?.value) {
      items = items.filter((client) => client.paymentStatus === filterStatus.value);
    }

    if (filterCheckin?.value) {
      items = items.filter((client) => client.checkinStatus === filterCheckin.value);
    }

    if (filterPass?.value === "low") {
      items = items.filter((client) => Number(client.sessionsLeft) <= 1);
    }

    if (filterPass?.value === "expired") {
      items = items.filter((client) => client.sessionsLeft === "Lejárt");
    }

    table.innerHTML = items
      .map(
        (client) => `
          <tr>
            <td><a href="client.html?id=${client.id}">${client.name}</a></td>
            <td><span class="badge ${client.type === "Online" ? "badge-ok" : "badge"}">${client.type}</span></td>
            <td>${client.checkinStatus}</td>
            <td>${client.sessionsLeft}</td>
            <td>${client.lastActivityDate}</td>
            <td><span class="badge ${client.paymentStatus === "Késés" ? "badge-critical" : client.paymentStatus === "Esedékes" ? "badge-warn" : "badge-ok"}">${client.paymentStatus}</span></td>
          </tr>
        `
      )
      .join("");

    empty.hidden = items.length !== 0;
  };

  applyFilters();

  [search, filterType, filterStatus, filterCheckin, filterPass].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", applyFilters);
    el.addEventListener("change", applyFilters);
  });
};

const renderClient = (data) => {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id")) || data.clients[0]?.id;
  const client = data.clients.find((item) => item.id === id) || data.clients[0];

  if (!client) return;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("clientName", client.name);
  setText("clientMeta", `${client.type} vendég`);
  setText("clientType", client.type);
  setText("clientCheckin", client.checkinStatus);
  setText("clientPayment", client.paymentStatus);
  setText("clientSessions", client.sessionsLeft);
  setText("clientLast", client.lastActivityDate);
  setText("clientKcal", `${client.macroSeries.kcal} kcal`);
  setText("clientMacros", `P ${client.macroSeries.p}g · C ${client.macroSeries.c}g · F ${client.macroSeries.f}g`);
  setText("clientCheckinStatus", client.checkinStatus);

  const chart = document.getElementById("weightChart");
  if (chart) {
    chart.innerHTML = client.weightSeries
      .map((value) => `<span style="height:${value}%"></span>`)
      .join("");
  }
};

const data = window.MOCK_DATA;
if (data) {
  if (page === "dashboard") {
    renderDashboard(data);
  }
  if (page === "clients") {
    renderClients(data);
  }
  if (page === "client") {
    renderClient(data);
  }
}
