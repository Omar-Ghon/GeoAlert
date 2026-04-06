import { fetchOperatorCityData } from "../../backend/operator.js";
import {
  getAlertsApi,
  updateAlertStatusApi,
  toggleAlertPublicApi
} from "./adminApi.js";

let operatorCityData = null;
let activeAlerts = [];

const accountMenuButton = document.getElementById("accountMenuButton");
const accountDropdown = document.getElementById("accountDropdown");
const zoneList = document.getElementById("zoneList");
const mapMarkers = document.getElementById("mapMarkers");

const operatorActionBanner = document.querySelector(".operatorActionBanner");
const viewAllAlertsButton = document.querySelector(".viewAllAlertsButton");

const activeAlertsCount = document.getElementById("activeAlertsCount");
const alertsTableBody = document.getElementById("alertsTableBody");
const accountMenuUsername = document.getElementById("accountMenuUsername");

const metricDefinitions = [
  {
    key: "airQuality",
    label: "Air Quality",
    unit: "AQI",
    detailsPage: "operator-zone-metrics.html?metric=airQuality"
  },
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    detailsPage: "operator-zone-metrics.html?metric=temperature"
  },
  {
    key: "humidity",
    label: "Humidity",
    unit: "%",
    detailsPage: "operator-zone-metrics.html?metric=humidity"
  },
  {
    key: "noiseLevel",
    label: "Noise Level",
    unit: "dB",
    detailsPage: "operator-zone-metrics.html?metric=noiseLevel"
  }
];

function getCityFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("city") || "hamilton";
}

