export const sensorZones = [
  {
    id: "hamilton",
    zoneName: "Hamilton",
    updatedAt: new Date().toLocaleTimeString(),
    gauges: [
      {
        id: "airQuality",
        label: "Air Quality",
        unit: "AQI",
        value: 175,
        min: 0,
        max: 200,
        status: "Critical Alert 🚨"
      },
      {
        id: "temperature",
        label: "Temperature",
        unit: "°C",
        value: 38,
        min: -10,
        max: 40,
        status: "High Alert ⚠️"
      },
      {
        id: "humidity",
        label: "Humidity",
        unit: "%",
        value: 85,
        min: 0,
        max: 100,
        status: "High Alert ⚠️"
      },
      {
        id: "noiseLevel",
        label: "Noise Level",
        unit: "dB",
        value: 95,
        min: 30,
        max: 120,
        status: "Critical Alert 🚨"
      }
    ]
  },
  {
    id: "scarborough",
    zoneName: "Scarborough",
    updatedAt: "10:44 AM",
    gauges: [
      {
        id: "airQuality",
        label: "Air Quality",
        unit: "AQI",
        value: 96,
        min: 0,
        max: 200,
        status: "Elevated"
      },
      {
        id: "temperature",
        label: "Temperature",
        unit: "°C",
        value: 27,
        min: -10,
        max: 40,
        status: "Warm"
      },
      {
        id: "humidity",
        label: "Humidity",
        unit: "%",
        value: 49,
        min: 0,
        max: 100,
        status: "Stable"
      },
      {
        id: "noiseLevel",
        label: "Noise Level",
        unit: "dB",
        value: 93,
        min: 30,
        max: 120,
        status: "High"
      }
    ]
  },
  {
    id: "burlington",
    zoneName: "Burlington",
    updatedAt: "10:46 AM",
    gauges: [
      {
        id: "airQuality",
        label: "Air Quality",
        unit: "AQI",
        value: 41,
        min: 0,
        max: 200,
        status: "Good"
      },
      {
        id: "temperature",
        label: "Temperature",
        unit: "°C",
        value: 22,
        min: -10,
        max: 40,
        status: "Normal"
      },
      {
        id: "humidity",
        label: "Humidity",
        unit: "%",
        value: 64,
        min: 0,
        max: 100,
        status: "Comfortable"
      },
      {
        id: "noiseLevel",
        label: "Noise Level",
        unit: "dB",
        value: 52,
        min: 30,
        max: 120,
        status: "Low"
      }
    ]
  }
];