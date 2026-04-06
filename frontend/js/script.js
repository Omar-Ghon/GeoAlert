import { getPublicAlertsApi } from "./adminApi.js";

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

const citySelector = document.getElementById("zoneSelector");
const citySearchInput = document.getElementById("zoneSearchInput");
const cityDropdown = document.getElementById("zoneDropdown");
const gaugeGrid = document.getElementById("gaugeGrid");
const zoneName = document.getElementById("zoneName");
const zoneUpdatedAt = document.getElementById("zoneUpdatedAt");

const OPERATOR_BASE_URL = "https://z0kfbot2qb.execute-api.us-east-1.amazonaws.com";


const CITY_OPTIONS = [
  { id: "hamilton", name: "Hamilton" },
  { id: "halton", name: "Halton" }
];

let activeCityId = CITY_OPTIONS[0]?.id || "hamilton";
let activeCityData = null;
let isTypingCitySearch = false;

const metricDefinitions = [
  {
    id: "airQuality",
    label: "Air Quality",
    unit: "AQI",
    min: 0,
    max: 150
  },
  {
    id: "temperature",
    label: "Temperature",
    unit: "°C",
    min: -10,
    max: 45
  },
  {
    id: "humidity",
    label: "Humidity",
    unit: "%",
    min: 0,
    max: 100
  },
  {
    id: "noiseLevel",
    label: "Noise Level",
    unit: "dB",
    min: 0,
    max: 150
  }
];

async function fetchOperatorCityData(cityId = "hamilton", minutes = 60) {
  const response = await fetch(
    `${OPERATOR_BASE_URL}/api/operator?cityId=${encodeURIComponent(cityId)}&minutes=${encodeURIComponent(minutes)}`
  );

  if (!response.ok) {
    throw new Error("Failed to load operator data");
  }

  return response.json();
}