if (accountMenuButton && accountDropdown) {
  accountMenuButton.addEventListener("click", () => {
    const isOpen = accountDropdown.classList.toggle("isOpen");
    accountMenuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  document.addEventListener("click", (event) => {
    const menu = document.getElementById("accountMenu");
    if (menu && !menu.contains(event.target)) {
      accountDropdown.classList.remove("isOpen");
      accountMenuButton.setAttribute("aria-expanded", "false");
    }
  });
}

function formatAlertTime(isoString) {
  if (!isoString) {
    return "Unknown time";
  }

  const date = new Date(isoString);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatAlertDate(isoString) {
  if (!isoString) {
    return "Unknown date";
  }

  const date = new Date(isoString);

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function capitalizeWords(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getZoneLabel(zoneId) {
  if (!zoneId) {
    return "Unknown zone";
  }

  if (operatorCityData?.zones?.length) {
    const matchingZone = operatorCityData.zones.find((zone) => zone.id === zoneId);
    if (matchingZone) {
      return matchingZone.zoneName;
    }
  }

  return capitalizeWords(zoneId);
}

function getMetricLabel(metricKey) {
  const metric = metricDefinitions.find((item) => item.key === metricKey);
  return metric ? metric.label : capitalizeWords(metricKey);
}

function getAlertCardClass(severity) {
  if (severity === "severe" || severity === "critical") {
    return "isCritical";
  }

  if (severity === "moderate" || severity === "warning") {
    return "isWarning";
  }

  return "";
}

function getSeverityLabel(alert) {
  if (alert?.severityLabel) {
    return alert.severityLabel;
  }

  if (alert?.severity) {
    return capitalizeWords(alert.severity);
  }

  return "Alert";
}

function getSeverityBadgeClass(alert) {
  const severity = String(alert?.severity || "").toLowerCase();

  if (severity === "severe" || severity === "critical") {
    return "isSevere";
  }

  if (severity === "moderate" || severity === "warning") {
    return "isModerate";
  }

  return "isMild";
}

function getAlertSourceLabel(alert) {
  if (alert?.sensorId && !String(alert.sensorId).startsWith("zoneavg#")) {
    return alert.sensorId;
  }

  if (alert?.ruleName) {
    return alert.ruleName;
  }

  if (alert?.metric) {
    return `${getZoneLabel(alert.zoneId)} ${getMetricLabel(alert.metric)}`;
  }

  return getZoneLabel(alert?.zoneId);
}

function getAlertSourceSubLabel(alert) {
  if (alert?.sensorId && !String(alert.sensorId).startsWith("zoneavg#")) {
    return `${getMetricLabel(alert.metric || alert.sensorType)} sensor`;
  }

  return `${getMetricLabel(alert.metric || alert.sensorType)} rule`;
}

function getAlertMessage(alert) {
  const readingText =
    alert?.reading !== null && alert?.reading !== undefined && alert?.unit
      ? `${alert.reading} ${alert.unit}`
      : alert?.reading !== null && alert?.reading !== undefined
        ? `${alert.reading}`
        : null;

  const baseMessage = alert?.message || "An active environmental alert requires operator review.";

  if (readingText) {
    return `${baseMessage} Current reading: ${readingText}.`;
  }

  return baseMessage;
}

function updateAlertUiState() {
  const hasActiveAlerts = activeAlerts.length > 0;

  if (operatorActionBanner) {
    operatorActionBanner.hidden = !hasActiveAlerts;
    operatorActionBanner.classList.toggle("isActive", hasActiveAlerts);
  }

  if (viewAllAlertsButton) {
    viewAllAlertsButton.classList.toggle("isUrgent", hasActiveAlerts);

    const cityId = getCityFromUrl();
    if (viewAllAlertsButton.tagName === "A") {
      viewAllAlertsButton.href = `operator-alerts${cityId === "halton" ? "-halton" : ""}.html?city=${encodeURIComponent(cityId)}`;
    }
  }

  if (activeAlertsCount) {
    activeAlertsCount.textContent = String(activeAlerts.length);
  }

  if (accountMenuUsername && operatorCityData?.cityName) {
    accountMenuUsername.textContent = `${operatorCityData.cityName} Operator`;
  }
}

function renderActiveAlertsTable() {
  if (!alertsTableBody) {
    return;
  }

  if (!activeAlerts.length) {
    alertsTableBody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="alertMessageCell">
            No active ${escapeHtml(capitalizeWords(operatorCityData?.cityId || "city"))} alerts at this time.
          </div>
        </td>
      </tr>
    `;
    return;
  }

  alertsTableBody.innerHTML = activeAlerts
    .map((alert) => {
      const sourceLabel = getAlertSourceLabel(alert);
      const sourceSubLabel = getAlertSourceSubLabel(alert);
      const readingValue =
        alert?.reading !== null && alert?.reading !== undefined
          ? `${alert.reading} ${alert.unit || ""}`.trim()
          : "N/A";

      const timeValue = alert?.triggeredAt || alert?.updatedAt;

      return `
        <tr data-alert-id="${escapeHtml(alert.alertId || "")}">
          <td>
            <span class="alertSeverityBadge ${getSeverityBadgeClass(alert)}">
              ${escapeHtml(getSeverityLabel(alert))}
            </span>
          </td>

          <td>${escapeHtml(getZoneLabel(alert.zoneId))}</td>

          <td>
            <div class="alertSourceCell">
              <strong>${escapeHtml(sourceLabel)}</strong>
              <span>${escapeHtml(sourceSubLabel)}</span>
            </div>
          </td>

          <td>
            <div class="alertReadingCell">
              <strong>${escapeHtml(readingValue)}</strong>
              <span>latest active reading</span>
            </div>
          </td>

          <td>
            <div class="alertMessageCell">
              ${escapeHtml(alert.message || "An active alert requires operator attention.")}
            </div>
          </td>

          <td>
            <div class="alertTimeCell">
              <strong>${escapeHtml(formatAlertTime(timeValue))}</strong>
              <span>${escapeHtml(formatAlertDate(timeValue))}</span>
            </div>
          </td>

          <td>
            <div class="alertActionButtons">
              <button
                type="button"
                class="alertActionButton"
                data-action="acknowledge"
                data-alert-id="${escapeHtml(alert.alertId || "")}"
                ${alert.status === "acknowledged" ? "disabled" : ""}
              >
                ${alert.status === "acknowledged" ? "Acknowledged" : "Acknowledge"}
              </button>

              <button
                type="button"
                class="alertActionButton isResolve"
                data-action="resolve"
                data-alert-id="${escapeHtml(alert.alertId || "")}"
                ${alert.status === "resolved" ? "disabled" : ""}
              >
                ${alert.status === "resolved" ? "Resolved" : "Mark Resolved"}
              </button>

              <button
                type="button"
                class="alertActionButton isPublic"
                data-action="toggle-public"
                data-alert-id="${escapeHtml(alert.alertId || "")}"
                data-is-public="${alert.isPublic ? "true" : "false"}"
              >
                ${alert.isPublic ? "Remove from Public" : "Make Public"}
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function handleAlertsTableClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const alertId = button.dataset.alertId;
  const action = button.dataset.action;

  if (!alertId) {
    return;
  }

  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Updating...";

  try {
    if (action === "acknowledge") {
      await updateAlertStatusApi(alertId, "acknowledged");
    } else if (action === "resolve") {
      await updateAlertStatusApi(alertId, "resolved");
    } else if (action === "toggle-public") {
      const isCurrentlyPublic = button.dataset.isPublic === "true";
      await toggleAlertPublicApi(alertId, !isCurrentlyPublic);
    }

    await loadAndRenderOperatorPage();
  } catch (error) {
    console.error("Alert action failed:", error);
    alert("Failed to update alert. Check the console and API response.");
    button.disabled = false;
    button.textContent = originalText;
  }
}

function calculateAverage(values) {
  if (!values.length) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function getMetricSensors(zone, metricKey) {
  return zone.sensors.filter((sensor) => sensor.sensorType === metricKey);
}

function getMetricStatus(metricKey, average) {
  if (average === null) {
    return {
      label: "No Data",
      className: "neutral"
    };
  }

  if (metricKey === "airQuality") {
    if (average >= 100) {
      return { label: "Critical", className: "critical" };
    }
    if (average >= 80) {
      return { label: "Elevated", className: "elevated" };
    }
    return { label: "Normal", className: "normal" };
  }

  if (metricKey === "temperature") {
    if (average >= 32) {
      return { label: "Critical", className: "critical" };
    }
    if (average >= 27) {
      return { label: "Elevated", className: "elevated" };
    }
    return { label: "Normal", className: "normal" };
  }

  if (metricKey === "humidity") {
    if (average >= 85) {
      return { label: "Critical", className: "critical" };
    }
    if (average >= 70) {
      return { label: "Elevated", className: "elevated" };
    }
    return { label: "Normal", className: "normal" };
  }

  if (metricKey === "noiseLevel") {
    if (average >= 95) {
      return { label: "Critical", className: "critical" };
    }
    if (average >= 80) {
      return { label: "Elevated", className: "elevated" };
    }
    return { label: "Normal", className: "normal" };
  }

  return {
    label: "Normal",
    className: "normal"
  };
}

function getMetricValueClass(statusClassName) {
  if (statusClassName === "critical") {
    return "critical";
  }

  if (statusClassName === "elevated") {
    return "elevated";
  }

  if (statusClassName === "neutral") {
    return "neutral";
  }

  return "normal";
}

function getMetricFiveMinuteAverage(zone, metricKey) {
  const sensors = getMetricSensors(zone, metricKey);

  if (!sensors.length) {
    return null;
  }

  const latestReadings = sensors.flatMap((sensor) =>
    sensor.readings.slice(-5).map((reading) => reading.value)
  );

  return calculateAverage(latestReadings);
}

function formatMetricValue(value, metricKey) {
  if (value === null) {
    return "N/A";
  }

  if (metricKey === "temperature") {
    return value.toFixed(1);
  }

  return value.toFixed(0);
}

function getZoneOverallStatus(zone) {
  const noiseAverage = getMetricFiveMinuteAverage(zone, "noiseLevel");
  const airAverage = getMetricFiveMinuteAverage(zone, "airQuality");

  if ((noiseAverage !== null && noiseAverage >= 95) || (airAverage !== null && airAverage >= 100)) {
    return {
      label: "Critical",
      className: "critical"
    };
  }

  if ((noiseAverage !== null && noiseAverage >= 80) || (airAverage !== null && airAverage >= 80)) {
    return {
      label: "Elevated",
      className: "elevated"
    };
  }

  return {
    label: "Normal",
    className: "normal"
  };
}

function getLatestReading(sensor) {
  if (!sensor.readings.length) {
    return null;
  }

  return sensor.readings[sensor.readings.length - 1];
}

function getSensorTypeLetter(sensorType) {
  if (sensorType === "airQuality") {
    return "A";
  }

  if (sensorType === "temperature") {
    return "T";
  }

  if (sensorType === "humidity") {
    return "H";
  }

  if (sensorType === "noiseLevel") {
    return "N";
  }

  return "?";
}

function getSensorSeverity(metricKey, readingValue) {
  if (readingValue === null || readingValue === undefined) {
    return {
      label: "Unavailable",
      className: "isUnavailable"
    };
  }

  if (metricKey === "airQuality") {
    if (readingValue >= 100) {
      return { label: "Critical", className: "isCritical" };
    }
    if (readingValue >= 90) {
      return { label: "High", className: "isHigh" };
    }
    if (readingValue >= 80) {
      return { label: "Elevated", className: "isElevated" };
    }
    return { label: "Normal", className: "isNormal" };
  }

  if (metricKey === "temperature") {
    if (readingValue >= 32) {
      return { label: "Critical", className: "isCritical" };
    }
    if (readingValue >= 29) {
      return { label: "High", className: "isHigh" };
    }
    if (readingValue >= 27) {
      return { label: "Elevated", className: "isElevated" };
    }
    return { label: "Normal", className: "isNormal" };
  }

  if (metricKey === "humidity") {
    if (readingValue >= 85) {
      return { label: "Critical", className: "isCritical" };
    }
    if (readingValue >= 78) {
      return { label: "High", className: "isHigh" };
    }
    if (readingValue >= 70) {
      return { label: "Elevated", className: "isElevated" };
    }
    return { label: "Normal", className: "isNormal" };
  }

  if (metricKey === "noiseLevel") {
    if (readingValue >= 95) {
      return { label: "Critical", className: "isCritical" };
    }
    if (readingValue >= 88) {
      return { label: "High", className: "isHigh" };
    }
    if (readingValue >= 80) {
      return { label: "Elevated", className: "isElevated" };
    }
    return { label: "Normal", className: "isNormal" };
  }

  return {
    label: "Normal",
    className: "isNormal"
  };
}

function getOperatorZoneMetricsPage(zone, metricKey) {
  return `operator-zone-metrics.html?city=${operatorCityData.cityId}&zone=${zone.id}&metric=${metricKey}`;
}

function renderMapMarkers() {
  if (!mapMarkers || !operatorCityData) {
    return;
  }

  const markersMarkup = operatorCityData.zones
    .flatMap((zone) =>
      zone.sensors
        .filter((sensor) => sensor.mapPosition)
        .map((sensor) => {
          const latestReading = getLatestReading(sensor);
          const value = latestReading ? latestReading.value : null;
          const detailsPage = getOperatorZoneMetricsPage(zone, sensor.sensorType);
          const sensorLetter = getSensorTypeLetter(sensor.sensorType);
          const severity = getSensorSeverity(sensor.sensorType, value);
          const displayValue = value === null ? "N/A" : value;

          return `
            <div
              class="mapMarker ${severity.className}"
              style="left: ${sensor.mapPosition.x}%; top: ${sensor.mapPosition.y}%;"
            >
              <a
                class="mapMarkerButton"
                href="${detailsPage}"
                aria-label="${sensor.label} - ${severity.label}"
              >
                <span class="mapMarkerButtonText">${sensorLetter}</span>
              </a>

              <div class="mapTooltip">
                <h4 class="mapTooltipTitle">${sensor.label}</h4>
                <p class="mapTooltipText">
                  ${sensor.sensorType} · ${displayValue} ${sensor.unit}
                </p>
                <p class="mapTooltipText">
                  Severity · ${severity.label}
                </p>
                <a class="mapTooltipLink" href="${detailsPage}">View More</a>
              </div>
            </div>
          `;
        })
    )
    .join("");

  mapMarkers.innerHTML = markersMarkup;
}

function renderZones() {
  if (!zoneList || !operatorCityData) {
    return;
  }

  zoneList.innerHTML = operatorCityData.zones
    .map((zone) => {
      const metricCardsMarkup = metricDefinitions
        .map((metric) => {
          const sensors = getMetricSensors(zone, metric.key);
          const average = getMetricFiveMinuteAverage(zone, metric.key);
          const metricStatus = getMetricStatus(metric.key, average);
          const valueClass = getMetricValueClass(metricStatus.className);

          return `
            <article class="metricCard">
              <div class="metricCardTop">
                <h4 class="metricTitle">${metric.label}</h4>
                <span class="metricStatusBadge ${metricStatus.className}">
                  ${metricStatus.label}
                </span>
              </div>

              <div class="metricValueRow">
                <span class="metricValue ${valueClass}">${formatMetricValue(average, metric.key)}</span>
                <span class="metricUnit">${metric.unit}</span>
              </div>

              <p class="metricMeta">5-minute average</p>
              <p class="metricSensorCount">${sensors.length} sensor${sensors.length === 1 ? "" : "s"} in this zone</p>

              <a
                class="metricLink"
                href="${getOperatorZoneMetricsPage(zone, metric.key)}"
              >
                View Details
              </a>
            </article>
          `;
        })
        .join("");

      return `
        <section class="zoneCard">
          <div class="zoneCardTop">
            <div>
              <h3 class="zoneName">${zone.zoneName}</h3>
              <p class="zoneMeta">${zone.sensors.length} total sensors across this zone</p>
            </div>
          </div>

          <div class="metricGrid">
            ${metricCardsMarkup}
          </div>
        </section>
      `;
    })
    .join("");
}

async function loadAndRenderOperatorPage() {
  const cityId = getCityFromUrl();

  const [cityData, alerts] = await Promise.all([
    fetchOperatorCityData(cityId, 60),
    getAlertsApi(cityId)
  ]);

  operatorCityData = cityData;
  activeAlerts = Array.isArray(alerts) ? alerts : [];

  updateAlertUiState();
  renderActiveAlertsTable();
  renderMapMarkers();
  renderZones();

  console.log("Operator page loaded", {
    cityId,
    activeAlertsCount: activeAlerts.length,
    activeAlerts
  });
}

if (alertsTableBody) {
  alertsTableBody.addEventListener("click", handleAlertsTableClick);
}

async function initOperatorPage() {
  try {
    await loadAndRenderOperatorPage();

    setInterval(async () => {
      try {
        await loadAndRenderOperatorPage();
      } catch (error) {
        console.error("Failed to refresh operator page:", error);
      }
    }, 60000);
  } catch (error) {
    console.error("Failed to initialize operator page:", error);
  }
}

initOperatorPage();