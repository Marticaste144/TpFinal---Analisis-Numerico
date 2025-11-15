import { translations, LANGUAGES } from "./lang.js";

let currentLang = localStorage.getItem("lang") || detectBrowserLang();

function detectBrowserLang() {
  const nav = navigator.language.slice(0, 2);
  return LANGUAGES.includes(nav) ? nav : "es";
}

export function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (translations[currentLang]?.[key]) {
      el.innerHTML = translations[currentLang][key];
    }
  });
}

export function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  applyTranslations();
}

document.addEventListener("DOMContentLoaded", () => {
  const selector = document.getElementById("language");
  if (selector) {
    selector.value = currentLang;
    selector.addEventListener("change", () => setLanguage(selector.value));
  }
  applyTranslations();
});
