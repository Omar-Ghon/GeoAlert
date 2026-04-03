/**
 * GeoAlert Phone SMS Backend Service
 * Example implementation for sending SMS alerts
 * 
 * This file demonstrates how to implement the backend API endpoints
 * for sending SMS alerts. You can use services like:
 * - Twilio (SMS)
 * - AWS SNS (SNS SMS)
 * - Firebase Cloud Messaging (FCM)
 * - Send Grid
 * - Nexmo/Vonage
 * 
 * Install the package manager dependency:
 * npm install twilio dotenv
 */

// Example using Express.js and Twilio
// const express = require('express');
// const twilio = require('twilio');
// require('dotenv').config();

// const app = express();
// app.use(express.json());

// Initialize Twilio client
// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

/**
 * POST /api/alerts/send-sms
 * Send an SMS alert to a user's phone
 * 
 * Expected request body:
 * {
 *   "phoneNumber": "+1-555-123-4567",
 *   "message": "Alert message",
 *   "timestamp": "2026-04-01T10:30:00Z"
 * }
 */

// app.post('/api/alerts/send-sms', async (req, res) => {
//   try {
//     const { phoneNumber, message, timestamp } = req.body;

//     // Validate inputs
//     if (!phoneNumber || !message) {
//       return res.status(400).json({
//         success: false,
//         error: 'Missing required fields: phoneNumber, message',
//         code: 'MISSING_FIELDS'
//       });
//     }

//     if (message.length > 320) {
//       return res.status(400).json({
//         success: false,
//         error: 'Message exceeds maximum length (320 characters)',
//         code: 'MESSAGE_TOO_LONG'
//       });
//     }

//     // Format phone number (example with Twilio E.164 format)
//     const formattedPhone = formatPhoneNumber(phoneNumber);

//     // Send SMS via Twilio
//     const smsResult = await twilioClient.messages.create({
//       body: message,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to: formattedPhone
//     });

//     // Log the alert (optional: store in database)
//     await logAlert({
//       phoneNumber: formattedPhone,
//       message: message,
//       messageId: smsResult.sid,
//       timestamp: timestamp || new Date().toISOString(),
//       status: 'sent',
//       cost: smsResult.price || 0
//     });

//     return res.status(200).json({
//       success: true,
//       messageId: smsResult.sid,
//       phoneNumber: formattedPhone,
//       sentAt: new Date().toISOString(),
//       status: 'delivered'
//     });
//   } catch (error) {
//     console.error('Error sending SMS:', error);

//     return res.status(500).json({
//       success: false,
//       error: error.message,
//       code: 'SMS_SERVICE_ERROR'
//     });
//   }
// });

/**
 * Alternative implementation using AWS SNS
 */

// const AWS = require('aws-sdk');
// const sns = new AWS.SNS({
//   region: process.env.AWS_REGION || 'us-east-1'
// });

// async function sendSmsViaAWS(phoneNumber, message) {
//   const params = {
//     Message: message,
//     PhoneNumber: phoneNumber,
//     MessageAttributes: {
//       'AWS.SNS.SMS.SmsType': {
//         DataType: 'String',
//         StringValue: 'Transactional' // or 'Promotional'
//       }
//     }
//   };

//   try {
//     const result = await sns.publish(params).promise();
//     return {
//       success: true,
//       messageId: result.MessageId,
//       status: 'sent'
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: error.message
//     };
//   }
// }

/**
 * POST /api/alerts/configure
 * Configure alert thresholds and preferences for a user
 */

// app.post('/api/alerts/configure', async (req, res) => {
//   try {
//     const { userId, phoneNumber, thresholds, monitoredZones, enabled } = req.body;

//     // Validate phone number
//     if (!validatePhoneNumber(phoneNumber)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid phone number format',
//         code: 'INVALID_PHONE'
//       });
//     }

//     // Save configuration to database
//     // example: await UserAlertSettings.update(userId, {
//     //   phoneNumber,
//     //   thresholds,
//     //   monitoredZones,
//     //   enabled
//     // });

//     return res.status(200).json({
//       success: true,
//       userId: userId,
//       message: 'Alert configuration updated',
//       thresholdsApplied: thresholds
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: error.message,
//       code: 'CONFIG_ERROR'
//     });
//   }
// });

