const kpiGrid = document.getElementById("kpiGrid");
const todoList = document.getElementById("todoList");
const guestTable = document.getElementById("guestTable");
const tableWrap = document.getElementById("tableWrap");
const emptyState = document.getElementById("emptyState");
const tabs = document.querySelectorAll(".tab-btn");

const state = {
  data: null,
  tab: "checkin"
};

const badgeClass = (level) => {
  if (!level) return "badge";
  return `badge badge-${level}`;
};

const renderKpis = (items) => {
  kpiGrid.innerHTML = items
    .map(
      (item) => `
        <div class="card kpi-card">
          <div class="kpi-label">${item.label}</div>
          <div class="kpi-value">${item.value}</div>
          <div class="kpi-meta">
            <span>${item.note}</span>
            <span>${item.trend}</span>
          </div>
        </div>
      `
    )
    .join("");
};

const renderTodos = (items) => {
  todoList.innerHTML = items
    .map(
      (item) => `
        <div class="todo-item">
          <div>
            <div class="todo-name">${item.name}</div>
            <div class="todo-meta">Utolso aktivitas: ${item.last}</div>
          </div>
          <div class="todo-actions">
            <span class="${badgeClass(item.level)}">${item.status}</span>
            <button class="btn btn-sm" type="button">${item.action}</button>
          </div>
        </div>
      `
    )
    .join("");
};

const paymentBadge = (status) => {
  const map = {
    Esedekes: "badge-warn",
    Keses: "badge-danger",
    Rendben: "badge-ok"
  };
  return map[status] || "";
};

const renderGuests = (items) => {
  if (!items.length) {
    tableWrap.hidden = true;
    emptyState.hidden = false;
    return;
  }

  tableWrap.hidden = false;
  emptyState.hidden = true;

  guestTable.innerHTML = items
    .map(
      (guest) => `
        <tr>
          <td>${guest.name}</td>
          <td><span class="badge badge-${guest.type === "Online" ? "ok" : "info"}">${guest.type}</span></td>
          <td>${guest.checkin}</td>
          <td>${guest.pass}</td>
          <td>${guest.last}</td>
          <td><span class="badge ${paymentBadge(guest.payment)}">${guest.payment}</span></td>
        </tr>
      `
    )
    .join("");
};

const setActiveTab = (tab) => {
  state.tab = tab;
  tabs.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
  renderTodos(state.data.todos[tab]);
};

const init = (data) => {
  state.data = data;
  renderKpis(data.kpis);
  renderGuests(data.guests.slice(0, 8));
  setActiveTab(state.tab);
};

fetch("data.json")
  .then((res) => res.json())
  .then((data) => {
    init(data);
  })
  .catch(() => {
    kpiGrid.innerHTML = "<div class=\"card pad\">Nem sikerult betolteni az adatokat.</div>";
  });

tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    setActiveTab(btn.dataset.tab);
  });
});
