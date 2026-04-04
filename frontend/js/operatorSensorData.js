export const hamiltonOperatorData = {
  cityId: "hamilton",
  cityName: "Hamilton",
  updatedAt: "2026-04-03T11:20:00",
  alerts: [
    {
      id: "alert-001",
      severity: "critical",
      zoneId: "stoney-creek",
      metric: "noiseLevel",
      title: "Critical noise threshold exceeded",
      message: "Stoney Creek noise levels have remained above the critical threshold for the latest reading window.",
      timestamp: "2026-04-03T11:18:00"
    },
    {
      id: "alert-002",
      severity: "warning",
      zoneId: "Central hamilton",
      metric: "airQuality",
      title: "Elevated air quality levels detected",
      message: "Central Hamilton air quality readings are elevated and should be monitored closely.",
      timestamp: "2026-04-03T11:16:00"
    }
  ],
  zones: [
    {
      id: "central-hamilton",
      zoneName: "Central Hamilton",
      sensors: [
        {
          id: "ch-air-001",
          sensorType: "airQuality",
          label: "Central H Air Sensor 1",
          unit: "AQI",
            mapPosition: {
                x: 60,
                y: 45
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 89 },
            { timestamp: "2026-04-03T11:17:00", value: 91 },
            { timestamp: "2026-04-03T11:18:00", value: 93 },
            { timestamp: "2026-04-03T11:19:00", value: 92 },
            { timestamp: "2026-04-03T11:20:00", value: 95 }
          ]
        },
        {
          id: "ch-air-002",
          sensorType: "airQuality",
          label: "Central H Air Sensor 2",
          unit: "AQI",
          mapPosition: {
                x: 57,
                y: 60
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 85 },
            { timestamp: "2026-04-03T11:17:00", value: 87 },
            { timestamp: "2026-04-03T11:18:00", value: 90 },
            { timestamp: "2026-04-03T11:19:00", value: 88 },
            { timestamp: "2026-04-03T11:20:00", value: 91 }
          ]
        },
        {
          id: "ch-temp-001",
          sensorType: "temperature",
          label: "Central H Temp Sensor 1",
          unit: "°C",
          mapPosition: {
                x: 50,
                y: 50
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 24.1 },
            { timestamp: "2026-04-03T11:17:00", value: 24.3 },
            { timestamp: "2026-04-03T11:18:00", value: 24.4 },
            { timestamp: "2026-04-03T11:19:00", value: 24.5 },
            { timestamp: "2026-04-03T11:20:00", value: 24.6 }
          ]
        },
        {
          id: "ch-temp-002",
          sensorType: "temperature",
          label: "Central H Temp Sensor 2",
          unit: "°C",
          mapPosition: {
            x: 70,
            y: 50
          },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 23.8 },
            { timestamp: "2026-04-03T11:17:00", value: 24.0 },
            { timestamp: "2026-04-03T11:18:00", value: 24.1 },
            { timestamp: "2026-04-03T11:19:00", value: 24.2 },
            { timestamp: "2026-04-03T11:20:00", value: 24.3 }
          ]
        },
        {
          id: "ch-hum-001",
          sensorType: "humidity",
          label: "Central H Humidity Sensor 1",
          unit: "%",
            mapPosition: {
                x: 60,
                y: 50
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 57 },
            { timestamp: "2026-04-03T11:17:00", value: 58 },
            { timestamp: "2026-04-03T11:18:00", value: 58 },
            { timestamp: "2026-04-03T11:19:00", value: 59 },
            { timestamp: "2026-04-03T11:20:00", value: 60 }
          ]
        },
        {
          id: "ch-hum-002",
          sensorType: "humidity",
          label: "Central H Humidity Sensor 2",
          unit: "%",
          mapPosition: {
                x: 50,
                y: 55
          },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 55 },
            { timestamp: "2026-04-03T11:17:00", value: 56 },
            { timestamp: "2026-04-03T11:18:00", value: 57 },
            { timestamp: "2026-04-03T11:19:00", value: 57 },
            { timestamp: "2026-04-03T11:20:00", value: 58 }
          ]
        },
        {
          id: "ch-noise-001",
          sensorType: "noiseLevel",
          label: "Central H Noise Sensor 1",
          unit: "dB",
          mapPosition: {
            x: 65,
            y: 55
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 71 },
            { timestamp: "2026-04-03T11:17:00", value: 72 },
            { timestamp: "2026-04-03T11:18:00", value: 74 },
            { timestamp: "2026-04-03T11:19:00", value: 75 },
            { timestamp: "2026-04-03T11:20:00", value: 76 }
          ]
        },
        {
          id: "ch-noise-002",
          sensorType: "noiseLevel",
          label: "Central H Noise Sensor 2",
          unit: "dB",
          mapPosition: {
                x: 55,
                y: 50
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 68 },
            { timestamp: "2026-04-03T11:17:00", value: 69 },
            { timestamp: "2026-04-03T11:18:00", value: 70 },
            { timestamp: "2026-04-03T11:19:00", value: 71 },
            { timestamp: "2026-04-03T11:20:00", value: 72 }
          ]
        }
      ]
    },
    {
      id: "dundas",
      zoneName: "Dundas",
      sensors: [
        {
          id: "du-air-001",
          sensorType: "airQuality",
          label: "Dundas Air Sensor 1",
          unit: "AQI",
        mapPosition: {
            x: 45,
            y: 45
        },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 44 },
            { timestamp: "2026-04-03T11:17:00", value: 45 },
            { timestamp: "2026-04-03T11:18:00", value: 46 },
            { timestamp: "2026-04-03T11:19:00", value: 47 },
            { timestamp: "2026-04-03T11:20:00", value: 48 }
          ]
        },
        {
          id: "du-air-002",
          sensorType: "airQuality",
          label: "Dundas Air Sensor 2",
          unit: "AQI",
            mapPosition: {
                x: 38,
                y: 47
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 42 },
            { timestamp: "2026-04-03T11:17:00", value: 43 },
            { timestamp: "2026-04-03T11:18:00", value: 44 },
            { timestamp: "2026-04-03T11:19:00", value: 45 },
            { timestamp: "2026-04-03T11:20:00", value: 46 }
          ]
        },
        {
          id: "du-temp-001",
          sensorType: "temperature",
          label: "Dundas Temp Sensor 1",
          unit: "°C",
          mapPosition: {
                x: 50,
                y: 40
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 21.5 },
            { timestamp: "2026-04-03T11:17:00", value: 21.6 },
            { timestamp: "2026-04-03T11:18:00", value: 21.8 },
            { timestamp: "2026-04-03T11:19:00", value: 21.9 },
            { timestamp: "2026-04-03T11:20:00", value: 22.0 }
          ]
        },
        {
          id: "du-hum-001",
          sensorType: "humidity",
          label: "Dundas Humidity Sensor 1",
          unit: "%",
            mapPosition: {
                x: 43,
                y: 47
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 63 },
            { timestamp: "2026-04-03T11:17:00", value: 64 },
            { timestamp: "2026-04-03T11:18:00", value: 64 },
            { timestamp: "2026-04-03T11:19:00", value: 65 },
            { timestamp: "2026-04-03T11:20:00", value: 65 }
          ]
        },
        {
          id: "du-noise-001",
          sensorType: "noiseLevel",
          label: "Dundas Noise Sensor 1",
          unit: "dB",
            mapPosition: {
                x: 48,
                y: 43
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 54 },
            { timestamp: "2026-04-03T11:17:00", value: 55 },
            { timestamp: "2026-04-03T11:18:00", value: 56 },
            { timestamp: "2026-04-03T11:19:00", value: 56 },
            { timestamp: "2026-04-03T11:20:00", value: 57 }
          ]
        },
      ]
    },
    {
      id: "stoney-creek",
      zoneName: "Stoney Creek",
      sensors: [
        {
          id: "sc-air-001",
          sensorType: "airQuality",
          label: "Stoney Creek Air Sensor 1",
          unit: "AQI",
            mapPosition: {
                x: 75,
                y: 55
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 73 },
            { timestamp: "2026-04-03T11:17:00", value: 75 },
            { timestamp: "2026-04-03T11:18:00", value: 77 },
            { timestamp: "2026-04-03T11:19:00", value: 79 },
            { timestamp: "2026-04-03T11:20:00", value: 80 }
          ]
        },
        {
          id: "sc-air-002",
          sensorType: "airQuality",
          label: "Stoney Creek Air Sensor 2",
          unit: "AQI",
            mapPosition: {
                x: 85,
                y: 67
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 70 },
            { timestamp: "2026-04-03T11:17:00", value: 71 },
            { timestamp: "2026-04-03T11:18:00", value: 73 },
            { timestamp: "2026-04-03T11:19:00", value: 74 },
            { timestamp: "2026-04-03T11:20:00", value: 76 }
          ]
        },
        {
          id: "sc-temp-001",
          sensorType: "temperature",
          label: "Stoney Creek Temp Sensor 1",
          unit: "°C",
            mapPosition: {
                x: 80,
                y: 52
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 23.6 },
            { timestamp: "2026-04-03T11:17:00", value: 23.8 },
            { timestamp: "2026-04-03T11:18:00", value: 24.0 },
            { timestamp: "2026-04-03T11:19:00", value: 24.1 },
            { timestamp: "2026-04-03T11:20:00", value: 24.2 }
          ]
        },
        {
          id: "sc-temp-002",
          sensorType: "temperature",
          label: "Stoney Creek Temp Sensor 2",
          unit: "°C",
            mapPosition: {
                x: 79,
                y: 68
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 23.3 },
            { timestamp: "2026-04-03T11:17:00", value: 23.5 },
            { timestamp: "2026-04-03T11:18:00", value: 23.7 },
            { timestamp: "2026-04-03T11:19:00", value: 23.8 },
            { timestamp: "2026-04-03T11:20:00", value: 23.9 }
          ]
        },
        {
          id: "sc-hum-001",
          sensorType: "humidity",
          label: "Stoney Creek Humidity Sensor 1",
          unit: "%",
            mapPosition: {
                x: 82,
                y: 54
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 55 },
            { timestamp: "2026-04-03T11:17:00", value: 56 },
            { timestamp: "2026-04-03T11:18:00", value: 56 },
            { timestamp: "2026-04-03T11:19:00", value: 57 },
            { timestamp: "2026-04-03T11:20:00", value: 58 }
          ]
        },
        {
          id: "sc-hum-002",
          sensorType: "humidity",
          label: "Stoney Creek Humidity Sensor 2",
          unit: "%",
            mapPosition: {
                x: 75,
                y: 66
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 54 },
            { timestamp: "2026-04-03T11:17:00", value: 55 },
            { timestamp: "2026-04-03T11:18:00", value: 56 },
            { timestamp: "2026-04-03T11:19:00", value: 56 },
            { timestamp: "2026-04-03T11:20:00", value: 57 }
          ]
        },
        {
          id: "sc-noise-001",
          sensorType: "noiseLevel",
          label: "Stoney Creek Noise Sensor 1",
          unit: "dB",
            mapPosition: {
                x: 89,
                y: 54
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 194 },
            { timestamp: "2026-04-03T11:17:00", value: 196 },
            { timestamp: "2026-04-03T11:18:00", value: 198 },
            { timestamp: "2026-04-03T11:19:00", value: 199 },
            { timestamp: "2026-04-03T11:20:00", value: 201 }
          ]
        },
        {
          id: "sc-noise-002",
          sensorType: "noiseLevel",
          label: "Stoney Creek Noise Sensor 2",
          unit: "dB",
            mapPosition: {
                x: 65,
                y: 62
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 90 },
            { timestamp: "2026-04-03T11:17:00", value: 91 },
            { timestamp: "2026-04-03T11:18:00", value: 93 },
            { timestamp: "2026-04-03T11:19:00", value: 94 },
            { timestamp: "2026-04-03T11:20:00", value: 96 }
          ]
        },
        {
          id: "sc-noise-003",
          sensorType: "noiseLevel",
          label: "Stoney Creek Noise Sensor 3",
          unit: "dB",
            mapPosition: {
                x: 77,
                y: 57
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 150 },
            { timestamp: "2026-04-03T11:17:00", value: 160 },
            { timestamp: "2026-04-03T11:18:00", value: 164 },
            { timestamp: "2026-04-03T11:19:00", value: 160 },
            { timestamp: "2026-04-03T11:20:00", value: 140 }
          ]
        }
      ]
    },
    {
      id: "ancaster",
      zoneName: "Ancaster",
      sensors: [
        {
          id: "an-air-001",
          sensorType: "airQuality",
          label: "Ancaster Air Sensor 1",
          unit: "AQI",
            mapPosition: {
                x: 45,
                y: 65
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 39 },
            { timestamp: "2026-04-03T11:17:00", value: 41 },
            { timestamp: "2026-04-03T11:18:00", value: 42 },
            { timestamp: "2026-04-03T11:19:00", value: 43 },
            { timestamp: "2026-04-03T11:20:00", value: 44 }
          ]
        },
        {
          id: "an-air-002",
          sensorType: "airQuality",
          label: "Ancaster Air Sensor 2",
          unit: "AQI",
            mapPosition: {
                x: 20,
                y: 55
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 37 },
            { timestamp: "2026-04-03T11:17:00", value: 38 },
            { timestamp: "2026-04-03T11:18:00", value: 39 },
            { timestamp: "2026-04-03T11:19:00", value: 40 },
            { timestamp: "2026-04-03T11:20:00", value: 41 }
          ]
        },
        {
          id: "an-temp-001",
          sensorType: "temperature",
          label: "Ancaster Temp Sensor 1",
          unit: "°C",
            mapPosition: {
                x: 40,
                y: 65
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 20.8 },
            { timestamp: "2026-04-03T11:17:00", value: 21.0 },
            { timestamp: "2026-04-03T11:18:00", value: 21.1 },
            { timestamp: "2026-04-03T11:19:00", value: 21.2 },
            { timestamp: "2026-04-03T11:20:00", value: 21.4 }
          ]
        },
        {
          id: "an-temp-002",
          sensorType: "temperature",
          label: "Ancaster Temp Sensor 2",
          unit: "°C",
            mapPosition: {
                x: 17,
                y: 59
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 20.5 },
            { timestamp: "2026-04-03T11:17:00", value: 20.7 },
            { timestamp: "2026-04-03T11:18:00", value: 20.8 },
            { timestamp: "2026-04-03T11:19:00", value: 20.9 },
            { timestamp: "2026-04-03T11:20:00", value: 21.1 }
          ]
        },
        {
          id: "an-hum-001",
          sensorType: "humidity",
          label: "Ancaster Humidity Sensor 1",
          unit: "%",
            mapPosition: {
                x: 40,
                y: 53
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 60 },
            { timestamp: "2026-04-03T11:17:00", value: 60 },
            { timestamp: "2026-04-03T11:18:00", value: 61 },
            { timestamp: "2026-04-03T11:19:00", value: 61 },
            { timestamp: "2026-04-03T11:20:00", value: 62 }
          ]
        },
        {
          id: "an-hum-002",
          sensorType: "humidity",
          label: "Ancaster Humidity Sensor 2",
          unit: "%",
            mapPosition: {
                x: 43,
                y: 73
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 58 },
            { timestamp: "2026-04-03T11:17:00", value: 59 },
            { timestamp: "2026-04-03T11:18:00", value: 59 },
            { timestamp: "2026-04-03T11:19:00", value: 60 },
            { timestamp: "2026-04-03T11:20:00", value: 60 }
          ]
        },
        {
          id: "an-noise-001",
          sensorType: "noiseLevel",
          label: "Ancaster Noise Sensor 1",
          unit: "dB",
            mapPosition: {
                x: 35,
                y: 70
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 48 },
            { timestamp: "2026-04-03T11:17:00", value: 49 },
            { timestamp: "2026-04-03T11:18:00", value: 50 },
            { timestamp: "2026-04-03T11:19:00", value: 50 },
            { timestamp: "2026-04-03T11:20:00", value: 51 }
          ]
        },
        {
          id: "an-noise-002",
          sensorType: "noiseLevel",
          label: "Ancaster Noise Sensor 2",
          unit: "dB",
            mapPosition: {
                x: 27,
                y: 55
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 46 },
            { timestamp: "2026-04-03T11:17:00", value: 47 },
            { timestamp: "2026-04-03T11:18:00", value: 48 },
            { timestamp: "2026-04-03T11:19:00", value: 49 },
            { timestamp: "2026-04-03T11:20:00", value: 49 }
          ]
        }
      ]
    },
    {
      id: "glanbrook",
      zoneName: "Glanbrook",
      sensors: [
        {
          id: "gl-air-001",
          sensorType: "airQuality",
          label: "Glanbrook Air Sensor 1",
          unit: "AQI",
            mapPosition: {
                x: 55,
                y: 80
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 52 },
            { timestamp: "2026-04-03T11:17:00", value: 53 },
            { timestamp: "2026-04-03T11:18:00", value: 54 },
            { timestamp: "2026-04-03T11:19:00", value: 55 },
            { timestamp: "2026-04-03T11:20:00", value: 56 }
          ]
        },
        {
          id: "gl-air-002",
          sensorType: "airQuality",
          label: "Glanbrook Air Sensor 2",
          unit: "AQI",
            mapPosition: {
                x: 70,
                y: 88
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 50 },
            { timestamp: "2026-04-03T11:17:00", value: 51 },
            { timestamp: "2026-04-03T11:18:00", value: 52 },
            { timestamp: "2026-04-03T11:19:00", value: 53 },
            { timestamp: "2026-04-03T11:20:00", value: 54 }
          ]
        },
        {
          id: "gl-temp-001",
          sensorType: "temperature",
          label: "Glanbrook Temp Sensor 1",
          unit: "°C",
            mapPosition: {
                x: 70,
                y: 70
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 22.3 },
            { timestamp: "2026-04-03T11:17:00", value: 22.4 },
            { timestamp: "2026-04-03T11:18:00", value: 22.6 },
            { timestamp: "2026-04-03T11:19:00", value: 22.7 },
            { timestamp: "2026-04-03T11:20:00", value: 22.8 }
          ]
        },
        {
          id: "gl-temp-002",
          sensorType: "temperature",
          label: "Glanbrook Temp Sensor 2",
          unit: "°C",
            mapPosition: {
                x: 55,
                y: 70
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 22.1 },
            { timestamp: "2026-04-03T11:17:00", value: 22.2 },
            { timestamp: "2026-04-03T11:18:00", value: 22.4 },
            { timestamp: "2026-04-03T11:19:00", value: 22.5 },
            { timestamp: "2026-04-03T11:20:00", value: 22.6 }
          ]
        },
        {
          id: "gl-hum-001",
          sensorType: "humidity",
          label: "Glanbrook Humidity Sensor 1",
          unit: "%",
            mapPosition: {
                x: 50,
                y: 65
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 58 },
            { timestamp: "2026-04-03T11:17:00", value: 58 },
            { timestamp: "2026-04-03T11:18:00", value: 59 },
            { timestamp: "2026-04-03T11:19:00", value: 59 },
            { timestamp: "2026-04-03T11:20:00", value: 60 }
          ]
        },
        {
          id: "gl-hum-002",
          sensorType: "humidity",
          label: "Glanbrook Humidity Sensor 2",
          unit: "%",
            mapPosition: {
                x: 72,
                y: 79
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 57 },
            { timestamp: "2026-04-03T11:17:00", value: 57 },
            { timestamp: "2026-04-03T11:18:00", value: 58 },
            { timestamp: "2026-04-03T11:19:00", value: 58 },
            { timestamp: "2026-04-03T11:20:00", value: 59 }
          ]
        },
        {
          id: "gl-noise-001",
          sensorType: "noiseLevel",
          label: "Glanbrook Noise Sensor 1",
            mapPosition: {
                x: 67,
                y: 69,
            },
          unit: "dB",
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 58 },
            { timestamp: "2026-04-03T11:17:00", value: 59 },
            { timestamp: "2026-04-03T11:18:00", value: 60 },
            { timestamp: "2026-04-03T11:19:00", value: 60 },
            { timestamp: "2026-04-03T11:20:00", value: 61 }
          ]
        },
        {
          id: "gl-noise-002",
          sensorType: "noiseLevel",
          label: "Glanbrook Noise Sensor 2",
          unit: "dB",
            mapPosition: {
                x: 63,
                y: 80
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 56 },
            { timestamp: "2026-04-03T11:17:00", value: 57 },
            { timestamp: "2026-04-03T11:18:00", value: 58 },
            { timestamp: "2026-04-03T11:19:00", value: 59 },
            { timestamp: "2026-04-03T11:20:00", value: 60 }
          ]
        }
      ]
    },
    {
      id: "flamborough",
      zoneName: "Flamborough",
      sensors: [
        {
          id: "fl-air-001",
          sensorType: "airQuality",
          label: "Flamborough Air Sensor 1",
          unit: "AQI",
            mapPosition: {
                x: 20,
                y: 20
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 35 },
            { timestamp: "2026-04-03T11:17:00", value: 36 },
            { timestamp: "2026-04-03T11:18:00", value: 37 },
            { timestamp: "2026-04-03T11:19:00", value: 38 },
            { timestamp: "2026-04-03T11:20:00", value: 39 }
          ]
        },
        {
          id: "fl-air-002",
          sensorType: "airQuality",
          label: "Flamborough Air Sensor 2",
          unit: "AQI",
            mapPosition: {
                x: 40,
                y: 25
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 33 },
            { timestamp: "2026-04-03T11:17:00", value: 34 },
            { timestamp: "2026-04-03T11:18:00", value: 35 },
            { timestamp: "2026-04-03T11:19:00", value: 36 },
            { timestamp: "2026-04-03T11:20:00", value: 37 }
          ]
        },
        {
          id: "fl-temp-001",
          sensorType: "temperature",
          label: "Flamborough Temp Sensor 1",
          unit: "°C",
            mapPosition: {
                x: 37,
                y: 12
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 19.9 },
            { timestamp: "2026-04-03T11:17:00", value: 20.0 },
            { timestamp: "2026-04-03T11:18:00", value: 20.2 },
            { timestamp: "2026-04-03T11:19:00", value: 20.3 },
            { timestamp: "2026-04-03T11:20:00", value: 20.4 }
          ]
        },
        {
          id: "fl-temp-002",
          sensorType: "temperature",
          label: "Flamborough Temp Sensor 2",
          unit: "°C",
            mapPosition: {
                x: 27,
                y: 45
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 19.7 },
            { timestamp: "2026-04-03T11:17:00", value: 19.8 },
            { timestamp: "2026-04-03T11:18:00", value: 19.9 },
            { timestamp: "2026-04-03T11:19:00", value: 20.1 },
            { timestamp: "2026-04-03T11:20:00", value: 20.2 }
          ]
        },
        {
          id: "fl-hum-001",
          sensorType: "humidity",
          label: "Flamborough Humidity Sensor 1",
          unit: "%",
            mapPosition: {
                x: 17,
                y: 41
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 66 },
            { timestamp: "2026-04-03T11:17:00", value: 66 },
            { timestamp: "2026-04-03T11:18:00", value: 67 },
            { timestamp: "2026-04-03T11:19:00", value: 67 },
            { timestamp: "2026-04-03T11:20:00", value: 68 }
          ]
        },
        {
          id: "fl-hum-002",
          sensorType: "humidity",
          label: "Flamborough Humidity Sensor 2",
          unit: "%",
            mapPosition: {
                x: 40,
                y: 15
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 64 },
            { timestamp: "2026-04-03T11:17:00", value: 65 },
            { timestamp: "2026-04-03T11:18:00", value: 65 },
            { timestamp: "2026-04-03T11:19:00", value: 66 },
            { timestamp: "2026-04-03T11:20:00", value: 66 }
          ]
        },
        {
          id: "fl-hum-003",
          sensorType: "humidity",
          label: "Flamborough Humidity Sensor 3",
          unit: "%",
            mapPosition: {
                x: 25,
                y: 20
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 72 },
            { timestamp: "2026-04-03T11:17:00", value: 73 },
            { timestamp: "2026-04-03T11:18:00", value: 74 },
            { timestamp: "2026-04-03T11:19:00", value: 74 },
            { timestamp: "2026-04-03T11:20:00", value: 73 }
          ]
        },
        {
          id: "fl-noise-001",
          sensorType: "noiseLevel",
          label: "Flamborough Noise Sensor 1",
          unit: "dB",
            mapPosition: {
                x: 30,
                y: 25
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 45 },
            { timestamp: "2026-04-03T11:17:00", value: 46 },
            { timestamp: "2026-04-03T11:18:00", value: 47 },
            { timestamp: "2026-04-03T11:19:00", value: 47 },
            { timestamp: "2026-04-03T11:20:00", value: 48 }
          ]
        },
        {
          id: "fl-noise-002",
          sensorType: "noiseLevel",
          label: "Flamborough Noise Sensor 2",
          unit: "dB",
            mapPosition: {
                x: 50,
                y: 25
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 43 },
            { timestamp: "2026-04-03T11:17:00", value: 44 },
            { timestamp: "2026-04-03T11:18:00", value: 45 },
            { timestamp: "2026-04-03T11:19:00", value: 46 },
            { timestamp: "2026-04-03T11:20:00", value: 46 }
          ]
        },
                {
          id: "fl-noise-003",
          sensorType: "noiseLevel",
          label: "Flamborough Noise Sensor 3",
          unit: "dB",
            mapPosition: {
                x: 12,
                y: 37
            },
          readings: [
            { timestamp: "2026-04-03T11:16:00", value: 43 },
            { timestamp: "2026-04-03T11:17:00", value: 44 },
            { timestamp: "2026-04-03T11:18:00", value: 45 },
            { timestamp: "2026-04-03T11:19:00", value: 46 },
            { timestamp: "2026-04-03T11:20:00", value: 46 }
          ]
        }
      ]
    }
  ]
};

