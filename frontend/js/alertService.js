/**
 * Alert Service Module
 * Handles monitoring sensor data and sending SMS alerts to user phones
 */

// Store active alerts to prevent duplicate notifications
const activeAlerts = new Map();

// alert threshold configuration (can be customized)
export const defaultAlertThresholds = {
  airQuality: { high: 150, critical: 180 },
  temperature: { high: 35, critical: 40, low: 0, critical_low: -5 },
  humidity: { high: 80, critical: 90, low: 20, critical_low: 10 },
  noiseLevel: { high: 90, critical: 110 }
};

/**
 * Check if a sensor reading exceeds alert thresholds
 * @param {string} metricId - The metric ID (airQuality, temperature, etc.)
 * @param {number} value - The current sensor value
 * @param {object} thresholds - Custom thresholds
 * @returns {object} - { shouldAlert: boolean, severity: 'high'|'critical'|null, level: number }
 */
export function checkAlertThreshold(metricId, value, thresholds = defaultAlertThresholds) {
  if (!thresholds[metricId]) {
    return { shouldAlert: false, severity: null, level: value };
  }

  const metric = thresholds[metricId];

  // Check for critical values
  if (metric.critical !== undefined && value >= metric.critical) {
    return { shouldAlert: true, severity: 'critical', level: value };
  }

  if (metric.critical_low !== undefined && value <= metric.critical_low) {
    return { shouldAlert: true, severity: 'critical', level: value };
  }

  // Check for high/warning values
  if (metric.high !== undefined && value >= metric.high) {
    return { shouldAlert: true, severity: 'high', level: value };
  }

  if (metric.low !== undefined && value <= metric.low) {
    return { shouldAlert: true, severity: 'high', level: value };
  }

  return { shouldAlert: false, severity: null, level: value };
}

/**
 * Create alert key to track duplicate alerts
 * Prevents sending multiple alerts for same issue within timeout period
 */
function getAlertKey(zoneName, metricId, severity) {
  return `${zoneName}:${metricId}:${severity}`;
}

/**
 * Check if alert for this metric/zone/severity combo already exists
 * Alert is considered "active" if sent within the last 5 minutes
 */
export function isAlertActive(zoneName, metricId, severity) {
  const key = getAlertKey(zoneName, metricId, severity);
  const lastAlertTime = activeAlerts.get(key);

  if (!lastAlertTime) return false;

  const timeSinceLastAlert = Date.now() - lastAlertTime;
  const fifteenMinutes = 15 * 60 * 1000;

  return timeSinceLastAlert < fifteenMinutes;
}

/**
 * Mark an alert as active
 */
export function markAlertActive(zoneName, metricId, severity) {
  const key = getAlertKey(zoneName, metricId, severity);
  activeAlerts.set(key, Date.now());
}

/**
 * Clear an alert (when value returns to normal)
 */
export function clearAlert(zoneName, metricId, severity) {
  const key = getAlertKey(zoneName, metricId, severity);
  activeAlerts.delete(key);
}

/**
 * Format alert message for SMS
 */
export function formatAlertMessage(zoneName, metricId, value, unit, severity) {
  const severityText = severity === 'critical' ? 'CRITICAL' : 'WARNING';
  const metricLabel = getMetricLabel(metricId);
  return `[GeoAlert ${severityText}] ${zoneName}: ${metricLabel} at ${value}${unit}. Check dashboard for details.`;
}

/**
 * Get human-readable label for metric
 */
function getMetricLabel(metricId) {
  const labels = {
    airQuality: 'Air Quality',
    temperature: 'Temperature',
    humidity: 'Humidity',
    noiseLevel: 'Noise Level'
  };
  return labels[metricId] || metricId;
}

/**
 * Send SMS alert to user
 * This integrates with backend/SMS service (Twilio, AWS SNS, etc.)
 * 
 * @param {string} phoneNumber - User's phone number
 * @param {string} message - Alert message to send
 * @returns {Promise} - Resolves when SMS is sent
 */
export async function sendSmsAlert(phoneNumber, message) {
  try {
    // Call backend API endpoint to send SMS
    const response = await fetch('/api/alerts/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        message: message,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send SMS: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('SMS sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending SMS alert:', error);
    // Don't throw - log error but don't break the monitoring
    return { success: false, error: error.message };
  }
}

/**
 * Process sensor data and trigger alerts if needed
 * @param {object} zone - Zone object with sensor data
 * @param {object} userAlertSettings - User's alert settings including phone and thresholds
 */
export async function processZoneAlerts(zone, userAlertSettings) {
  if (!userAlertSettings || !userAlertSettings.phoneNumber || !userAlertSettings.enabled) {
    return;
  }

  const thresholds = userAlertSettings.customThresholds || defaultAlertThresholds;

  // Check each gauge in the zone
  for (const gauge of zone.gauges) {
    const result = checkAlertThreshold(gauge.id, gauge.value, thresholds);

    if (result.shouldAlert) {
      // Check if we already sent an alert for this recently
      if (!isAlertActive(zone.zoneName, gauge.id, result.severity)) {
        const message = formatAlertMessage(
          zone.zoneName,
          gauge.id,
          gauge.value,
          gauge.unit,
          result.severity
        );

        // Send SMS
        await sendSmsAlert(userAlertSettings.phoneNumber, message);

        // Mark as active to prevent duplicate alerts
        markAlertActive(zone.zoneName, gauge.id, result.severity);

        console.log(`Alert sent for ${zone.zoneName} - ${gauge.id}: ${message}`);
      }
    } else {
      // Value is normal, clear any active alerts
      if (isAlertActive(zone.zoneName, gauge.id, 'critical')) {
        clearAlert(zone.zoneName, gauge.id, 'critical');
      }
      if (isAlertActive(zone.zoneName, gauge.id, 'high')) {
        clearAlert(zone.zoneName, gauge.id, 'high');
      }
    }
  }
}

/**
 * Get alert history from storage
 */
export function getAlertHistory() {
  const stored = localStorage.getItem('geoalert_alert_history');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Log alert to history
 */
export function logAlert(zoneName, metricId, value, severity) {
  const history = getAlertHistory();
  history.push({
    timestamp: new Date().toISOString(),
    zone: zoneName,
    metric: metricId,
    value: value,
    severity: severity
  });

  // Keep only last 100 alerts
  if (history.length > 100) {
    history.shift();
  }

  localStorage.setItem('geoalert_alert_history', JSON.stringify(history));
}