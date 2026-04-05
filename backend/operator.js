export async function fetchOperatorCityData(cityId = "hamilton", minutes = 60) {
  const baseUrl = "https://z0kfbot2qb.execute-api.us-east-1.amazonaws.com";

  const response = await fetch(
    `${baseUrl}/api/operator?cityId=${encodeURIComponent(cityId)}&minutes=${encodeURIComponent(minutes)}`
  );

  if (!response.ok) {
    throw new Error("Failed to load operator data");
  }

  return response.json();
}