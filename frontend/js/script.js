import { sensorZones } from "./sensorData.js";
import { processZoneAlerts } from "./alertService.js";
import { getUserSettings } from "./userManager.js";

/* LOGIN PAGE */

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

if (loginForm && usernameInput && passwordInput && loginError) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const validLogins = [
      { username: "operator", password: "op123" },
      { username: "admin", password: "admin123" }
    ];

    const isValidLogin = validLogins.some(function (login) {
      return login.username === username && login.password === password;
    });

    if (isValidLogin) {
      loginError.classList.remove("show");
      window.location.href = "index.html";
    } else {
      loginError.classList.add("show");
    }
  });
}

/* DASHBOARD PAGE */

const zoneSelector = document.getElementById("zoneSelector");
const zoneSearchInput = document.getElementById("zoneSearchInput");
const zoneDropdown = document.getElementById("zoneDropdown");
const gaugeGrid = document.getElementById("gaugeGrid");
const zoneName = document.getElementById("zoneName");
const zoneUpdatedAt = document.getElementById("zoneUpdatedAt");

let activeZoneId = sensorZones[0].id;
let isTypingZoneSearch = false;

function getGaugePercent(value, min, max) {
  return ((value - min) / (max - min)) * 100;
}

function getGaugeTone(metricId, value) {
  if (metricId === "airQuality") {
    if (value <= 50) return "good";
    if (value <= 100) return "moderate";
    return "high";
  }

  if (metricId === "temperature") {
    if (value < 10) return "cool";
    if (value <= 28) return "good";
    return "high";
  }

  if (metricId === "humidity") {
    if (value < 35) return "moderate";
    if (value <= 70) return "good";
    return "high";
  }

  if (metricId === "noiseLevel") {
    if (value < 60) return "good";
    if (value <= 85) return "moderate";
    return "high";
  }

  return "good";
}

function titleCaseTone(tone) {
  return tone.charAt(0).toUpperCase() + tone.slice(1);
}

function getActiveZone() {
  return sensorZones.find((zone) => zone.id === activeZoneId);
}

function renderZoneDropdown(filterText = "") {
  if (!zoneDropdown) return;

  const normalizedFilter = filterText.trim().toLowerCase();

  const filteredZones = sensorZones.filter((zone) =>
    zone.zoneName.toLowerCase().includes(normalizedFilter)
  );

  zoneDropdown.innerHTML = "";

  if (filteredZones.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "zoneDropdownEmpty";
    emptyState.textContent = "No matching zones";
    zoneDropdown.appendChild(emptyState);
    return;
  }

  filteredZones.forEach((zone) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "zoneDropdownItem";
    button.textContent = zone.zoneName;

    if (zone.id === activeZoneId) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      activeZoneId = zone.id;

      if (zoneSearchInput) {
        zoneSearchInput.value = zone.zoneName;
      }

      renderZoneDropdown(zone.zoneName);
      renderZoneData();
      closeZoneDropdown();
    });

    zoneDropdown.appendChild(button);
  });
}

function openZoneDropdown() {
  if (!zoneSelector) return;
  zoneSelector.classList.add("open");
}

function closeZoneDropdown() {
  if (!zoneSelector) return;
  zoneSelector.classList.remove("open");
}

function renderZoneData() {
  if (!gaugeGrid || !zoneName || !zoneUpdatedAt) return;

  const selectedZone = getActiveZone();
  if (!selectedZone) return;

  zoneName.textContent = selectedZone.zoneName;
  zoneUpdatedAt.textContent = selectedZone.updatedAt;

  // Check for alerts on this zone
  const userSettings = getUserSettings();
  if (userSettings && userSettings.alertsEnabled) {
    processZoneAlerts(selectedZone, {
      phoneNumber: userSettings.phoneNumber,
      enabled: userSettings.alertsEnabled,
      customThresholds: userSettings.customThresholds,
      notificationsPreference: userSettings.notificationsPreference
    }).catch(error => {
      console.error("Error processing zone alerts:", error);
    });
  }

  gaugeGrid.innerHTML = "";

  selectedZone.gauges.forEach((gauge) => {
    const percent = getGaugePercent(gauge.value, gauge.min, gauge.max);
    const tone = getGaugeTone(gauge.id, gauge.value);
    const toneClass = titleCaseTone(tone);

    const gaugeCard = document.createElement("article");
    gaugeCard.className = "gaugeCard";

    gaugeCard.innerHTML = `
      <div class="gaugeCardTop">
        <div class="gaugeHeadingBlock">
          <p class="gaugeLabel">${gauge.label}</p>
          <p class="gaugeStatus">${gauge.status}</p>
        </div>
      </div>

      <div class="gaugeVisualWrap">
        <div class="gaugeVisual gaugeTone${toneClass}" style="--gaugePercent: ${percent}%;">
          <div class="gaugeInner">
            <div class="gaugeValueRow">
              <span class="gaugeValue">${gauge.value}</span>
              <span class="gaugeUnit">${gauge.unit}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="gaugeRangeRow">
        <span class="gaugeRangeValue">${gauge.min}${gauge.unit}</span>
        <span class="gaugeRangeValue">${gauge.max}${gauge.unit}</span>
      </div>
    `;

    gaugeGrid.appendChild(gaugeCard);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (zoneSearchInput && zoneDropdown && zoneName && zoneUpdatedAt && gaugeGrid) {
    const initialZone = getActiveZone();

    if (initialZone) {
      zoneSearchInput.value = initialZone.zoneName;
    }

    renderZoneDropdown(zoneSearchInput.value);
    renderZoneData();

    zoneSearchInput.addEventListener("focus", () => {
      if (!isTypingZoneSearch) {
        zoneSearchInput.value = "";
      }

      isTypingZoneSearch = true;
      openZoneDropdown();
      renderZoneDropdown("");
    });

    zoneSearchInput.addEventListener("click", () => {
      zoneSearchInput.value = "";
      isTypingZoneSearch = true;
      openZoneDropdown();
      renderZoneDropdown("");
    });

    zoneSearchInput.addEventListener("input", (event) => {
      isTypingZoneSearch = true;
      openZoneDropdown();
      renderZoneDropdown(event.target.value);
    });

    document.addEventListener("click", (event) => {
      if (!zoneSelector.contains(event.target)) {
        const activeZone = getActiveZone();
        if (activeZone) {
          zoneSearchInput.value = activeZone.zoneName;
        }
        closeZoneDropdown();
      }
    });

    // Set up periodic alert checking every 5 minutes
    setInterval(() => {
      renderZoneData();
    }, 5 * 60 * 1000);
  }
});