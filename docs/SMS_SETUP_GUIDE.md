# 🚀 GeoAlert SMS Alert System - Quick Start

## 📱 Test Setup (Takes 5 minutes)

### Step 1: Get Free Twilio Account

1. Go to **https://www.twilio.com/try-twilio**
2. Sign up for a **free trial account** (no credit card required)
3. Verify your **phone number** (you'll get a verification code via SMS)
4. Skip the "Verify your business" step if you want

### Step 2: Get Your Twilio Credentials

1. After signup, go to **Twilio Console**: https://www.twilio.com/console
2. You'll see your "Account SID" on the dashboard
3. Click the eye icon to reveal your "Auth Token"
4. Go to **Phone Numbers** section (left menu)
5. Click on "Manage Phone Numbers" → "Active Numbers"
6. You'll see a Twilio phone number like `+1234567890`
7. Copy all three values:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: `your_auth_token_here`
   - **Twilio Phone**: `+1234567890` (or similar)

### Step 3: Create .env File

In the `/home/tharny/GeoAlert/` directory, create a file named `.env`:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
PORT=3000
```

Replace with your actual values from Twilio.

### Step 4: Install Dependencies & Start Server

```bash
cd /home/tharny/GeoAlert

# Install dependencies
npm install

# Start the SMS server
npm start
```

You should see:
```
🚀 GeoAlert SMS Server
==================================================
📍 Server running on: http://localhost:3000
✅ Twilio configured - SMS sending is live!
```

### Step 5: Test the SMS Alert

1. Open your browser to: **http://localhost:3000/ui/alerts.html**
2. You should see:
   - Phone number pre-filled: **647-746-9747**
   - Alerts **ENABLED** ✓
   - **Hamilton zone SELECTED** ✓
3. Click the **"Alerts"** button on the dashboard to go back
4. Click on **Hamilton** zone in the dropdown
5. Watch your phone - **you should get an SMS!** 📨

### Expected SMS Message

You'll receive a text message like:
```
[GeoAlert WARNING] Hamilton: Air Quality at 175AQI. Check dashboard for details.
```

## 🔧 What's Happening

1. **Fake Sensor Data** - Hamilton zone has extreme values that trigger alerts:
   - Air Quality: 175 AQI (Alert threshold: 150)
   - Temperature: 38°C (Alert threshold: 35°C)
   - Humidity: 85% (Alert threshold: 80%)
   - Noise: 95dB (Alert threshold: 90dB)

2. **Alert Detection** - When you view the dashboard or select Hamilton zone, the system checks these values

3. **SMS Sending** - If values exceed thresholds, `alertService.js` calls the backend `POST /api/alerts/send-sms`

4. **Twilio Integration** - Backend receives the request and sends real SMS via Twilio to YOUR PHONE

## 📊 Monitor Alerts

Open browser DevTools (F12) and check the **Console** tab to see real-time alert logs:

```
📱 SMS Alert Request:
   To: 647-746-9747
   Message: [GeoAlert WARNING] Hamilton: Air Quality at 175AQI...
   Priority: high
📤 Sending to: +16477469747
✅ SMS Sent! Message SID: SM1234567890abcdef
```

## 🐛 Troubleshooting

### No SMS received?

1. **Check server logs** - Are you seeing "✅ SMS Sent!" messages?
2. **Verify .env file** - Are your Twilio credentials correct?
3. **Check phone number** - Is "647-746-9747" the number you set up in Twilio?
4. **Browser console** - Check for JavaScript errors (F12)
5. **Twilio trial limit** - Twilio free trial can only send to verified phone numbers

### Twilio free trial restrictions

- Can only send SMS to the phone number you verified
- Limited to 100 SMS per day
- Cannot send to unverified numbers

To add verified numbers:
1. Go to https://www.twilio.com/console
2. Settings → Verified Caller IDs
3. Add your other phone numbers (you'll get SMS verification)

### Server won't start?

```bash
# Make sure dependencies are installed
npm install

# Check Node.js version (needs v14+)
node --version

# Kill any process on port 3000
lsof -ti:3000 | xargs kill -9
```

## 📡 API Testing

Test SMS sending without the web UI:

```bash
# Test SMS endpoint
curl -X POST http://localhost:3000/api/alerts/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+16477469747",
    "message": "[GeoAlert TEST] Testing SMS alerts!",
    "priority": "high"
  }'
```

## 🎯 What's Next?

- ✅ SMS alerts are sending to your phone
- 📊 View all alerts on the Alerts Settings page
- ⚙️ Customize thresholds for each metric
- 🔔 Set notification preferences (All/Critical only)
- 📱 Add more phone numbers (upgrade from Twilio free trial)

## 📚 Full Documentation

See [ALERT_FEATURE_README.md](ALERT_FEATURE_README.md) for complete documentation.

---

**Questions?** Check the server logs in the terminal for detailed error messages.
