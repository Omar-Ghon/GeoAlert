import { hamiltonOperatorData } from "./operatorSensorData.js";

const accountMenuButton = document.getElementById("accountMenuButton");
const accountDropdown = document.getElementById("accountDropdown");

const zoneMetricsHeader = document.getElementById("zoneMetricsHeader");
const zoneMetricsSummaryRow = document.getElementById("zoneMetricsSummaryRow");
const zoneMetricsGaugeGrid = document.getElementById("zoneMetricsGaugeGrid");
const zoneMetricChartCanvas = document.getElementById("zoneMetricChart");

let zoneMetricChartInstance = null;

const metricDefinitions = [
  {
    key: "airQuality",
    label: "Air Quality",
    unit: "AQI"
  },
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C"
  },
  {
    key: "humidity",
    label: "Humidity",
    unit: "%"
  },
  {
    key: "noiseLevel",
    label: "Noise Level",
    unit: "dB"
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

function getMetricDefinition(metricKey) {
  return metricDefinitions.find((metric) => metric.key === metricKey) || null;
}

function getLatestReading(sensor) {
  if (!sensor.readings.length) {
    return null;
  }

  return sensor.readings[sensor.readings.length - 1];
}

function calculateAverage(values) {
  if (!values.length) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function formatMetricValue(value, metricKey) {
  if (value === null || value === undefined) {
    return "N/A";
  }

  if (metricKey === "temperature") {
    return value.toFixed(1);
  }

  return value.toFixed(0);
}

function getMetricStatus(metricKey, value) {
  if (value === null || value === undefined) {
    return {
      label: "No Data",
      className: "isNeutral"
    };
  }

  if (metricKey === "airQuality") {
    if (value >= 100) {
      return { label: "Critical", className: "isCritical" };
    }
    if (value >= 90) {
      return { label: "High", className: "isHigh" };
    }
    if (value >= 80) {
      return { label: "Elevated", className: "isElevated" };
    }
    return { label: "Normal", className: "isNormal" };
  }

  if (metricKey === "temperature") {
    if (value >= 32) {
      return { label: "Critical", className: "isCritical" };
    }
    if (value >= 29) {
      return { label: "High", className: "isHigh" };
    }
    if (value >= 27) {
      return { label: "Elevated", className: "isElevated" };
    }
    return { label: "Normal", className: "isNormal" };
  }

  if (metricKey === "humidity") {
    if (value >= 85) {
      return { label: "Critical", className: "isCritical" };
    }
    if (value >= 78) {
      return { label: "High", className: "isHigh" };
    }
    if (value >= 70) {
      return { label: "Elevated", className: "isElevated" };
    }
    return { label: "Normal", className: "isNormal" };
  }

  if (metricKey === "noiseLevel") {
    if (value >= 95) {
      return { label: "Critical", className: "isCritical" };
    }
    if (value >= 88) {
      return { label: "High", className: "isHigh" };
    }
    if (value >= 80) {
      return { label: "Elevated", className: "isElevated" };
    }
    return { label: "Normal", className: "isNormal" };
  }

  return {
    label: "Normal",
    className: "isNormal"
  };
}

function getMetricRange(metricKey) {
  if (metricKey === "airQuality") {
    return { min: 0, max: 120 };
  }

  if (metricKey === "temperature") {
    return { min: 0, max: 40 };
  }

  if (metricKey === "humidity") {
    return { min: 0, max: 100 };
  }

  if (metricKey === "noiseLevel") {
    return { min: 0, max: 220 };
  }

  return { min: 0, max: 100 };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}


function getStatusColor(statusClassName) {
  if (statusClassName === "isCritical") {
    return "#c53e3e";
  }

  if (statusClassName === "isHigh") {
    return "#d97706";
  }

  if (statusClassName === "isElevated") {
    return "#d4a017";
  }

  if (statusClassName === "isNeutral") {
    return "#8a94a0";
  }

  return "#1f5f85";
}

function formatTimestampLabel(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function getChartBorderColor(index) {
  const colors = [
    "#1f5f85",
    "#d4a017",
    "#d97706",
    "#c53e3e",
    "#5f6f7c",
    "#2d6a42"
  ];

  return colors[index % colors.length];
}

function renderHeader(zone, metric) {
  if (!zoneMetricsHeader) {
    return;
  }

  zoneMetricsHeader.innerHTML = `
    <h2 class="zoneMetricsTitle">${zone.zoneName}</h2>
    <p class="zoneMetricsSubtitle">${metric.label} Data</p>`;
}

function renderSummaryCards(metricKey, metricUnit, sensors) {
  if (!zoneMetricsSummaryRow) {
    return;
  }

  const allReadings = sensors.flatMap((sensor) =>
    sensor.readings.map((reading) => reading.value)
  );

  const latestFiveMinuteReadings = sensors.flatMap((sensor) =>
    sensor.readings.slice(-5).map((reading) => reading.value)
  );

  const hourlyMaximum = allReadings.length ? Math.max(...allReadings) : null;
  const fiveMinuteAverage = calculateAverage(latestFiveMinuteReadings);

  const maxStatus = getMetricStatus(metricKey, hourlyMaximum);
  const avgStatus = getMetricStatus(metricKey, fiveMinuteAverage);

  zoneMetricsSummaryRow.innerHTML = `
    <article class="zoneMetricsSummaryCard">
      <h3 class="zoneMetricsSummaryLabel">Hourly Maximum</h3>
      <div class="zoneMetricsValueRow">
        <span class="zoneMetricsValue ${maxStatus.className}">
          ${formatMetricValue(hourlyMaximum, metricKey)}
        </span>
        <span class="zoneMetricsUnit">${metricUnit}</span>
      </div>
    </article>

    <article class="zoneMetricsSummaryCard">
      <h3 class="zoneMetricsSummaryLabel">5-Minute Average</h3>
      <div class="zoneMetricsValueRow">
        <span class="zoneMetricsValue ${avgStatus.className}">
          ${formatMetricValue(fiveMinuteAverage, metricKey)}
        </span>
        <span class="zoneMetricsUnit">${metricUnit}</span>
      </div>
    </article>
  `;
}

function renderGaugeGrid(metricKey, metricUnit, zone, sensors) {
  if (!zoneMetricsGaugeGrid) {
    return;
  }

  if (!sensors.length) {
    zoneMetricsGaugeGrid.innerHTML = `
      <p class="zoneMetricsEmptyState">
        No sensors were found for this metric in ${zone.zoneName}.
      </p>
    `;
    return;
  }

  zoneMetricsGaugeGrid.innerHTML = sensors
    .map((sensor, index) => {
      const latestReading = getLatestReading(sensor);
      const latestValue = latestReading ? latestReading.value : null;
      const status = getMetricStatus(metricKey, latestValue);

      return `
        <article class="zoneMetricsGaugeCard">
          <div class="zoneMetricsGaugeCardTop">
            <h3 class="zoneMetricsGaugeTitle">${sensor.label}</h3>
            <span class="zoneMetricsGaugeBadge ${status.className}">
              ${status.label}
            </span>
          </div>

          <div class="zoneMetricsGaugeWrap">
            <div class="zoneMetricsGaugeChartBox">
              <canvas
                id="zoneGaugeChart-${index}"
                class="zoneMetricsGaugeChartCanvas"
              ></canvas>

              <div class="zoneMetricsGaugeCenterValue">
                <span class="zoneMetricsGaugeValue ${status.className}">
                  ${formatMetricValue(latestValue, metricKey)}
                </span>
                <span class="zoneMetricsGaugeUnit">${metricUnit}</span>
              </div>
            </div>
          </div>

          <div class="zoneMetricsGaugeScale">
            <span>${getMetricRange(metricKey).min}</span>
            <span>${getMetricRange(metricKey).max}</span>
          </div>

          <p class="zoneMetricsGaugeMeta">
            Latest timestamp:
            <strong>${latestReading ? formatTimestampLabel(latestReading.timestamp) : "N/A"}</strong>
          </p>
        </article>
      `;
    })
    .join("");

  sensors.forEach((sensor, index) => {
    const latestReading = getLatestReading(sensor);
    const latestValue = latestReading ? latestReading.value : null;
    const status = getMetricStatus(metricKey, latestValue);

    const canvas = document.getElementById(`zoneGaugeChart-${index}`);
    if (!canvas) {
      return;
    }

    const range = getMetricRange(metricKey);
    const safeValue = latestValue === null || latestValue === undefined ? range.min : latestValue;
    const clampedValue = clamp(safeValue, range.min, range.max);
    const filledValue = clampedValue - range.min;
    const remainingValue = range.max - clampedValue;

    new Chart(canvas, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [filledValue, remainingValue],
            backgroundColor: [
              getStatusColor(status.className),
              "#e6edf2"
            ],
            borderWidth: 0,
            cutout: "72%",
            circumference: 180,
            rotation: 270
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        },
        events: []
      }
    });
  });
}