/**
 * GET /api/alerts/history
 * Retrieve alert history for a user
 */

// app.get('/api/alerts/history', async (req, res) => {
//   try {
//     const { userId, limit = 50, zone, startDate, endDate } = req.query;

//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         error: 'userId parameter is required',
//         code: 'MISSING_USER_ID'
//       });
//     }

//     // Validate limit
//     const validLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 500);

//     // Query alerts from database
//     // Example:
//     // let query = AlertHistory.where('userId', userId);
//     // if (zone) query = query.where('zone', zone);
//     // if (startDate) query = query.where('timestamp', '>=', new Date(startDate));
//     // if (endDate) query = query.where('timestamp', '<=', new Date(endDate));
//     // const alerts = await query.sort('-timestamp').limit(validLimit);

//     return res.status(200).json({
//       success: true,
//       alerts: [], // alerts from database
//       total: 0,
//       returned: 0
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: error.message,
//       code: 'QUERY_ERROR'
//     });
//   }
// });

/**
 * POST /api/alerts/test
 * Send a test SMS alert to verify configuration
 */

// app.post('/api/alerts/test', async (req, res) => {
//   try {
//     const { phoneNumber } = req.body;

//     if (!phoneNumber) {
//       return res.status(400).json({
//         success: false,
//         error: 'Phone number is required',
//         code: 'MISSING_PHONE'
//       });
//     }

//     const testMessage = 'GeoAlert Test: Your SMS alerts are working correctly!';
//     const formattedPhone = formatPhoneNumber(phoneNumber);

//     const result = await twilioClient.messages.create({
//       body: testMessage,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to: formattedPhone
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'Test SMS sent successfully',
//       phoneNumber: formattedPhone,
//       messageId: result.sid
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: error.message,
//       code: 'TEST_SMS_ERROR'
//     });
//   }
// });

/**
 * Helper functions
 */

function validatePhoneNumber(phoneNumber) {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check for reasonable phone number length (10-15 digits)
  return cleaned.length >= 10 && cleaned.length <= 15;
}

function formatPhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format as E.164 international format
  if (cleaned.length === 10) {
    return `+1${cleaned}`; // US default
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+${cleaned}`;
  }
  
  if (cleaned.length > 10 && cleaned[0] !== '1') {
    return `+${cleaned}`;
  }
  
  return `+1${cleaned}`;
}

/**
 * Log alerts to database or file
 * This helps with audit trails and usage tracking
 */

async function logAlert(alertData) {
  // Example: Save to database
  // await AlertLog.create(alertData);
  
  // Or save to file
  // const fs = require('fs');
  // fs.appendFileSync('alert_log.json', JSON.stringify(alertData) + '\n');
  
  console.log('[Alert Logged]', alertData);
}

/**
 * Periodic alert processor
 * Run this function periodically (e.g., every minute) to check sensors
 * and send alerts to users
 */

// async function processAlertsFromSensors() {
//   try {
//     // Get all active users with alert settings
//     // const users = await UserAlertSettings.find({ enabled: true });

//     // For each user, check monitored zones
//     // for (const user of users) {
//     //   for (const zoneId of user.monitoredZones) {
//     //     const zoneData = await getSensorData(zoneId);
//     //     const alerts = checkAlertThresholds(zoneData, user.thresholds);
//     //     
//     //     for (const alert of alerts) {
//     //       await sendSmsAlert(user.phoneNumber, alert.message);
//     //     }
//     //   }
//     // }
//   } catch (error) {
//     console.error('Error processing sensor alerts:', error);
//   }
// }

/**
 * Environment variables needed (.env file)
 * 
 * TWILIO_ACCOUNT_SID=your_account_sid
 * TWILIO_AUTH_TOKEN=your_auth_token
 * TWILIO_PHONE_NUMBER=+1234567890
 * 
 * AWS_REGION=us-east-1
 * AWS_ACCESS_KEY_ID=your_key
 * AWS_SECRET_ACCESS_KEY=your_secret
 * 
 * DATABASE_URL=your_database_connection
 * API_PORT=3000
 */

// Start server
// const PORT = process.env.API_PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`GeoAlert API server running on port ${PORT}`);
// });

module.exports = {
  validatePhoneNumber,
  formatPhoneNumber,
  logAlert
};