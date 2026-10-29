"use strict";

const DEFAULTS = { enabled: true, theme: "system", lang: "auto" };
const store = chrome.storage.sync || chrome.storage.local;

const $enabled = document.getElementById("enabled");
const $options = document.getElementById("options");
const $status = document.getElementById("status-text");

if (/Mac/.test(navigator.platform)) document.getElementById("kbd").textContent = "⌘ K";

function render(s) {
  $enabled.checked = !!s.enabled;
  $options.setAttribute("aria-disabled", s.enabled ? "false" : "true");
  $status.textContent = s.enabled ? "Đang bật trên fap.fpt.edu.vn" : "Đang tắt, FAP hiển thị như gốc";
  for (const name of ["theme", "lang"]) {
    const input = document.querySelector(`input[name="${name}"][value="${s[name]}"]`);
    if (input) input.checked = true;
  }
}

store.get(DEFAULTS, render);

$enabled.addEventListener("change", () => {
  const patch = { enabled: $enabled.checked };
  store.set(patch);
  store.get(DEFAULTS, render);
});

document.querySelectorAll('input[type="radio"]').forEach((input) => {
  input.addEventListener("change", () => {
    if (input.checked) store.set({ [input.name]: input.value });
  });
});
