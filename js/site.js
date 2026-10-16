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

const mobileBreakpoint = window.matchMedia("(max-width: 900px)");
mobileBreakpoint.addEventListener("change", closeMenu);

const filters = document.getElementById("publication-filters");
const publicationYears = document.querySelectorAll(".publication-year");
const status = document.getElementById("site-status");

if (filters) {
  document.getElementById("publication-toolbar").hidden = false;
  function showYear(selectedYear) {
    filters.querySelectorAll("button").forEach((filter) => {
      filter.setAttribute("aria-pressed", String(filter.dataset.year === selectedYear));
    });
    let count = 0;
    publicationYears.forEach((group) => {
      const visible = selectedYear === "all" || group.dataset.year === selectedYear;
      group.hidden = !visible;
      if (visible) count += group.querySelectorAll(".publication").length;
    });
    status.textContent = `${count} selected publications shown${selectedYear === "all" ? "" : ` from ${selectedYear}`}.`;
  }
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-year]");
    if (button) showYear(button.dataset.year);
  });
  // A research link remains useful after the visitor has selected a different year.
  document.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.getAttribute("href").slice(1));
    const group = target?.closest(".publication-year");
    if (group?.hidden) showYear(group.dataset.year);
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

// Theme preference stays on this device; the page remains usable without it.
const themeButton = document.getElementById("theme-button");
if (themeButton) {
  themeButton.hidden = false;
  const syncThemeButton = () => {
    const isDark = document.documentElement.dataset.theme === "dark";
    themeButton.setAttribute("aria-pressed", String(isDark));
    themeButton.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  };
  syncThemeButton();
  themeButton.addEventListener("click", () => {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("hritam-theme", theme); } catch {}
    syncThemeButton();
  });
}

// These are ordinary anchor links, enhanced with a keyboard shortcut and search.
const palette = document.getElementById("command-palette");
const commandButton = document.getElementById("command-button");
const commandSearch = document.getElementById("command-search");
if (palette && commandButton && typeof palette.showModal === "function") {
  commandButton.hidden = false;
  const commands = palette.querySelectorAll("[data-command]");
  const openPalette = () => {
    commandSearch.value = "";
    commands.forEach((command) => { command.hidden = false; });
    palette.showModal();
    commandSearch.focus();
  };
  commandButton.addEventListener("click", openPalette);
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (palette.open) palette.close();
      else openPalette();
    }
  });
  commandSearch.addEventListener("input", () => {
    const query = commandSearch.value.trim().toLowerCase();
    commands.forEach((command) => {
      command.hidden = !command.textContent.toLowerCase().includes(query);
    });
  });
  commandSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const first = [...commands].find((command) => !command.hidden);
      if (first) {
        event.preventDefault();
        first.click();
      }
    }
  });
  commands.forEach((command) => {
    command.addEventListener("click", () => { palette.close(); closeMenu(); });
  });
}

// Preserve the original image links and modifier-click behavior.
const figureViewer = document.getElementById("figure-viewer");
if (figureViewer && typeof figureViewer.showModal === "function") {
  document.querySelectorAll(".paper-figure, .portrait-frame").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const image = document.getElementById("figure-viewer-image");
      const title = link.closest(".publication")?.querySelector(".paper-title")?.textContent
        || "Hritam Basak";
      image.src = link.href;
      image.alt = link.querySelector("img").alt;
      document.getElementById("figure-viewer-title").textContent = title;
      document.getElementById("figure-original").href = link.href;
      figureViewer.showModal();
    });
  });
}

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.querySelector("[data-close-dialog]")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    }
  });
});