export const burlingtonOperatorData = {
  cityId: "burlington",
  cityName: "Burlington",
  updatedAt: "2026-04-03T11:20:00",
  alerts: [],
  zones: [
    {
      id: "burlington-zone-1",
      zoneName: "Zone 1",
      sensors: []
    },
    {
      id: "burlington-zone-2",
      zoneName: "Zone 2",
      sensors: []
    },
    {
      id: "burlington-zone-3",
      zoneName: "Zone 3",
      sensors: []
    },
    {
      id: "burlington-zone-4",
      zoneName: "Zone 4",
      sensors: []
    },
    {
      id: "burlington-zone-5",
      zoneName: "Zone 5",
      sensors: []
    }
  ]
};

export const scarboroughOperatorData = {
  cityId: "scarborough",
  cityName: "Scarborough",
  updatedAt: "2026-04-03T11:20:00",
  alerts: [],
  zones: [
    {
      id: "scarborough-zone-1",
      zoneName: "Zone 1",
      sensors: []
    },
    {
      id: "scarborough-zone-2",
      zoneName: "Zone 2",
      sensors: []
    },
    {
      id: "scarborough-zone-3",
      zoneName: "Zone 3",
      sensors: []
    },
    {
      id: "scarborough-zone-4",
      zoneName: "Zone 4",
      sensors: []
    },
    {
      id: "scarborough-zone-5",
      zoneName: "Zone 5",
      sensors: []
    }
  ]
};

export const adminCityData = [
  hamiltonOperatorData,
  burlingtonOperatorData,
  scarboroughOperatorData
];