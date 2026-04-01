# GeoAlert Phone Alert Feature

## Overview

The **Phone Alert Feature** enables real-time SMS notifications to users' phones when environmental sensor readings exceed configured thresholds. This system monitors data from multiple geographic zones and automatically sends alerts based on customizable alert levels.

## Features

✅ **SMS Notifications** - Real-time alerts sent directly to user's phone
✅ **Customizable Thresholds** - Set alert triggers for each metric and zone
✅ **Alert Levels** - Support for both "High" and "Critical" severity levels
✅ **Zone Monitoring** - Monitor specific zones of interest
✅ **Alert History** - Track all sent alerts with timestamps
✅ **Duplicate Prevention** - Prevents alert spam with smart deduplication
✅ **User Settings Management** - Store and manage alert preferences locally

## Architecture

### Components

#### 1. **alertService.js**
Core alert monitoring and SMS sending logic.

**Key Functions:**
- `checkAlertThreshold(metricId, value, thresholds)` - Checks if sensor reading exceeds alert thresholds
- `sendSmsAlert(phoneNumber, message)` - Sends SMS via backend API
- `processZoneAlerts(zone, userAlertSettings)` - Processes a zone and triggers alerts if needed
- `isAlertActive()` - Prevents duplicate alerts within 15-minute window
- `formatAlertMessage()` - Creates human-readable alert messages

**Default Alert Thresholds:**
```javascript
{
  airQuality: { high: 150, critical: 180 },
  temperature: { high: 35, critical: 40, low: 0, critical_low: -5 },
  humidity: { high: 80, critical: 90, low: 20, critical_low: 10 },
  noiseLevel: { high: 90, critical: 110 }
}
```

#### 2. **userManager.js**
Manages user settings, phone numbers, and alert preferences using localStorage.

**Key Functions:**
- `setPhoneNumber(phoneNumber)` - Register user's phone number
- `setAlertsEnabled(enabled)` - Enable/disable alerts
- `setAlertThreshold(metricId, thresholdType, value)` - Customize thresholds
- `addMonitoredZone(zoneId)` - Select zones to monitor
- `setNotificationPreference()` - Set alert severity level preference
- `getUserSettings()` / `saveUserSettings()` - Load and save user configuration

#### 3. **ui/alerts.html**
User interface for managing alert settings.

**Sections:**
- Phone number registration with verification
- Alert enable/disable toggle
- Notification level selection
- Zone selection checklist
- Customizable threshold inputs for each metric
- Recent alerts history
- Export/import settings

#### 4. **script.js (Updated)**
Main dashboard script integrated with alert monitoring.

**Changes:**
- Added imports for `alertService` and `userManager`
- Integrated `processZoneAlerts()` in `renderZoneData()`
- Added 5-minute periodic alert checks

## Usage Guide

### For End Users

#### 1. **Set Up Phone Alerts**
1. Navigate to the **Alerts** page from the main dashboard
2. Enter your phone number in the "Phone Number" field
3. Click **Verify** to validate the number
4. Toggle **Enable Alerts** to activate

#### 2. **Configure Alert Thresholds**
- Scroll to "Alert Thresholds" section
- Adjust the values for each metric:
  - **Air Quality (AQI)**: 0-200 scale
  - **Temperature (°C)**: Based on your preference
  - **Humidity (%)**: 0-100 scale
  - **Noise Level (dB)**: 30-120 scale

#### 3. **Select Zones to Monitor**
- Check the zones you want to receive alerts for
- Only selected zones will trigger SMS notifications

#### 4. **Set Notification Level**
- **All Alerts**: Receive both High and Critical alerts
- **Critical Only**: Receive only critical level alerts
- **Disabled**: No SMS alerts will be sent

#### 5. **Save Settings**
- Click **Save Settings** to apply all changes
- Your preferences are saved locally in browser

### Example Alert Messages

```
[GeoAlert WARNING] Hamilton: Air Quality at 152AQI. Check dashboard for details.
```

```
[GeoAlert CRITICAL] Scarborough: Noise Level at 95dB. Check dashboard for details.
```

## For Developers

### Backend API Integration

The frontend calls the following backend API endpoint:

```
POST /api/alerts/send-sms
```

**Request:**
```json
{
  "phoneNumber": "+1-555-123-4567",
  "message": "[GeoAlert WARNING] Hamilton: Air Quality at 150AQI.",
  "timestamp": "2026-04-01T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "msg_123456",
  "status": "delivered"
}
```

### Implementing the Backend

See `backend-alert-service.example.js` for a complete example implementation using:
- **Twilio** (Recommended for SMS)
- **AWS SNS** (Alternative SMS service)

#### Quick Start with Twilio

1. **Install dependencies:**
```bash
npm install twilio express dotenv
```

