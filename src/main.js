const { invoke } = window.__TAURI__.core;

let greetInputEl;
let greetMsgEl;
let activeDictionary = {};
let translationsConfig = null;

const LANGUAGE_STORAGE_KEY = "screen-time-language";
const THEME_STORAGE_KEY = "screen-time-theme";

function translate(key) {
  return activeDictionary[key] ?? key;
}

function applyTranslations() {
  const textNodes = document.querySelectorAll("[data-i18n]");
  textNodes.forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (!key) return;
    node.textContent = translate(key);
  });

  const placeholderNodes = document.querySelectorAll("[data-i18n-placeholder]");
  placeholderNodes.forEach((node) => {
    const key = node.getAttribute("data-i18n-placeholder");
    if (!key) return;
    node.setAttribute("placeholder", translate(key));
  });
}

async function loadTranslations() {
  try {
    const response = await fetch("/i18n.json");
    if (!response.ok) return null;

    const i18nConfig = await response.json();
    translationsConfig = i18nConfig;
    return i18nConfig;
  } catch {
    // Keep static English text if translation loading fails.
    return null;
  }
}

function updatePageTitle(pageTitleEl, pageTitleKeys) {
  if (!pageTitleEl) return;
  const activePageKey = document.querySelector(".nav-link.active")?.dataset.page;
  if (!activePageKey) return;
  const titleKey = pageTitleKeys[activePageKey];
  if (!titleKey) return;
  pageTitleEl.textContent = translate(titleKey);
}

function setLanguage(languageCode, pageTitleEl, pageTitleKeys) {
  const availableTranslations = translationsConfig?.translations || {};
  const fallbackLanguage = translationsConfig?.defaultLanguage || "en";

  if (!availableTranslations[languageCode]) {
    languageCode = fallbackLanguage;
  }

  activeDictionary = availableTranslations[languageCode] || {};
  applyTranslations();
  updatePageTitle(pageTitleEl, pageTitleKeys);
  localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
}

function setTheme(theme, themeButtons) {
  const resolvedTheme = theme === "black" ? "black" : "white";
  document.body.setAttribute("data-theme", resolvedTheme);
  localStorage.setItem(THEME_STORAGE_KEY, resolvedTheme);

  themeButtons.forEach((button) => {
    const buttonTheme = button.getAttribute("data-theme-option");
    const isActive = buttonTheme === resolvedTheme;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

async function greet() {
  greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
}

window.addEventListener("DOMContentLoaded", async () => {
  const sidebarEl = document.querySelector("#sidebar");
  const sidebarToggleEl = document.querySelector("#sidebar-toggle");
  const analyticsGroupEl = document.querySelector("#analytics-group");
  const analyticsTriggerEl = document.querySelector("#analytics-trigger");
  const navLinks = document.querySelectorAll(".nav-link[data-page]");
  const pages = document.querySelectorAll(".page");
  const pageTitleEl = document.querySelector("#page-title");
  const languageSelectEl = document.querySelector("#language-select");
  const themeButtons = document.querySelectorAll(".theme-btn");

  const pageTitleKeys = {
    overview: "pages.overview",
    apps: "pages.apps",
    hourly: "pages.hourly",
    focus: "pages.focus",
    goals: "pages.goals",
    notes: "pages.notes",
    settings: "pages.settings",
  };

  const preferredTheme = localStorage.getItem(THEME_STORAGE_KEY) || "white";
  setTheme(preferredTheme, themeButtons);

  const i18nConfig = await loadTranslations();
  if (i18nConfig) {
    const defaultLanguage = i18nConfig.defaultLanguage || "en";
    const preferredLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || defaultLanguage;
    setLanguage(preferredLanguage, pageTitleEl, pageTitleKeys);

    if (languageSelectEl) {
      languageSelectEl.value = preferredLanguage;
    }
  }

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

      updatePageTitle(pageTitleEl, pageTitleKeys);
    });
  });

  if (languageSelectEl) {
    languageSelectEl.addEventListener("change", (event) => {
      const selectedLanguage = event.target.value;
      setLanguage(selectedLanguage, pageTitleEl, pageTitleKeys);
    });
  }

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedTheme = button.getAttribute("data-theme-option");
      setTheme(selectedTheme, themeButtons);
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