function renderChart(metricKey, sensors) {
  if (!zoneMetricChartCanvas || !sensors.length) {
    return;
  }

  if (zoneMetricChartInstance) {
    zoneMetricChartInstance.destroy();
  }

  const labels = sensors[0].readings.map((reading) =>
    formatTimestampLabel(reading.timestamp)
  );

  const metric = getMetricDefinition(metricKey);

  const datasets = sensors.map((sensor, index) => ({
    label: sensor.label,
    data: sensor.readings.map((reading) => reading.value),
    borderColor: getChartBorderColor(index),
    backgroundColor: getChartBorderColor(index),
    borderWidth: 2,
    tension: 0.3,
    fill: false,
    pointRadius: 3,
    pointHoverRadius: 5
  }));

  zoneMetricChartInstance = new Chart(zoneMetricChartCanvas, {
    type: "line",
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "nearest",
        intersect: false
      },
      plugins: {
        legend: {
          position: "top"
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Time"
          }
        },
        y: {
          title: {
            display: true,
            text: metric ? metric.unit : ""
          },
          beginAtZero: false
        }
      }
    }
  });
}

function renderInvalidState() {
  if (zoneMetricsHeader) {
    zoneMetricsHeader.innerHTML = `
      <h2 class="zoneMetricsTitle">Zone Metric Details</h2>
      <p class="zoneMetricsSubtitle">Invalid selection</p>
      <p class="zoneMetricsDescription">
        The zone or metric in the URL could not be found.
      </p>
    `;
  }

  if (zoneMetricsSummaryRow) {
    zoneMetricsSummaryRow.innerHTML = "";
  }

    if (zoneMetricsGaugeGrid) {
    zoneMetricsGaugeGrid.innerHTML = `
        <p class="zoneMetricsEmptyState">
        Check the URL parameters and try again.
        </p>
    `;
    }
}

function initZoneMetricPage() {
  const params = new URLSearchParams(window.location.search);
  const zoneId = params.get("zone");
  const metricKey = params.get("metric");

  const zone = hamiltonOperatorData.zones.find((item) => item.id === zoneId);
  const metric = getMetricDefinition(metricKey);

  if (!zone || !metric) {
    renderInvalidState();
    return;
  }

  const sensors = zone.sensors.filter((sensor) => sensor.sensorType === metricKey);

  renderHeader(zone, metric);
  renderSummaryCards(metric.key, metric.unit, sensors);
  renderChart(metric.key, sensors);
  renderGaugeGrid(metric.key, metric.unit, zone, sensors);
}

initZoneMetricPage();