// A reading indicator and the current section help navigate the long paper list.
const sectionLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const sections = sectionLinks.map((link) => document.querySelector(link.getAttribute("href")));
let scrollQueued = false;
function updateReadingPosition() {
  scrollQueued = false;
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const progress = available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 0;
  document.documentElement.style.setProperty("--reading-progress", String(progress));
  let active = 0;
  let closestTop = -Infinity;
  sections.forEach((section, index) => {
    if (!section) return;
    const top = section.getBoundingClientRect().top;
    if (top <= 160 && top > closestTop) {
      closestTop = top;
      active = index;
    }
  });
  sectionLinks.forEach((link, index) => {
    if (index === active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}
function queueReadingPosition() {
  if (!scrollQueued) {
    scrollQueued = true;
    window.requestAnimationFrame(updateReadingPosition);
  }
}
window.addEventListener("scroll", queueReadingPosition, { passive: true });
window.addEventListener("resize", queueReadingPosition, { passive: true });
updateReadingPosition();

// Keep the entire portfolio available in HTML; load 3D only for a wide viewport.
(() => {
  const host = document.getElementById("hero-scene");
  if (!host) return;
  const controls = document.getElementById("scene-controls");
  const experienceButton = document.getElementById("experience-button");
  const motionButton = document.getElementById("motion-button");
  const wide = window.matchMedia("(min-width: 901px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let preference;
  try { preference = localStorage.getItem("hritam-experience"); } catch {}
  let immersive = preference ? preference === "3d" : !reducedMotion.matches;
  let paused = false;
  let controller;
  let loading;
  let failed = false;

  function syncButtons() {
    const showing = wide.matches && immersive && !failed;
    controls.hidden = !wide.matches;
    experienceButton.textContent = showing ? "Reading view" : "Explore in 3D";
    experienceButton.setAttribute("aria-label", showing ? "Switch to the reading view" : "Switch to the 3D view");
    experienceButton.setAttribute("aria-pressed", String(showing));
    motionButton.hidden = !showing || !controller;
    motionButton.disabled = reducedMotion.matches;
    motionButton.textContent = reducedMotion.matches ? "Motion off" : paused ? "Resume motion" : "Pause motion";
    motionButton.setAttribute("aria-pressed", String(paused || reducedMotion.matches));
    motionButton.setAttribute("aria-label", reducedMotion.matches ? "Motion disabled by system preference" : paused ? "Resume scene animation" : "Pause scene animation");
  }
  function unavailable() {
    failed = true;
    host.classList.remove("scene-ready", "scene-immersive");
    host.dataset.sceneStatus = "unavailable";
    controller?.setActive(false);
    syncButtons();
  }
  async function syncExperience() {
    const showing = wide.matches && immersive && !failed;
    host.classList.toggle("scene-immersive", showing);
    syncButtons();
    if (!showing) {
      host.classList.remove("scene-ready");
      controller?.setActive(false);
      return;
    }
    try {
      if (!controller) {
        loading ||= import("./hero-scene.js").then(module => module.createScene(host, unavailable));
        controller = await loading;
      }
      // A resize or preference change may have happened while the font was loading.
      const stillShowing = wide.matches && immersive && !failed;
      host.classList.toggle("scene-ready", stillShowing);
      controller.setActive(stillShowing);
      controller.setPaused(paused);
      host.dataset.sceneStatus = "ready";
      syncButtons();
    } catch {
      unavailable();
    }
  }
  experienceButton.addEventListener("click", () => {
    if (failed) {
      controller?.dispose();
      controller = loading = undefined;
      failed = false;
      immersive = true;
    } else immersive = !immersive;
    preference = immersive ? "3d" : "lite";
    try { localStorage.setItem("hritam-experience", preference); } catch {}
    syncExperience();
  });
  motionButton.addEventListener("click", () => {
    paused = !paused;
    controller?.setPaused(paused);
    syncButtons();
  });
  wide.addEventListener("change", syncExperience);
  reducedMotion.addEventListener("change", () => {
    // System motion preferences also govern an explicitly enabled 3D view.
    if (reducedMotion.matches && !preference) immersive = false;
    syncExperience();
  });
  syncExperience();
})();
