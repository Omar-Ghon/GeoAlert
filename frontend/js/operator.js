import { hamiltonOperatorData } from "./operatorSensorData.js";

const accountMenuButton = document.getElementById("accountMenuButton");
const accountDropdown = document.getElementById("accountDropdown");
const alertsRow = document.getElementById("alertsRow");
const zoneList = document.getElementById("zoneList");
const mapMarkers = document.getElementById("mapMarkers");

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
  const date = new Date(isoString);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function getAlertSeverityClass(severity) {
  if (severity === "critical") {
    return "critical";
  }

  if (severity === "warning") {
    return "warning";
  }

  return "normal";
}

function getAlertCardClass(severity) {
  if (severity === "critical") {
    return "isCritical";
  }

  if (severity === "warning") {
    return "isWarning";
  }

  return "";
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

function renderAlerts() {
  if (!alertsRow) {
    return;
  }

  alertsRow.innerHTML = hamiltonOperatorData.alerts
    .slice(0, 2)
    .map((alert) => {
      const severityClass = getAlertSeverityClass(alert.severity);
      const cardClass = getAlertCardClass(alert.severity);

      return `
        <article class="alertCard ${cardClass}">
          <div class="alertCardTop">
            <span class="alertBadge ${severityClass}">${alert.severity.toUpperCase()}</span>
            <span class="alertTime">${formatAlertTime(alert.timestamp)}</span>
          </div>

          <h3 class="alertTitle">${alert.title}</h3>
          <p class="alertText">${alert.message}</p>
        </article>
      `;
    })
    .join("");
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
  return `operator-zone-metrics.html?zone=${zone.id}&metric=${metricKey}`;
}

function getMetricLabel(metricKey) {
  const metric = metricDefinitions.find((item) => item.key === metricKey);
  return metric ? metric.label : metricKey;
}

function renderMapMarkers() {
  if (!mapMarkers) {
    return;
  }

  const markersMarkup = hamiltonOperatorData.zones
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
  if (!zoneList) {
    return;
  }

  zoneList.innerHTML = hamiltonOperatorData.zones
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

renderAlerts();
renderZones();
renderMapMarkers();