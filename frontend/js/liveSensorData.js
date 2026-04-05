async function fetchOperatorCityData(cityId = "hamilton", minutes = 60) {
  const baseUrl = "https://z0kfbot2qb.execute-api.us-east-1.amazonaws.com";

  const response = await fetch(
    `${baseUrl}/api/operator?cityId=${encodeURIComponent(cityId)}&minutes=${encodeURIComponent(minutes)}`
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Failed to load live sensor data: ${response.status} ${errorBody}`);
  }

  return response.json();
}

function calculateAverage(values) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getLatestReading(sensor) {
  if (!sensor.readings || !sensor.readings.length) {
    return null;
  }

  return sensor.readings[sensor.readings.length - 1];
}

function getMetricStatus(metricId, value) {
  if (value === null || value === undefined) {
    return "Unavailable";
  }

  if (metricId === "airQuality") {
    if (value >= 100) return "Critical";
    if (value >= 80) return "Elevated";
    return "Normal";
  }

  if (metricId === "temperature") {
    if (value >= 32) return "Critical";
    if (value >= 27) return "Elevated";
    return "Normal";
  }

  if (metricId === "humidity") {
    if (value >= 85) return "Critical";
    if (value >= 70) return "Elevated";
    return "Normal";
  }

  if (metricId === "noiseLevel") {
    if (value >= 95) return "Critical";
    if (value >= 80) return "Elevated";
    return "Normal";
  }

  return "Normal";
}

function getGaugeRange(metricId) {
  if (metricId === "airQuality") {
    return { min: 0, max: 120, label: "Air Quality", unit: "AQI" };
  }

  if (metricId === "temperature") {
    return { min: 0, max: 40, label: "Temperature", unit: "°C" };
  }

  if (metricId === "humidity") {
    return { min: 0, max: 100, label: "Humidity", unit: "%" };
  }

  if (metricId === "noiseLevel") {
    return { min: 0, max: 120, label: "Noise Level", unit: "dB" };
  }

  return { min: 0, max: 100, label: metricId, unit: "" };
}

function formatUpdatedAt(isoString) {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function buildGauge(zone, metricId) {
  const sensors = zone.sensors.filter((sensor) => sensor.sensorType === metricId);

  const latestValues = sensors
    .map((sensor) => getLatestReading(sensor))
    .filter(Boolean)
    .map((reading) => reading.value);

  const averageValue = calculateAverage(latestValues);
  const metricMeta = getGaugeRange(metricId);

  return {
    id: metricId,
    label: metricMeta.label,
    value:
      averageValue === null
        ? 0
        : metricId === "temperature"
          ? Number(averageValue.toFixed(1))
          : Math.round(averageValue),
    unit: metricMeta.unit,
    min: metricMeta.min,
    max: metricMeta.max,
    status: getMetricStatus(metricId, averageValue)
  };
}

function transformApiDataToSensorZones(apiData) {
  return apiData.zones.map((zone) => ({
    id: zone.id,
    zoneName: zone.zoneName,
    updatedAt: formatUpdatedAt(apiData.updatedAt),
    gauges: [
      buildGauge(zone, "airQuality"),
      buildGauge(zone, "temperature"),
      buildGauge(zone, "humidity"),
      buildGauge(zone, "noiseLevel")
    ]
  }));
}

export async function loadSensorZones(cityId = "hamilton", minutes = 60) {
  const apiData = await fetchOperatorCityData(cityId, minutes);
  return transformApiDataToSensorZones(apiData);
}