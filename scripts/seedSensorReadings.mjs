import { DynamoDBClient, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { adminCityData } from "../frontend/js/operatorSensorData.js";

const client = new DynamoDBClient({ region: "us-east-1" });
const TABLE_NAME = "geoalert_sensor_readings";
const MINUTES_TO_SEED = 60;

// Pick a few sensors to force into higher ranges for UI testing
const SENSOR_BEHAVIOR_OVERRIDES = {
  "sc-noise-001": "critical",
  "sc-noise-002": "high",
  "ch-air-001": "high",
  "ch-air-002": "elevated",
  "ch-temp-001": "normal",
  "du-hum-001": "normal",
  "fl-hum-003": "elevated"
};

const FORCE_ZONE_METRIC_BEHAVIOR = [
  {
    cityId: "hamilton",
    zoneId: "stoney-creek",
    sensorType: "noiseLevel",
    behavior: "critical"
  }
];

const FORCE_SENSOR_BEHAVIOR = {
  // leave empty if you want
};

function getZoneMetricBehavior(cityId, zoneId, sensorType) {
  const match = FORCE_ZONE_METRIC_BEHAVIOR.find(
    (item) =>
      item.cityId === cityId &&
      item.zoneId === zoneId &&
      item.sensorType === sensorType
  );

  return match ? match.behavior : null;
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function roundValue(value, sensorType) {
  if (sensorType === "temperature") {
    return Number(value.toFixed(1));
  }
  return Math.round(value);
}

function getTargetRange(sensorType, behavior) {
  if (sensorType === "airQuality") {
    if (behavior === "critical") return [100, 112];
    if (behavior === "high") return [90, 99];
    if (behavior === "elevated") return [80, 89];
    return [35, 75];
  }

  if (sensorType === "temperature") {
    if (behavior === "critical") return [32, 36];
    if (behavior === "high") return [29, 31.5];
    if (behavior === "elevated") return [27, 28.8];
    return [18, 25.5];
  }

  if (sensorType === "humidity") {
    if (behavior === "critical") return [85, 92];
    if (behavior === "high") return [78, 84];
    if (behavior === "elevated") return [70, 77];
    return [45, 68];
  }

  if (sensorType === "noiseLevel") {
    if (behavior === "critical") return [95, 115];
    if (behavior === "high") return [88, 94];
    if (behavior === "elevated") return [80, 87];
    return [40, 75];
  }

  return [0, 100];
}

// function pickBehavior(city, zone, sensor, randomCriticalSensorId = null) {
//   if (FORCE_SENSOR_BEHAVIOR[sensor.id]) {
//     return FORCE_SENSOR_BEHAVIOR[sensor.id];
//   }

//   const zoneMetricBehavior = getZoneMetricBehavior(
//     city.cityId,
//     zone.id,
//     sensor.sensorType
//   );

//   if (zoneMetricBehavior) {
//     return zoneMetricBehavior;
//   }

//   if (sensor.id === randomCriticalSensorId) {
//     return "critical";
//   }

//   const roll = Math.random();

//   if (roll < 0.70) return "normal";
//   if (roll < 0.85) return "elevated";
//   if (roll < 0.95) return "high";
//   return "critical";
// }

function pickBehavior(city, zone, sensor, randomCriticalSensorId = null) {
  if (FORCE_SENSOR_BEHAVIOR[sensor.id]) {
    return FORCE_SENSOR_BEHAVIOR[sensor.id];
  }

  const zoneMetricBehavior = getZoneMetricBehavior(
    city.cityId,
    zone.id,
    sensor.sensorType
  );

  if (zoneMetricBehavior) {
    return zoneMetricBehavior;
  }

  if (sensor.id === randomCriticalSensorId) {
    return "critical";
  }

  const roll = Math.random();

  if (roll < 0.70) return "normal";
  if (roll < 0.85) return "elevated";
  if (roll < 0.95) return "high";
  return "critical";
}

function pickRandomNonStoneyCreekNoiseSensor(allSensors) {
  const eligible = allSensors.filter(
    ({ city, zone, sensor }) =>
      !(
        city.cityId === "hamilton" &&
        zone.id === "stoney-creek" &&
        sensor.sensorType === "noiseLevel"
      )
  );

  if (!eligible.length) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * eligible.length);
  return eligible[randomIndex].sensor.id;
}

function buildTrendValues(sensorType, behavior, count) {
  const [min, max] = getTargetRange(sensorType, behavior);
  const values = [];

  let current = randomBetween(min, max);

  for (let i = 0; i < count; i++) {
    // Small drift to make it look natural
    const drift =
      sensorType === "temperature"
        ? randomBetween(-0.25, 0.25)
        : randomBetween(-2, 2);

    current += drift;

    // Keep within target band
    if (current < min) current = min + Math.abs(drift);
    if (current > max) current = max - Math.abs(drift);

    // Add a small late spike for non-normal sensors
    if (i > count - 10 && behavior !== "normal") {
      current += sensorType === "temperature"
        ? randomBetween(0.05, 0.25)
        : randomBetween(0.5, 2);
      if (current > max) current = max;
    }

    values.push(roundValue(current, sensorType));
  }

  return values;
}

function buildReadingItems() {
  const items = [];
  const now = new Date();

  const allSensors = [];

  for (const city of adminCityData) {
    for (const zone of city.zones) {
      for (const sensor of zone.sensors) {
        allSensors.push({ city, zone, sensor });
      }
    }
  }

  const randomCriticalSensorId = pickRandomNonStoneyCreekNoiseSensor(allSensors);
  console.log("Random extra critical sensor:", randomCriticalSensorId);

  for (const { city, zone, sensor } of allSensors) {
    const behavior = pickBehavior(city, zone, sensor, randomCriticalSensorId);
    const values = buildTrendValues(sensor.sensorType, behavior, MINUTES_TO_SEED);

    for (let i = 0; i < MINUTES_TO_SEED; i++) {
      const timestamp = new Date(
        now.getTime() - (MINUTES_TO_SEED - 1 - i) * 60 * 1000
      ).toISOString();

      const value = values[i];

      items.push({
        PutRequest: {
          Item: {
            sensorId: { S: sensor.id },
            timestamp: { S: timestamp },
            cityId: { S: city.cityId },
            zoneId: { S: zone.id },
            sensorType: { S: sensor.sensorType },
            unit: { S: sensor.unit },
            value: { N: String(value) }
          }
        }
      });
    }
  }

  return items;
}

async function writeBatch(batch) {
  const command = new BatchWriteItemCommand({
    RequestItems: {
      [TABLE_NAME]: batch
    }
  });

  const response = await client.send(command);

  if (
    response.UnprocessedItems &&
    response.UnprocessedItems[TABLE_NAME] &&
    response.UnprocessedItems[TABLE_NAME].length > 0
  ) {
    console.log(`Retrying ${response.UnprocessedItems[TABLE_NAME].length} unprocessed items...`);

    await client.send(
      new BatchWriteItemCommand({
        RequestItems: {
          [TABLE_NAME]: response.UnprocessedItems[TABLE_NAME]
        }
      })
    );
  }
}

async function seedReadings() {
  const items = buildReadingItems();
  const batches = chunkArray(items, 25);

  console.log(`Generated ${items.length} readings.`);
  console.log(`Writing ${batches.length} batches...`);

  for (let i = 0; i < batches.length; i++) {
    console.log(`Writing batch ${i + 1} of ${batches.length}`);
    await writeBatch(batches[i]);
  }

  console.log("Sensor readings seeding complete.");
}

seedReadings().catch((error) => {
  console.error("Failed to seed sensor readings:", error);
});