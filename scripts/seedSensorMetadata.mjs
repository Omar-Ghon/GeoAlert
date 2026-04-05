import { DynamoDBClient, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { adminCityData } from "../frontend/js/operatorSensorData.js";

const client = new DynamoDBClient({ region: "us-east-1" });
const TABLE_NAME = "geoalert_sensor_metadata";

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function buildMetadataItems() {
  const items = [];

  for (const city of adminCityData) {
    for (const zone of city.zones) {
      for (const sensor of zone.sensors) {
        items.push({
          PutRequest: {
            Item: {
              sensorId: { S: sensor.id },
              cityId: { S: city.cityId },
              cityName: { S: city.cityName },
              zoneId: { S: zone.id },
              zoneName: { S: zone.zoneName },
              sensorType: { S: sensor.sensorType },
              label: { S: sensor.label },
              unit: { S: sensor.unit },
              mapX: { N: String(sensor.mapPosition?.x ?? 0) },
              mapY: { N: String(sensor.mapPosition?.y ?? 0) },
              isActive: { BOOL: true }
            }
          }
        });
      }
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
    console.log("Retrying unprocessed items:", response.UnprocessedItems[TABLE_NAME].length);

    const retryCommand = new BatchWriteItemCommand({
      RequestItems: {
        [TABLE_NAME]: response.UnprocessedItems[TABLE_NAME]
      }
    });

    await client.send(retryCommand);
  }
}

async function seedMetadata() {
  const items = buildMetadataItems();
  const batches = chunkArray(items, 25);

  console.log(`Found ${items.length} sensor metadata items.`);
  console.log(`Writing in ${batches.length} batch(es)...`);

  for (let i = 0; i < batches.length; i++) {
    console.log(`Writing batch ${i + 1} of ${batches.length}`);
    await writeBatch(batches[i]);
  }

  console.log("Metadata seeding complete.");
}

seedMetadata().catch((error) => {
  console.error("Failed to seed metadata:", error);
});