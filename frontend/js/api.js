const OPERATOR_BASE_URL =
  "https://z0kfbot2qb.execute-api.us-east-1.amazonaws.com";

const PUBLIC_ALERTS_URL =
  "https://i0nzik6j8a.execute-api.us-east-1.amazonaws.com/api/alertsystem/public-alerts";


const CREATE_SUBSCRIPTION_URL =
  "https://jacf3pl8i5.execute-api.us-east-1.amazonaws.com/api/subscriptions";

const DELETE_SUBSCRIPTION_URL =
  "https://60sml2ffk1.execute-api.us-east-1.amazonaws.com/api/subscriptions";

const outputEl = document.getElementById("apiOutput");

const operatorCityEl = document.getElementById("operatorCity");
const operatorMinutesEl = document.getElementById("operatorMinutes");
const publicAlertsCityEl = document.getElementById("publicAlertsCity");

const subscribeCityEl = document.getElementById("subscribeCity");
const subscribeChannelEl = document.getElementById("subscribeChannel");
const subscribeTargetEl = document.getElementById("subscribeTarget");

const testOperatorBtn = document.getElementById("testOperatorBtn");
const testPublicAlertsBtn = document.getElementById("testPublicAlertsBtn");
const subscribeBtn = document.getElementById("subscribeBtn");
const clearOutputBtn = document.getElementById("clearOutputBtn");

function setOutput(value) {
  if (typeof value === "string") {
    outputEl.textContent = value;
    return;
  }

  outputEl.textContent = JSON.stringify(value, null, 2);
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || "Request failed.");
  }

  return data;
}

async function fetchOperatorData(cityId, minutes) {
  const response = await fetch(
    `${OPERATOR_BASE_URL}/api/operator?cityId=${encodeURIComponent(cityId)}&minutes=${encodeURIComponent(minutes)}`
  );

  return parseResponse(response);
}

async function fetchPublicAlerts(cityId) {
  const query = cityId ? `?cityId=${encodeURIComponent(cityId)}` : "";
  const response = await fetch(`${PUBLIC_ALERTS_URL}${query}`);
  return parseResponse(response);
}

async function createSubscription(payload) {
  const response = await fetch(CREATE_SUBSCRIPTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

testOperatorBtn.addEventListener("click", async () => {
  try {
    setOutput("Loading aggregated operator data...");
    const cityId = operatorCityEl.value;
    const minutes = Number(operatorMinutesEl.value || 60);

    const data = await fetchOperatorData(cityId, minutes);

    setOutput({
      endpoint: `/api/operator?cityId=${cityId}&minutes=${minutes}`,
      description: "Aggregated city/operator data",
      response: data
    });
  } catch (error) {
    setOutput({
      error: error.message
    });
  }
});

testPublicAlertsBtn.addEventListener("click", async () => {
  try {
    setOutput("Loading public alerts...");
    const cityId = publicAlertsCityEl.value;

    const data = await fetchPublicAlerts(cityId);

    setOutput({
      endpoint: `/api/alertsystem/public-alerts?cityId=${cityId}`,
      description: "Public-facing active alerts",
      response: data
    });
  } catch (error) {
    setOutput({
      error: error.message
    });
  }
});

subscribeBtn.addEventListener("click", async () => {
  try {
    const cityId = subscribeCityEl.value;
    const channel = subscribeChannelEl.value;
    const target = subscribeTargetEl.value.trim();

    if (!target) {
      throw new Error("Please enter a webhook URL or email.");
    }

    setOutput("Creating subscription...");

    const payload = {
      cityId,
      channel,
      target
    };

    const data = await createSubscription(payload);

    setOutput({
      endpoint: "/api/subscriptions",
      description: "Subscriber registration for public alerts",
      request: payload,
      response: data
    });
  } catch (error) {
    setOutput({
      error: error.message
    });
  }
});

clearOutputBtn.addEventListener("click", () => {
  setOutput("Running endpoint test");
});

// initial message
setOutput(
  "Hello"
);