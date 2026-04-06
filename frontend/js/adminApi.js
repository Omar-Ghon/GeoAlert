const CREATE_RULE_URL = "https://njb2k4dbhi.execute-api.us-east-1.amazonaws.com/api/admin/rules";
const GET_RULES_URL = "https://9zjzmr38sj.execute-api.us-east-1.amazonaws.com/api/admin/rules";
const UPDATE_RULE_BASE_URL = "https://glk6zf4bp9.execute-api.us-east-1.amazonaws.com/api/admin/rules";
const DELETE_RULE_BASE_URL = "https://ts5ew6co82.execute-api.us-east-1.amazonaws.com/api/admin/rules";

const GET_ALERTS_URL = "https://09xnv5f78a.execute-api.us-east-1.amazonaws.com/api/alerts";

const UPDATE_ALERT_STATUS_URL =
  "https://4o1auu4wl0.execute-api.us-east-1.amazonaws.com/api/alertsystem/status";

const TOGGLE_ALERT_PUBLIC_URL =
  "https://t2dvv67oti.execute-api.us-east-1.amazonaws.com/api/alertsystem/public";

const GET_PUBLIC_ALERTS_URL =
  "https://i0nzik6j8a.execute-api.us-east-1.amazonaws.com/api/alertsystem/public-alerts";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || "API request failed.");
  }

  return data;
}

export async function getAlertsApi(cityId) {
  const response = await fetch(
    `${GET_ALERTS_URL}?cityId=${encodeURIComponent(cityId)}&status=active`
  );

  const data = await handleResponse(response);
  return data.alerts || [];
}

export async function updateAlertStatusApi(alertId, status) {
  const response = await fetch(UPDATE_ALERT_STATUS_URL, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      alertId,
      status
    })
  });

  const data = await handleResponse(response);
  return data.alert || data;
}

export async function toggleAlertPublicApi(alertId, isPublic) {
  const response = await fetch(TOGGLE_ALERT_PUBLIC_URL, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      alertId,
      isPublic
    })
  });

  const data = await handleResponse(response);
  return data.alert || data;
}

export async function getPublicAlertsApi(cityId) {
  const query = cityId
    ? `?cityId=${encodeURIComponent(cityId)}`
    : "";

  const response = await fetch(`${GET_PUBLIC_ALERTS_URL}${query}`);
  const data = await handleResponse(response);
  return data.alerts || [];
}

export async function getRulesApi(cityId) {
  const response = await fetch(
    `${GET_RULES_URL}?cityId=${encodeURIComponent(cityId)}`
  );

  const data = await handleResponse(response);
  return data.rules || [];
}

export async function createRuleApi(payload) {
  const response = await fetch(CREATE_RULE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await handleResponse(response);
  return data.rule;
}

export async function updateRuleApi(ruleId, payload) {
  const response = await fetch(
    `${UPDATE_RULE_BASE_URL}/${encodeURIComponent(ruleId)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  const data = await handleResponse(response);
  return data.rule;
}

export async function deleteRuleApi(ruleId) {
  const response = await fetch(
    `${DELETE_RULE_BASE_URL}/${encodeURIComponent(ruleId)}`,
    {
      method: "DELETE"
    }
  );

  return handleResponse(response);
}