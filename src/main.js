const { invoke } = window.__TAURI__.core;

let greetInputEl;
let greetMsgEl;

async function greet() {
  greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
}

window.addEventListener("DOMContentLoaded", () => {
  const sidebarEl = document.querySelector("#sidebar");
  const sidebarToggleEl = document.querySelector("#sidebar-toggle");
  const analyticsGroupEl = document.querySelector("#analytics-group");
  const analyticsTriggerEl = document.querySelector("#analytics-trigger");
  const navLinks = document.querySelectorAll(".nav-link[data-page]");
  const pages = document.querySelectorAll(".page");
  const pageTitleEl = document.querySelector("#page-title");

  const pageTitles = {
    overview: "Genel Bakis",
    apps: "Uygulama Kullanimi",
    hourly: "Saatlik Trend",
    focus: "Odak Oturumlari",
    goals: "Hedefler",
    notes: "Notlar",
  };

  if (sidebarToggleEl && sidebarEl) {
    sidebarToggleEl.addEventListener("click", () => {
      sidebarEl.classList.toggle("collapsed");
    });
  }

  if (analyticsTriggerEl && analyticsGroupEl) {
    analyticsTriggerEl.addEventListener("click", () => {
      const isOpen = analyticsGroupEl.classList.toggle("open");
      analyticsTriggerEl.setAttribute("aria-expanded", String(isOpen));
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const pageKey = link.dataset.page;
      if (!pageKey) return;

      navLinks.forEach((item) => item.classList.remove("active"));
      link.classList.add("active");

      pages.forEach((page) => page.classList.remove("active"));
      const targetPage = document.querySelector(`#page-${pageKey}`);
      if (targetPage) targetPage.classList.add("active");

      if (pageTitleEl && pageTitles[pageKey]) {
        pageTitleEl.textContent = pageTitles[pageKey];
      }
    });
  });

  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  const greetForm = document.querySelector("#greet-form");

  if (greetForm && greetInputEl && greetMsgEl) {
    greetForm.addEventListener("submit", (e) => {
      e.preventDefault();
      greet();
    });
  }
});
