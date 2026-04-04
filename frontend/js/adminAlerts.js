import { hamiltonOperatorData } from "./operatorSensorData.js";

const RULES_STORAGE_KEY = "geoAlertAdminRules";
const AUDIT_STORAGE_KEY = "geoAlertAdminAudit";
const TRIGGERED_STORAGE_KEY = "geoAlertTriggeredAlerts";

export const metricConfig = {
  airQuality: {
    label: "Air Quality",
    unit: "AQI"
  },
  temperature: {
    label: "Temperature",
    unit: "°C"
  },
  humidity: {
    label: "Humidity",
    unit: "%"
  },
  noiseLevel: {
    label: "Noise Level",
    unit: "dB"
  }
};

const defaultRules = [
  {
    id: "rule-001",
    ruleName: "Central Hamilton AQI Warning",
    zoneId: "central-hamilton",
    metric: "airQuality",
    evaluationType: "zoneAverage",
    comparison: "greaterThan",
    threshold: 90,
    window: "fiveMinuteAverage",
    severity: "warning",
    alertMessage: "Central Hamilton air quality has moved above the warning threshold and should be watched closely.",
    enabled: true,
    createdAt: "2026-04-03T12:00:00"
  },
  {
    id: "rule-002",
    ruleName: "Stoney Creek Noise Critical",
    zoneId: "stoney-creek",
    metric: "noiseLevel",
    evaluationType: "singleSensor",
    comparison: "greaterThan",
    threshold: 80,
    window: "latest",
    severity: "critical",
    alertMessage: "A Stoney Creek noise sensor has exceeded the critical threshold and may require immediate operator attention.",
    enabled: true,
    createdAt: "2026-04-03T12:02:00"
  }
];

export function getCityData() {
  return hamiltonOperatorData;
}

