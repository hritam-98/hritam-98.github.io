"use strict";

document.documentElement.classList.add("has-js");

const menuButton = document.getElementById("mobile-menu-button");
const navigation = document.getElementById("site-navigation");
if (menuButton) menuButton.hidden = false;

function closeMenu() {
  navigation?.classList.remove("is-open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "Open navigation");
}

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") !== "true";
  navigation.classList.toggle("is-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

navigation?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation?.classList.contains("is-open")) {
    closeMenu();
    menuButton?.focus();
  }
});

const mobileBreakpoint = window.matchMedia("(max-width: 760px)");
mobileBreakpoint.addEventListener("change", closeMenu);

const filters = document.getElementById("publication-filters");
const publicationYears = document.querySelectorAll(".publication-year");
const status = document.getElementById("site-status");

if (filters) {
  document.getElementById("publication-toolbar").hidden = false;
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-year]");
    if (!button) return;
    const selectedYear = button.dataset.year;
    filters.querySelectorAll("button").forEach((filter) => {
      filter.setAttribute("aria-pressed", String(filter === button));
    });
    let count = 0;
    publicationYears.forEach((group) => {
      const visible = selectedYear === "all" || group.dataset.year === selectedYear;
      group.hidden = !visible;
      if (visible) count += group.querySelectorAll(".publication").length;
    });
    status.textContent = `${count} selected publications shown${selectedYear === "all" ? "" : ` from ${selectedYear}`}.`;
  });
}

document.querySelectorAll(".panel-toggle").forEach((button) => {
  button.hidden = false;
  button.addEventListener("click", () => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    const willOpen = button.getAttribute("aria-expanded") !== "true";
    button.closest(".publication").querySelectorAll(".panel-toggle").forEach((toggle) => {
      toggle.setAttribute("aria-expanded", "false");
      document.getElementById(toggle.getAttribute("aria-controls")).hidden = true;
    });
    button.setAttribute("aria-expanded", String(willOpen));
    panel.hidden = !willOpen;
  });
});

// Keep abstracts and citations readable when JavaScript is unavailable.
document.querySelectorAll(".paper-panel").forEach((panel) => {
  panel.hidden = true;
});

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // A browser may deny clipboard permission; retain a user-initiated fallback.
    }
  }
  const field = document.createElement("textarea");
  field.value = text;
  field.readOnly = true;
  field.className = "clipboard-field";
  document.body.append(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  return copied;
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.hidden = false;
  button.addEventListener("click", async () => {
    const targetId = button.getAttribute("data-copy");
    const text = targetId === "email"
      ? "hritambasak48@gmail.com"
      : document.getElementById(targetId).textContent;
    const label = button.querySelector("[data-copy-label]");
    const originalLabel = label.textContent;
    try {
      const copied = await copyText(text);
      label.textContent = copied ? "Copied" : "Select to copy";
      status.textContent = copied ? "Copied to clipboard." : "Copy was unavailable. Please select and copy the text.";
    } catch {
      label.textContent = "Select to copy";
      status.textContent = "Copy was unavailable. Please select and copy the text.";
    }
    button.focus({ preventScroll: true });
    window.setTimeout(() => { label.textContent = originalLabel; }, 1800);
  });
});

const footerYear = document.getElementById("footer-year");
if (footerYear) footerYear.textContent = new Date().getFullYear();
