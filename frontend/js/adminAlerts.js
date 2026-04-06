import { adminCityData } from "./operatorSensorData.js";

const RULES_STORAGE_KEY = "geoAlertAdminRules";
const AUDIT_STORAGE_KEY = "geoAlertAdminAudit";
const TRIGGERED_STORAGE_KEY = "geoAlertTriggeredAlerts";

export const metricConfig = {
  airQuality: { label: "Air Quality", unit: "AQI" },
  temperature: { label: "Temperature", unit: "°C" },
  humidity: { label: "Humidity", unit: "%" },
  noiseLevel: { label: "Noise Level", unit: "dB" }
};

import {
  getRulesApi,
  createRuleApi,
  updateRuleApi,
  deleteRuleApi
} from "./adminApi.js";

const severityOrder = ["mild", "moderate", "severe"];

const defaultRules = [
  {
    id: "rule-001",
    ruleName: "Central Hamilton Air Quality Alert",
    zoneId: "central-hamilton",
    metric: "airQuality",
    evaluationType: "zoneAverage",
    comparison: "greaterThan",
    window: "fiveMinuteAverage",
    levels: [
      {
        id: "mild",
        label: "Mild",
        threshold: 85,
        message: "Air quality is mildly elevated in Central Hamilton."
      },
      {
        id: "moderate",
        label: "Moderate",
        threshold: 90,
        message: "Air quality is moderately elevated in Central Hamilton."
      },
      {
        id: "severe",
        label: "Severe",
        threshold: 100,
        message: "Air quality is severely elevated in Central Hamilton."
      }
    ],
    createdAt: "2026-04-03T12:00:00",
    updatedAt: "2026-04-03T12:00:00"
  }
];

export function getAdminCities() {
  return adminCityData;
}

export function getCityData(cityId = "hamilton") {
  return adminCityData.find((city) => city.cityId === cityId) ?? hamiltonOperatorData;
}

export function getZones(cityId = "hamilton") {
  return getCityData(cityId).zones ?? [];
}

export function getMetrics() {
  return Object.entries(metricConfig).map(([value, config]) => ({
    value,
    label: config.label,
    unit: config.unit
  }));
}

export function seedDefaultRules(force = false) {
  const existing = readJson(RULES_STORAGE_KEY, []);
  if (existing.length === 0 || force) {
    writeJson(RULES_STORAGE_KEY, defaultRules);
  }

  const audit = readJson(AUDIT_STORAGE_KEY, []);
  if ((audit.length === 0 || force) && force) {
    writeJson(AUDIT_STORAGE_KEY, []);
    addAuditEntry("Reset demo rules", "Administrator reset the local demo rules back to their defaults.");
  }

  if (force) {
    evaluateRulesAgainstCurrentData();
  }
}

export function getRules() {
  return readJson(RULES_STORAGE_KEY, defaultRules);
}

export function getRuleById(ruleId) {
  return getRules().find((rule) => rule.id === ruleId) ?? null;
}

