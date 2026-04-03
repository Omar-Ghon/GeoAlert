/**
 * User Manager Module
 * Manages user phone numbers, alert preferences, and settings
 */

import { defaultAlertThresholds } from './alertService.js';

const STORAGE_KEY = 'geoalert_user_settings';

/**
 * Initialize default user settings
 */
const defaultUserSettings = {
  phoneNumber: '',
  alertsEnabled: false,
  customThresholds: { ...defaultAlertThresholds },
  monitoredZones: [],
  lastUpdated: null,
  notificationsPreference: 'all' // 'all', 'critical', 'high', 'none'
};

/**
 * Get current user settings from localStorage
 */
export function getUserSettings() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return { ...defaultUserSettings };
}

/**
 * Save user settings to localStorage
 */
export function saveUserSettings(settings) {
  const validatedSettings = {
    ...defaultUserSettings,
    ...settings,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedSettings));
  return validatedSettings;
}

/**
 * Update phone number
 */
export function setPhoneNumber(phoneNumber) {
  // Validate phone number format (basic validation)
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length < 10) {
    throw new Error('Phone number must be at least 10 digits');
  }

  const settings = getUserSettings();
  settings.phoneNumber = phoneNumber;
  return saveUserSettings(settings);
}

/**
 * Get phone number
 */
export function getPhoneNumber() {
  return getUserSettings().phoneNumber;
}

/**
 * Enable/disable alerts
 */
export function setAlertsEnabled(enabled) {
  const settings = getUserSettings();
  settings.alertsEnabled = enabled;
  return saveUserSettings(settings);
}

/**
 * Check if alerts are enabled
 */
export function areAlertsEnabled() {
  return getUserSettings().alertsEnabled;
}

/**
 * Update alert threshold for a specific metric
 */
export function setAlertThreshold(metricId, thresholdType, value) {
  const settings = getUserSettings();

  if (!settings.customThresholds[metricId]) {
    settings.customThresholds[metricId] = { ...defaultAlertThresholds[metricId] };
  }

  settings.customThresholds[metricId][thresholdType] = value;
  return saveUserSettings(settings);
}

/**
 * Get alert thresholds for a metric
 */
export function getAlertThresholds(metricId) {
  const settings = getUserSettings();
  return settings.customThresholds[metricId] || defaultAlertThresholds[metricId];
}

/**
 * Update custom thresholds for all metrics
 */
export function setCustomThresholds(thresholds) {
  const settings = getUserSettings();
  settings.customThresholds = { ...thresholds };
  return saveUserSettings(settings);
}

/**
 * Add zone to monitored zones list
 */
export function addMonitoredZone(zoneId) {
  const settings = getUserSettings();
  if (!settings.monitoredZones.includes(zoneId)) {
    settings.monitoredZones.push(zoneId);
  }
  return saveUserSettings(settings);
}

/**
 * Remove zone from monitored zones
 */
export function removeMonitoredZone(zoneId) {
  const settings = getUserSettings();
  settings.monitoredZones = settings.monitoredZones.filter(id => id !== zoneId);
  return saveUserSettings(settings);
}

/**
 * Get list of monitored zones
 */
export function getMonitoredZones() {
  return getUserSettings().monitoredZones;
}

/**
 * Set notification preference level
 */
export function setNotificationPreference(preference) {
  if (!['all', 'critical', 'high', 'none'].includes(preference)) {
    throw new Error('Invalid preference. Must be: all, critical, high, or none');
  }

  const settings = getUserSettings();
  settings.notificationsPreference = preference;
  return saveUserSettings(settings);
}

/**
 * Get notification preference
 */
export function getNotificationPreference() {
  return getUserSettings().notificationsPreference;
}

/**
 * Check if phone number is configured
 */
export function isPhoneConfigured() {
  return getPhoneNumber().length > 0;
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phoneNumber;
}

/**
 * Export all user settings for backup
 */
export function exportSettings() {
  return getUserSettings();
}

/**
 * Import settings from backup
 */
export function importSettings(settings) {
  if (!settings || typeof settings !== 'object') {
    throw new Error('Invalid settings format');
  }
  return saveUserSettings(settings);
}

/**
 * Reset to default settings
 */
export function resetSettings() {
  return saveUserSettings(defaultUserSettings);
}