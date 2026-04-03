/**
 * GeoAlert SMS Server
 * Simple Express.js backend for sending real SMS alerts via Twilio
 * 
 * Setup:
 * 1. Create .env file with Twilio credentials
 * 2. npm install express dotenv twilio cors body-parser
 * 3. node server.js
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client = null;

// Only initialize Twilio if credentials are valid (Account SID must start with 'AC')
if (accountSid && authToken && twilioPhoneNumber && accountSid.startsWith('AC')) {
  try {
    client = twilio(accountSid, authToken);
    console.log('✓ Twilio client initialized');
  } catch (error) {
    console.warn('⚠️  WARNING: Failed to initialize Twilio client:', error.message);
  }
} else if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.warn('⚠️  WARNING: Twilio credentials not found in .env file');
  console.warn('   SMS sending will not work. Set up your Twilio account first.');
  console.warn('   See docs/SMS_SETUP_GUIDE.md for instructions.');
} else {
  console.warn('⚠️  WARNING: Invalid Twilio credentials format');
  console.warn('   Account SID must start with "AC"');
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    twilioReady: !!client
  });
});

/**
 * POST /api/alerts/send-sms
 * Send an SMS alert
 */
app.post('/api/alerts/send-sms', async (req, res) => {
  try {
    const { phoneNumber, message, priority, timestamp } = req.body;

    console.log(`\n📱 SMS Alert Request:`);
    console.log(`   To: ${phoneNumber}`);
    console.log(`   Message: ${message}`);
    console.log(`   Priority: ${priority || 'normal'}`);
    console.log(`   Timestamp: ${timestamp}`);

    // Validate input
    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: phoneNumber, message',
        code: 'MISSING_FIELDS'
      });
    }

    if (!client) {
      // If Twilio not configured, still return success for testing
      console.log('⚠️  Twilio not configured - returning mock response');
      return res.json({
        success: true,
        messageId: `mock_${Date.now()}`,
        phoneNumber: phoneNumber,
        sentAt: new Date().toISOString(),
        status: 'mock_delivered',
        note: 'Twilio credentials not configured. This is a mock response.'
      });
    }

    // Normalize phone number to E.164 format
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = '+1' + formattedPhone;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    } else if (formattedPhone.length === 11 && formattedPhone[1] === '1') {
      formattedPhone = '+' + formattedPhone;
    }

    // Send SMS via Twilio
    console.log(`📤 Sending to: ${formattedPhone}`);
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedPhone
    });

    console.log(`✅ SMS Sent! Message SID: ${result.sid}`);
    console.log(`   Status: ${result.status}`);

    return res.json({
      success: true,
      messageId: result.sid,
      phoneNumber: formattedPhone,
      sentAt: new Date().toISOString(),
      status: result.status,
      twilioSid: result.sid
    });
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      code: 'SMS_SERVICE_ERROR'
    });
  }
});

/**
 * POST /api/alerts/configure
 * Configure alert settings
 */
app.post('/api/alerts/configure', (req, res) => {
  try {
    const { userId, phoneNumber, thresholds, monitoredZones, enabled } = req.body;

    console.log(`\n⚙️  Alert Configuration:`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Phone: ${phoneNumber}`);
    console.log(`   Zones: ${monitoredZones?.join(', ') || 'none'}`);
    console.log(`   Enabled: ${enabled}`);

    return res.json({
      success: true,
      userId: userId,
      message: 'Alert configuration updated',
      thresholdsApplied: thresholds
    });
  } catch (error) {
    console.error('Error configuring alerts:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/alerts/test
 * Send a test SMS
 */
app.post('/api/alerts/test', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    const testMessage = 'GeoAlert Test: Your SMS alerts are working! 🎉';

    console.log(`\n🧪 Test SMS:`);
    console.log(`   To: ${phoneNumber}`);
    console.log(`   Message: ${testMessage}`);

    if (!client) {
      console.log('⚠️  Twilio not configured - mock response');
      return res.json({
        success: true,
        message: 'Test SMS sent (mock)',
        phoneNumber: phoneNumber,
        messageId: `test_${Date.now()}`
      });
    }

    // Normalize phone
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = '+1' + formattedPhone;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    console.log(`📤 Sending to: ${formattedPhone}`);
    const result = await client.messages.create({
      body: testMessage,
      from: twilioPhoneNumber,
      to: formattedPhone
    });

    console.log(`✅ Test SMS sent! SID: ${result.sid}`);

    return res.json({
      success: true,
      message: 'Test SMS sent successfully',
      phoneNumber: formattedPhone,
      messageId: result.sid
    });
  } catch (error) {
    console.error('❌ Error sending test SMS:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Serve static files from frontend
 */
app.use(express.static(path.join(__dirname, '..', 'frontend'), { index: 'index.html' }));

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 GeoAlert SMS Server');
  console.log('='.repeat(50));
  console.log(`\n📍 Server running on: http://localhost:${PORT}`);
  console.log(`\n📱 Twilio Phone Number: ${twilioPhoneNumber || 'NOT CONFIGURED'}`);
  console.log(`✓ SMS Endpoint: POST /api/alerts/send-sms`);
  console.log(`✓ Health Check: GET /health`);
  
  if (!client) {
    console.log('\n⚠️  WARNING: Twilio not configured!');
    console.log('\nTo enable real SMS sending:');
    console.log('1. Sign up for Twilio: https://www.twilio.com/try-twilio');
    console.log('2. Create a .env file with:');
    console.log('   TWILIO_ACCOUNT_SID=your_sid');
    console.log('   TWILIO_AUTH_TOKEN=your_token');
    console.log('   TWILIO_PHONE_NUMBER=+1234567890');
    console.log('3. Restart this server\n');
  } else {
    console.log('\n✅ Twilio configured - SMS sending is live!\n');
  }
  console.log('='.repeat(50) + '\n');
});

module.exports = app;