function capitalizeWords(value) {
  return String(value || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getCityName(cityId) {
  const match = CITY_OPTIONS.find((city) => city.id === cityId);
  return match ? match.name : capitalizeWords(cityId);
}

function getGaugePercent(value, min, max) {
  if (value === null || value === undefined) {
    return 0;
  }

  const clampedValue = Math.max(min, Math.min(max, value));
  return ((clampedValue - min) / (max - min)) * 100;
}

function getGaugeTone(metricId, value) {
  if (value === null || value === undefined) {
    return "moderate";
  }

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

function formatGaugeValue(metricId, value) {
  if (value === null || value === undefined) {
    return "N/A";
  }

  if (metricId === "temperature") {
    return Number(value).toFixed(1);
  }

  return Number(value).toFixed(0);
}

function formatUpdatedTime(isoString) {
  if (!isoString) {
    return "Unknown";
  }

  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function getLatestReading(sensor) {
  if (!sensor?.readings?.length) {
    return null;
  }

  return sensor.readings[sensor.readings.length - 1];
}

function getAllSensorsFromCity(cityData) {
  if (!cityData?.zones?.length) {
    return [];
  }

  return cityData.zones.flatMap((zone) => zone.sensors || []);
}

function getCityMetricAverage(cityData, metricId) {
  const sensors = getAllSensorsFromCity(cityData).filter(
    (sensor) => sensor.sensorType === metricId
  );

  const latestValues = sensors
    .map((sensor) => getLatestReading(sensor)?.value)
    .filter((value) => value !== null && value !== undefined);

  if (!latestValues.length) {
    return null;
  }

  const total = latestValues.reduce((sum, value) => sum + value, 0);
  return total / latestValues.length;
}

function getLatestCityTimestamp(cityData) {
  const timestamps = getAllSensorsFromCity(cityData)
    .map((sensor) => getLatestReading(sensor)?.timestamp)
    .filter(Boolean)
    .map((timestamp) => new Date(timestamp).getTime())
    .filter((value) => !Number.isNaN(value));

  if (!timestamps.length) {
    return null;
  }

  return new Date(Math.max(...timestamps)).toISOString();
}

function renderCityDropdown(filterText = "") {
  if (!cityDropdown) {
    return;
  }

  const normalizedFilter = filterText.trim().toLowerCase();

  const filteredCities = CITY_OPTIONS.filter((city) =>
    city.name.toLowerCase().includes(normalizedFilter)
  );

  cityDropdown.innerHTML = "";

  if (!filteredCities.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "zoneDropdownEmpty";
    emptyState.textContent = "No matching cities";
    cityDropdown.appendChild(emptyState);
    return;
  }

  filteredCities.forEach((city) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "zoneDropdownItem";
    button.textContent = city.name;

    if (city.id === activeCityId) {
      button.classList.add("active");
    }

button.addEventListener("click", async () => {
  activeCityId = city.id;

  if (citySearchInput) {
    citySearchInput.value = city.name;
  }

  closeCityDropdown();
  renderCityDropdown(city.name);

  try {
    await loadDashboardCityData();
    await loadPublicAlerts();
  } catch (error) {
    console.error("Failed to switch city:", error);
  }
});

    cityDropdown.appendChild(button);
  });
}

function openCityDropdown() {
  if (!citySelector) {
    return;
  }

  citySelector.classList.add("open");
}

function closeCityDropdown() {
  if (!citySelector) {
    return;
  }

  citySelector.classList.remove("open");
}

function renderCityData() {
  if (!gaugeGrid || !zoneName || !zoneUpdatedAt) {
    return;
  }

  if (!activeCityData) {
    gaugeGrid.innerHTML = `
      <p style="color: #b54a2f; font-weight: 600;">
        No city data available.
      </p>
    `;
    return;
  }

  zoneName.textContent = getCityName(activeCityId);

  const latestTimestamp = getLatestCityTimestamp(activeCityData);
  zoneUpdatedAt.textContent = formatUpdatedTime(latestTimestamp);

  gaugeGrid.innerHTML = "";

  metricDefinitions.forEach((metric) => {
    const value = getCityMetricAverage(activeCityData, metric.id);
    const percent = getGaugePercent(value ?? metric.min, metric.min, metric.max);
    const tone = getGaugeTone(metric.id, value);
    const toneClass = titleCaseTone(tone);

    const gaugeCard = document.createElement("article");
    gaugeCard.className = "gaugeCard";

    gaugeCard.innerHTML = `
      <div class="gaugeCardTop">
        <div class="gaugeHeadingBlock">
          <p class="gaugeLabel">${metric.label}</p>
          <p class="gaugeStatus">${capitalizeWords(tone)}</p>
        </div>
      </div>

      <div class="gaugeVisualWrap">
        <div class="gaugeVisual gaugeTone${toneClass}" style="--gaugePercent: ${percent}%;">
          <div class="gaugeInner">
            <div class="gaugeValueRow">
              <span class="gaugeValue">${formatGaugeValue(metric.id, value)}</span>
              <span class="gaugeUnit">${metric.unit}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="gaugeRangeRow">
        <span class="gaugeRangeValue">${metric.min}${metric.unit}</span>
        <span class="gaugeRangeValue">${metric.max}${metric.unit}</span>
      </div>
    `;

    gaugeGrid.appendChild(gaugeCard);
  });
}

async function loadDashboardCityData() {
  activeCityData = await fetchOperatorCityData(activeCityId, 60);
  renderCityData();
}

/* PUBLIC ALERTS */

function getPublicSeverityClass(severity) {
  const normalized = String(severity || "").toLowerCase();

  if (normalized === "severe" || normalized === "critical") {
    return "isSevere";
  }

  if (normalized === "moderate" || normalized === "warning") {
    return "isModerate";
  }

  return "isMild";
}

function renderPublicAlerts(alerts) {
  const publicAlertsList = document.getElementById("publicAlertsList");
  const publicAlertsCount = document.getElementById("publicAlertsCount");

  if (!publicAlertsList || !publicAlertsCount) {
    return;
  }

  publicAlertsCount.textContent = String(alerts.length);

  if (!alerts.length) {
    publicAlertsList.innerHTML = `
      <p class="publicAlertsEmpty">No public alerts right now.</p>
    `;
    return;
  }

  publicAlertsList.innerHTML = alerts
    .slice(0, 3)
    .map((alert) => {
      const severityLabel = capitalizeWords(
        alert.severityLabel || alert.severity || "Alert"
      );
      const cityLabel = capitalizeWords(alert.cityId || "Unknown City");
      const message =
        alert.publicMessage ||
        `${cityLabel} ${capitalizeWords(alert.metric || "environmental")} conditions need attention.`;

      return `
        <article class="publicAlertItem">
          <div class="publicAlertTop">
            <span class="publicAlertSeverity ${getPublicSeverityClass(alert.severity)}">
              ${severityLabel}
            </span>
            <span class="publicAlertCity">${cityLabel}</span>
          </div>
          <p class="publicAlertMessage">${message}</p>
        </article>
      `;
    })
    .join("");
}

async function loadPublicAlerts() {
  try {
    const alerts = await getPublicAlertsApi(activeCityId);
    renderPublicAlerts(alerts);
  } catch (error) {
    console.error("Failed to load public alerts:", error);

    const publicAlertsList = document.getElementById("publicAlertsList");
    const publicAlertsCount = document.getElementById("publicAlertsCount");

    if (publicAlertsCount) {
      publicAlertsCount.textContent = "0";
    }

    if (publicAlertsList) {
      publicAlertsList.innerHTML = `
        <p class="publicAlertsEmpty">Unable to load public alerts.</p>
      `;
    }
  }
}

/* INIT */

document.addEventListener("DOMContentLoaded", async () => {
  if (!(citySearchInput && cityDropdown && zoneName && zoneUpdatedAt && gaugeGrid)) {
    return;
  }

  try {
    citySearchInput.value = getCityName(activeCityId);

    renderCityDropdown(citySearchInput.value);

    await loadDashboardCityData();
    await loadPublicAlerts();

    citySearchInput.addEventListener("focus", () => {
      if (!isTypingCitySearch) {
        citySearchInput.value = "";
      }

      isTypingCitySearch = true;
      openCityDropdown();
      renderCityDropdown("");
    });

    citySearchInput.addEventListener("click", () => {
      citySearchInput.value = "";
      isTypingCitySearch = true;
      openCityDropdown();
      renderCityDropdown("");
    });

    citySearchInput.addEventListener("input", (event) => {
      isTypingCitySearch = true;
      openCityDropdown();
      renderCityDropdown(event.target.value);
    });

    document.addEventListener("click", (event) => {
      if (!citySelector.contains(event.target)) {
        citySearchInput.value = getCityName(activeCityId);
        closeCityDropdown();
      }
    });

    setInterval(async () => {
      try {
        await loadDashboardCityData();
        await loadPublicAlerts();
        renderCityDropdown(citySearchInput.value);
      } catch (error) {
        console.error("Failed to refresh city dashboard data:", error);
      }
    }, 5 * 60 * 1000);
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
    gaugeGrid.innerHTML = `
      <p style="color: #b54a2f; font-weight: 600;">
        Failed to load live city data.
      </p>
    `;
  }
});

setInterval(loadPublicAlerts, 15000);