export function createRule(ruleInput) {
const selectedCity = getCityData(ruleInput.cityId);

const newRule = {
  id: buildId("rule"),
  ruleName: ruleInput.ruleName.trim(),
  cityId: ruleInput.cityId,
  cityName: selectedCity.cityName,
  zoneId: ruleInput.zoneId,
  metric: ruleInput.metric,
  evaluationType: ruleInput.evaluationType,
  comparison: ruleInput.comparison,
  window: ruleInput.window,
  levels: normalizeLevels(ruleInput.levels),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

  const rules = getRules();
  rules.unshift(newRule);
  writeJson(RULES_STORAGE_KEY, rules);

  addAuditEntry(
    "Created alert rule",
    `${newRule.ruleName} was created with ${newRule.levels.length} configured alert level(s).`
  );

  return newRule;
}

export function updateRule(ruleId, ruleInput) {
  const rules = getRules();
  const updatedRules = rules.map((rule) => {
    if (rule.id !== ruleId) {
      return rule;
    }

    const selectedCity = getCityData(ruleInput.cityId);

    return {
    ...rule,
    ruleName: ruleInput.ruleName.trim(),
    cityId: ruleInput.cityId,
    cityName: selectedCity.cityName,
    zoneId: ruleInput.zoneId,
    metric: ruleInput.metric,
    evaluationType: ruleInput.evaluationType,
    comparison: ruleInput.comparison,
    window: ruleInput.window,
    levels: normalizeLevels(ruleInput.levels),
    updatedAt: new Date().toISOString()
    };
  });

  writeJson(RULES_STORAGE_KEY, updatedRules);

  const updatedRule = updatedRules.find((rule) => rule.id === ruleId);
  if (updatedRule) {
    addAuditEntry(
      "Updated alert rule",
      `${updatedRule.ruleName} was edited by the administrator.`
    );
  }

  return updatedRule;
}

export function deleteRule(ruleId) {
  const rules = getRules();
  const ruleToDelete = rules.find((rule) => rule.id === ruleId);
  const updatedRules = rules.filter((rule) => rule.id !== ruleId);

  writeJson(RULES_STORAGE_KEY, updatedRules);

  if (ruleToDelete) {
    addAuditEntry("Deleted alert rule", `${ruleToDelete.ruleName} was deleted by the administrator.`);
  }
}

export function getAuditEntries() {
  return readJson(AUDIT_STORAGE_KEY, []);
}

export function addAuditEntry(action, details) {
  const auditEntries = getAuditEntries();
  auditEntries.unshift({
    id: buildId("audit"),
    action,
    details,
    timestamp: new Date().toISOString()
  });

  writeJson(AUDIT_STORAGE_KEY, auditEntries);
}

export function getTriggeredAlerts() {
  return readJson(TRIGGERED_STORAGE_KEY, []);
}

export function getRuleStats(cityId = "hamilton") {
  const cityData = getCityData(cityId);
  const rules = getRules().filter((rule) => (rule.cityId || "hamilton") === cityId);
  const triggeredAlerts = getTriggeredAlerts().filter((alert) => {
    const rule = getRuleById(alert.ruleId);
    return (rule?.cityId || "hamilton") === cityId;
  }).length;

  return {
    cityName: cityData.cityName,
    zoneCount: cityData.zones?.length ?? 0,
    activeRules: rules.length,
    triggeredAlerts
  };
}

export function getZoneName(zoneId, cityId = "hamilton") {
  if (zoneId === "all-zones") {
    return "All Zones";
  }

  const zone = getZones(cityId).find((item) => item.id === zoneId);
  return zone ? zone.zoneName : zoneId;
}

export function formatRuleEvaluation(rule) {
  const evaluationLabel = rule.evaluationType === "zoneAverage" ? "Zone Average" : "Single Sensor";
  const windowLabel = rule.window === "fiveMinuteAverage" ? "5-min avg" : "Latest";
  return `${evaluationLabel}<br>(${windowLabel})`;
}

export function formatLevelsSummary(rule) {
  if (!rule.levels?.length) {
    return "No levels configured";
  }

  return rule.levels
    .map((level) => `${level.label}: ${rule.comparison === "greaterThan" ? ">" : "<"} ${level.threshold}`)
    .join("<br>");
}

export function evaluateRulesAgainstCurrentData() {
  const rules = getRules();
  const triggeredAlerts = [];

  for (const rule of rules) {
    const cityData = getCityData(rule.cityId);

    if (!cityData.sensors && cityData.cityId !== "hamilton" && cityData.zones.every((zone) => !zone.sensors.length)) {
    continue;
    }

    const reading = getRuleReading(rule, cityData);
    if (reading === null) {
      continue;
    }

    const triggeredLevel = getTriggeredLevel(rule, reading);

    if (triggeredLevel) {
      triggeredAlerts.push({
        id: buildId("alert"),
        ruleId: rule.id,
        ruleName: rule.ruleName,
        zoneId: rule.zoneId,
        zoneName: getZoneName(rule.zoneId, rule.cityId),
        metric: rule.metric,
        metricLabel: metricConfig[rule.metric].label,
        severity: triggeredLevel.id,
        severityLabel: triggeredLevel.label,
        reading: Number(reading.toFixed(2)),
        unit: metricConfig[rule.metric].unit,
        status: "active",
        message: triggeredLevel.message,
        triggeredAt: new Date().toISOString(),
        evaluationType: rule.evaluationType
      });
    }
  }

  writeJson(TRIGGERED_STORAGE_KEY, triggeredAlerts);

  addAuditEntry(
    "Ran alert evaluation",
    `${rules.length} rule${rules.length === 1 ? "" : "s"} evaluated against the current Hamilton dataset.`
  );

  return triggeredAlerts;
}

function normalizeLevels(levels) {
  return levels
    .filter((level) => level.enabled)
    .map((level) => ({
      id: level.id,
      label: (level.label || capitalize(level.id)).trim(),
      threshold: Number(level.threshold),
      message: level.message.trim()
    }))
    .sort((a, b) => severityOrder.indexOf(a.id) - severityOrder.indexOf(b.id));
}

function getRuleReading(rule, cityData) {
  const matchingZones = rule.zoneId === "all-zones"
    ? cityData.zones
    : cityData.zones.filter((zone) => zone.id === rule.zoneId);

  if (matchingZones.length === 0) {
    return null;
  }

  let readings = [];

  for (const zone of matchingZones) {
    const metricSensors = zone.sensors.filter((sensor) => sensor.sensorType === rule.metric);

    if (rule.evaluationType === "singleSensor") {
      const sensorValues = metricSensors
        .map((sensor) => getSensorWindowValue(sensor, rule.window))
        .filter((value) => Number.isFinite(value));

      readings.push(...sensorValues);
    } else {
      const zoneSensorValues = metricSensors
        .map((sensor) => getSensorWindowValue(sensor, rule.window))
        .filter((value) => Number.isFinite(value));

      if (zoneSensorValues.length > 0) {
        readings.push(average(zoneSensorValues));
      }
    }
  }

  if (!readings.length) {
    return null;
  }

  return rule.evaluationType === "singleSensor"
    ? (rule.comparison === "greaterThan" ? Math.max(...readings) : Math.min(...readings))
    : average(readings);
}

function getTriggeredLevel(rule, reading) {
  const matchedLevels = (rule.levels ?? []).filter((level) =>
    rule.comparison === "greaterThan"
      ? reading > level.threshold
      : reading < level.threshold
  );

  if (!matchedLevels.length) {
    return null;
  }

  matchedLevels.sort((a, b) => severityOrder.indexOf(b.id) - severityOrder.indexOf(a.id));
  return matchedLevels[0];
}

function getSensorWindowValue(sensor, window) {
  const readings = sensor.readings ?? [];
  if (!readings.length) {
    return null;
  }

  if (window === "latest") {
    return readings[readings.length - 1].value;
  }

  return average(readings.map((reading) => reading.value));
}

function average(values) {
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function buildId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function readJson(key, fallback) {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}