export function getZones() {
  return hamiltonOperatorData.zones ?? [];
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

export function createRule(ruleInput) {
  const newRule = {
    id: buildId("rule"),
    ruleName: ruleInput.ruleName.trim(),
    zoneId: ruleInput.zoneId,
    metric: ruleInput.metric,
    evaluationType: ruleInput.evaluationType,
    comparison: ruleInput.comparison,
    threshold: Number(ruleInput.threshold),
    window: ruleInput.window,
    severity: ruleInput.severity,
    alertMessage: ruleInput.alertMessage.trim(),
    enabled: true,
    createdAt: new Date().toISOString()
  };

  const rules = getRules();
  rules.unshift(newRule);
  writeJson(RULES_STORAGE_KEY, rules);

  addAuditEntry(
    "Created alert rule",
    `${newRule.ruleName} was created for ${getZoneName(newRule.zoneId)} ${metricConfig[newRule.metric].label.toLowerCase()}.`
  );

  return newRule;
}

export function deleteRule(ruleId) {
  const rules = getRules();
  const ruleToDelete = rules.find((rule) => rule.id === ruleId);
  const updatedRules = rules.filter((rule) => rule.id !== ruleId);

  writeJson(RULES_STORAGE_KEY, updatedRules);

  if (ruleToDelete) {
    addAuditEntry(
      "Deleted alert rule",
      `${ruleToDelete.ruleName} was deleted by the administrator.`
    );
  }
}

export function toggleRuleEnabled(ruleId) {
  const rules = getRules();
  const updatedRules = rules.map((rule) => {
    if (rule.id === ruleId) {
      return {
        ...rule,
        enabled: !rule.enabled
      };
    }
    return rule;
  });

  writeJson(RULES_STORAGE_KEY, updatedRules);

  const changedRule = updatedRules.find((rule) => rule.id === ruleId);
  if (changedRule) {
    addAuditEntry(
      changedRule.enabled ? "Enabled alert rule" : "Disabled alert rule",
      `${changedRule.ruleName} is now ${changedRule.enabled ? "enabled" : "disabled"}.`
    );
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

export function evaluateRulesAgainstCurrentData() {
  const rules = getRules().filter((rule) => rule.enabled);
  const triggeredAlerts = [];

  for (const rule of rules) {
    const evaluation = evaluateSingleRule(rule, hamiltonOperatorData);

    if (evaluation.triggered) {
      triggeredAlerts.push({
        id: buildId("alert"),
        ruleId: rule.id,
        ruleName: rule.ruleName,
        zoneId: rule.zoneId,
        zoneName: getZoneName(rule.zoneId),
        metric: rule.metric,
        metricLabel: metricConfig[rule.metric].label,
        severity: rule.severity,
        reading: evaluation.reading,
        unit: metricConfig[rule.metric].unit,
        status: "active",
        message: rule.alertMessage,
        triggeredAt: new Date().toISOString(),
        evaluationType: rule.evaluationType
      });
    }
  }

  writeJson(TRIGGERED_STORAGE_KEY, triggeredAlerts);

  addAuditEntry(
    "Ran alert evaluation",
    `${rules.length} active rule${rules.length === 1 ? "" : "s"} evaluated against the current Hamilton dataset.`
  );

  return triggeredAlerts;
}

export function getRuleStats() {
  const rules = getRules();
  const activeRules = rules.filter((rule) => rule.enabled).length;
  const triggeredAlerts = getTriggeredAlerts().length;

  return {
    cityName: hamiltonOperatorData.cityName,
    zoneCount: getZones().length,
    activeRules,
    triggeredAlerts
  };
}

export function getZoneName(zoneId) {
  if (zoneId === "all-zones") {
    return "All Zones";
  }

  const zone = getZones().find((item) => item.id === zoneId);
  return zone ? zone.zoneName : zoneId;
}

export function formatRuleEvaluation(rule) {
  const evaluationLabel = rule.evaluationType === "zoneAverage" ? "Zone Average" : "Single Sensor";
  const comparisonLabel = rule.comparison === "greaterThan" ? ">" : "<";
  const windowLabel = rule.window === "fiveMinuteAverage" ? "5-min avg" : "latest";
  const unit = metricConfig[rule.metric]?.unit ?? "";

  return `${evaluationLabel} (${windowLabel}) ${comparisonLabel} ${rule.threshold} ${unit}`.trim();
}

function evaluateSingleRule(rule, cityData) {
  const matchingZones = rule.zoneId === "all-zones"
    ? cityData.zones
    : cityData.zones.filter((zone) => zone.id === rule.zoneId);

  if (matchingZones.length === 0) {
    return { triggered: false, reading: null };
  }

  let readings = [];

  for (const zone of matchingZones) {
    const metricSensors = zone.sensors.filter((sensor) => sensor.sensorType === rule.metric);

    if (rule.evaluationType === "singleSensor") {
      const sensorValues = metricSensors.map((sensor) => getSensorWindowValue(sensor, rule.window));
      readings.push(...sensorValues.filter((value) => Number.isFinite(value)));
    } else {
      const zoneSensorValues = metricSensors
        .map((sensor) => getSensorWindowValue(sensor, rule.window))
        .filter((value) => Number.isFinite(value));

      if (zoneSensorValues.length > 0) {
        readings.push(average(zoneSensorValues));
      }
    }
  }

  if (readings.length === 0) {
    return { triggered: false, reading: null };
  }

  const reading = rule.evaluationType === "singleSensor"
    ? (rule.comparison === "greaterThan" ? Math.max(...readings) : Math.min(...readings))
    : average(readings);

  const triggered = compareReading(reading, rule.comparison, rule.threshold);

  return {
    triggered,
    reading: Number(reading.toFixed(2))
  };
}

function getSensorWindowValue(sensor, window) {
  const readings = sensor.readings ?? [];
  if (readings.length === 0) {
    return null;
  }

  if (window === "latest") {
    return readings[readings.length - 1].value;
  }

  return average(readings.map((reading) => reading.value));
}

function compareReading(reading, comparison, threshold) {
  if (comparison === "lessThan") {
    return reading < threshold;
  }

  return reading > threshold;
}

function average(values) {
  if (!values.length) {
    return 0;
  }

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