2. **Set environment variables (.env):**
```
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

3. **Uncomment and use the code in `backend-alert-service.example.js`**

### Data Flow

```
┌─────────────────────────────────────────┐
│ Sensor Data in sensorData.js            │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ renderZoneData() in script.js            │
│ - Triggered on zone selection           │
│ - Calls processZoneAlerts()             │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ processZoneAlerts() in alertService.js  │
│ - Checks each gauge against thresholds  │
│ - Prevents duplicate alerts             │
│ - Formats alert message                 │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ sendSmsAlert() in alertService.js       │
│ - Calls backend API endpoint            │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Backend API (/api/alerts/send-sms)      │
│ - Validates phone number                │
│ - Sends SMS via Twilio/AWS/etc.         │
│ - Logs alert to database                │
└─────────────────────────────────────────┘
```

## Storage & Data Persistence

### Local Storage Keys

User settings are stored in browser localStorage:
- **Key**: `geoalert_user_settings`
- **Format**: JSON stringified object

Example:
```javascript
{
  "phoneNumber": "+1-555-123-4567",
  "alertsEnabled": true,
  "customThresholds": { ... },
  "monitoredZones": ["hamilton", "scarborough"],
  "notificationsPreference": "all",
  "lastUpdated": "2026-04-01T10:30:00Z"
}
```

### Alert History

- **Key**: `geoalert_alert_history`
- **Stored locally** using browser localStorage
- **Rotated**: Keeps only last 100 alerts

## Alert Deduplication Logic

The system prevents alert spam by tracking recent alerts:

- **Active Window**: 15 minutes after an alert is sent
- **Tracking Key**: `{zoneName}:{metricId}:{severity}`
- **Behavior**: Subsequent alerts for same issue within 15 minutes are suppressed

Example:
1. Alert sent: "Hamilton: Air Quality at 155 AQI" (High) - 10:00 AM
2. Alert suppressed: Reading at 156 AQI - 10:05 AM (within 15 min window)
3. Alert sent: Reading at 160 AQI (Critical) - 10:15 AM (different severity)

## Testing

### Manual Testing Steps

1. Open browser DevTools Console
2. Configure settings:
   ```javascript
   import * as userManager from './userManager.js';
   userManager.setPhoneNumber('+1-555-123-4567');
   userManager.setAlertsEnabled(true);
   userManager.addMonitoredZone('hamilton');
   ```

3. Test alert checking:
   ```javascript
   import { sensorZones } from './sensorData.js';
   import { checkAlertThreshold } from './alertService.js';
   
   const zone = sensorZones[0];
   const gauge = zone.gauges[0];
   checkAlertThreshold(gauge.id, gauge.value);
   ```

4. Test SMS sending (once backend is set up):
   ```javascript
   import { sendSmsAlert } from './alertService.js';
   sendSmsAlert('+1-555-123-4567', 'Test message');
   ```

## Limitations & Considerations

⚠️ **Current Implementation:**
- Phone numbers stored in browser localStorage (not encrypted)
- SMS sending requires working backend API
- No authentication/encryption for API calls
- Alert history is browser-local (not synced to server)

📋 **Recommended Enhancements:**
- Encrypt phone numbers at rest
- Implement API authentication (Bearer tokens, OAuth)
- Add rate limiting on SMS endpoint
- Store alert history in backend database
- Add SMS delivery status tracking
- Implement user authentication
- Add SMS cost tracking/billing
- Implement alert escalation (multiple recipients, etc.)

## API Documentation

For detailed API documentation, see [ui/api/alerts-api.html](ui/api/alerts-api.html)

## Files Added/Modified

**New Files:**
- `alertService.js` - Alert monitoring logic
- `userManager.js` - User settings management
- `ui/alerts.html` - Alert settings UI
- `ui/api/alerts-api.html` - API documentation
- `backend-alert-service.example.js` - Backend implementation example
- `ALERT_FEATURE_README.md` - This file

**Modified Files:**
- `index.html` - Added "Alerts" navigation button
- `script.js` - Integrated alert monitoring

## Future Enhancements

- [ ] Email alerts in addition to SMS
- [ ] Push notifications (Web Push API)
- [ ] Alert escalation (call if SMS not acknowledged)
- [ ] Slack/Teams integration
- [ ] Custom alert templates
- [ ] Smart alerts (ML-based anomaly detection)
- [ ] Multi-language support
- [ ] Alert scheduling (e.g., quiet hours)
- [ ] Alert analytics and reporting
- [ ] Mobile app integration

## Support & Questions

For issues or questions about the phone alert feature:
1. Check the [API Documentation](ui/api/alerts-api.html)
2. Review example backend code in [backend-alert-service.example.js](backend-alert-service.example.js)
3. Check browser console for error messages
4. Verify phone number format in alerts settings

## License

This feature is part of the GeoAlert system.
