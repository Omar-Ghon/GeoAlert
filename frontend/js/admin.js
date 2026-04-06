import {
  formatLevelsSummary,
  formatRuleEvaluation,
  getAdminCities,
  getCityData,
  getMetrics,
  getZones,
  metricConfig
} from "./adminAlerts.js";

import {
  getRulesApi,
  createRuleApi,
  updateRuleApi,
  deleteRuleApi,
  getAlertsApi
} from "./adminApi.js";

let currentRules = [];
let currentTriggeredAlerts = [];
let currentAuditEntries = [];

const accountMenuButton = document.getElementById("accountMenuButton");
const accountDropdown = document.getElementById("accountDropdown");

const ruleForm = document.getElementById("ruleForm");
const clearFormButton = document.getElementById("clearFormButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const resetRulesButton = document.getElementById("resetRulesButton");
const runEvaluationButton = document.getElementById("runEvaluationButton");

const editingRuleIdInput = document.getElementById("editingRuleId");
const submitRuleButton = document.getElementById("submitRuleButton");

const cityIdSelect = document.getElementById("cityId");

const zoneIdSelect = document.getElementById("zoneId");
const metricSelect = document.getElementById("metric");
const formFeedback = document.getElementById("formFeedback");

const rulesTableBody = document.getElementById("rulesTableBody");
const triggeredAlertsBody = document.getElementById("triggeredAlertsBody");
const auditLog = document.getElementById("auditLog");

const summaryCity = document.getElementById("summaryCity");
const summaryZones = document.getElementById("summaryZones");
const summaryRules = document.getElementById("summaryRules");
const summaryTriggered = document.getElementById("summaryTriggered");
const accountMenuUsername = document.getElementById("accountMenuUsername");

function getSelectedCityId() {
  return cityIdSelect?.value || "hamilton";
}

function updateCityUi(selectedCityId = getSelectedCityId()) {
  const cityData = getCityData(selectedCityId);

  if (summaryCity) {
    summaryCity.textContent = cityData.cityName;
  }

  if (accountMenuUsername) {
    accountMenuUsername.textContent = `${cityData.cityName} Admin`;
  }
}

initializeAdminPage();

async function initializeAdminPage() {
  populateCityOptions();
  populateZoneOptions(getSelectedCityId());
  populateMetricOptions();
  updateCityUi(getSelectedCityId());
  setupAccountMenu();
  setupEventListeners();
  resetFormState();
  await renderAllFromApi();
}

function setupAccountMenu() {
  if (!accountMenuButton || !accountDropdown) return;

  accountMenuButton.addEventListener("click", () => {
    const isOpen = accountDropdown.classList.toggle("isOpen");
    accountMenuButton.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    const clickedInsideMenu = event.target.closest("#accountMenu");
    if (!clickedInsideMenu) {
      accountDropdown.classList.remove("isOpen");
      accountMenuButton.setAttribute("aria-expanded", "false");
    }
  });
}

function setupEventListeners() {
  if (ruleForm) {
    ruleForm.addEventListener("submit", handleRuleSubmit);
  }

  if (clearFormButton) {
    clearFormButton.addEventListener("click", () => {
      resetFormState();
      clearFeedback();
    });
  }

  if (cancelEditButton) {
    cancelEditButton.addEventListener("click", () => {
      resetFormState();
      showFeedback("Edit cancelled.", "success");
    });
  }

if (resetRulesButton) {
  resetRulesButton.addEventListener("click", () => {
    resetFormState();
    clearFeedback();
    showFeedback("Demo reset is disabled in AWS mode.", "success");
  });
}

if (runEvaluationButton) {
  runEvaluationButton.addEventListener("click", async () => {
    try {
      await renderAllFromApi();
      showFeedback("Rules refreshed from AWS successfully.", "success");
    } catch (error) {
      console.error("refresh error:", error);
      showFeedback(error.message || "Failed to refresh rules.", "error");
    }
  });
}

if (cityIdSelect) {
  cityIdSelect.addEventListener("change", async () => {
    const selectedCityId = cityIdSelect.value;
    populateZoneOptions(selectedCityId);
    updateCityUi(selectedCityId);
    await renderAllFromApi();
  });
}

  if (rulesTableBody) {
    rulesTableBody.addEventListener("click", handleRulesTableActions);
  }
}

function populateCityOptions() {
  const cities = getAdminCities();

  cityIdSelect.innerHTML = cities
    .map((city) => `<option value="${city.cityId}">${city.cityName}</option>`)
    .join("");
}

function populateZoneOptions(selectedCityId = cityIdSelect?.value || "hamilton") {
  const cityData = getCityData(selectedCityId);
  const zones = getZones(selectedCityId);

  zoneIdSelect.innerHTML = `
    <option value="all-zones">All ${cityData.cityName} Zones</option>
    ${zones.map((zone) => `<option value="${zone.id}">${zone.zoneName}</option>`).join("")}
  `;
}

function populateMetricOptions() {
  const metrics = getMetrics();
  metricSelect.innerHTML = metrics
    .map((metric) => `<option value="${metric.value}">${metric.label}</option>`)
    .join("");
}

async function handleRuleSubmit(event) {
  event.preventDefault();
  clearFeedback();

  const payload = buildRulePayloadFromForm();
  const validationError = validateRulePayload(payload);

  if (validationError) {
    showFeedback(validationError, "error");
    return;
  }

  const editingRuleId = editingRuleIdInput.value.trim();

  try {
    if (editingRuleId) {
      await updateRuleApi(editingRuleId, payload);
      showFeedback("Rule updated successfully.", "success");
    } else {
      await createRuleApi(payload);
      showFeedback("Alert rule created successfully.", "success");
    }

    await renderAllFromApi();
    resetFormState();
  } catch (error) {
    console.error("handleRuleSubmit error:", error);
    showFeedback(error.message || "Failed to save rule.", "error");
  }
}

function buildRulePayloadFromForm() {
  return {
    ruleName: document.getElementById("ruleName").value.trim(),
    cityId: cityIdSelect.value,
    zoneId: zoneIdSelect.value,
    metric: metricSelect.value,
    evaluationType: document.getElementById("evaluationType").value,
    comparison: document.getElementById("comparison").value,
    window: document.getElementById("window").value,
    levels: [
      {
        id: "mild",
        enabled: document.getElementById("levelEnabledMild").checked,
        label: document.getElementById("levelLabelMild").value.trim(),
        threshold: document.getElementById("levelThresholdMild").value,
        message: document.getElementById("levelMessageMild").value.trim()
      },
      {
        id: "moderate",
        enabled: document.getElementById("levelEnabledModerate").checked,
        label: document.getElementById("levelLabelModerate").value.trim(),
        threshold: document.getElementById("levelThresholdModerate").value,
        message: document.getElementById("levelMessageModerate").value.trim()
      },
      {
        id: "severe",
        enabled: document.getElementById("levelEnabledSevere").checked,
        label: document.getElementById("levelLabelSevere").value.trim(),
        threshold: document.getElementById("levelThresholdSevere").value,
        message: document.getElementById("levelMessageSevere").value.trim()
      }
    ]
  };
}

function validateRulePayload(payload) {
  if (!payload.ruleName) {
    return "Please enter a rule name.";
  }

  const enabledLevels = payload.levels.filter((level) => level.enabled);

  if (!enabledLevels.length) {
    return "Please enable at least one alert level.";
  }

  for (const level of enabledLevels) {
    if (level.threshold === "" || Number.isNaN(Number(level.threshold))) {
      return `Please enter a valid threshold for ${capitalize(level.id)}.`;
    }

    if (!level.message) {
      return `Please enter a message for ${capitalize(level.id)}.`;
    }
  }

  return null;
}

async function handleRulesTableActions(event) {
  const editButton = event.target.closest("[data-action='edit']");
  const deleteButton = event.target.closest("[data-action='delete']");

  if (editButton) {
    const ruleId = editButton.dataset.ruleId;
    startEditingRule(ruleId);
    return;
  }

  if (deleteButton) {
    const ruleId = deleteButton.dataset.ruleId;

    try {
      await deleteRuleApi(ruleId);
      await renderAllFromApi();
      resetFormState();
      showFeedback("Rule deleted.", "success");
    } catch (error) {
      console.error("delete rule error:", error);
      showFeedback(error.message || "Failed to delete rule.", "error");
    }
  }
}


function startEditingRule(ruleId) {
  const rule = currentRules.find((item) => item.ruleId === ruleId);
  if (!rule) return;

  editingRuleIdInput.value = rule.ruleId;
  document.getElementById("ruleName").value = rule.ruleName;
  cityIdSelect.value = rule.cityId || "hamilton";
  populateZoneOptions(cityIdSelect.value);
  zoneIdSelect.value = rule.zoneId;
  metricSelect.value = rule.metric;
  document.getElementById("evaluationType").value = rule.evaluationType;
  document.getElementById("comparison").value = rule.comparison;
  document.getElementById("window").value = rule.window;

  setLevelFields("mild", rule.levels.find((level) => level.id === "mild"));
  setLevelFields("moderate", rule.levels.find((level) => level.id === "moderate"));
  setLevelFields("severe", rule.levels.find((level) => level.id === "severe"));

  submitRuleButton.textContent = "Save Changes";
  cancelEditButton.hidden = false;
  showFeedback(`Editing "${rule.ruleName}".`, "success");

  if (ruleForm) {
    ruleForm.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  document.getElementById("ruleName").focus();
}

function setLevelFields(levelId, levelData) {
  const checkbox = document.getElementById(`levelEnabled${capitalize(levelId)}`);
  const labelInput = document.getElementById(`levelLabel${capitalize(levelId)}`);
  const thresholdInput = document.getElementById(`levelThreshold${capitalize(levelId)}`);
  const messageInput = document.getElementById(`levelMessage${capitalize(levelId)}`);

  if (levelData) {
    checkbox.checked = true;
    labelInput.value = levelData.label;
    thresholdInput.value = levelData.threshold;
    messageInput.value = levelData.message;
  } else {
    checkbox.checked = false;
    labelInput.value = capitalize(levelId);
    thresholdInput.value = "";
    messageInput.value = "";
  }
}

function resetFormState() {
  if (ruleForm) {
    ruleForm.reset();
  }

  editingRuleIdInput.value = "";
  submitRuleButton.textContent = "Create Rule";
  cancelEditButton.hidden = true;

  document.getElementById("levelLabelMild").value = "Mild";
  document.getElementById("levelLabelModerate").value = "Moderate";
  document.getElementById("levelLabelSevere").value = "Severe";

  populateZoneOptions(getSelectedCityId());
  updateCityUi(getSelectedCityId());

  clearFeedback();
}

function renderSummary() {
  const selectedCityId = getSelectedCityId();
  const cityData = getCityData(selectedCityId);
  const zones = getZones(selectedCityId);

  summaryCity.textContent = cityData.cityName;
  summaryZones.textContent = String(zones.length);
  summaryRules.textContent = String(currentRules.length);
  summaryTriggered.textContent = String(currentTriggeredAlerts.length);

  updateCityUi(selectedCityId);
}

function renderRulesTable() {
  const rules = currentRules;

  if (!rules.length) {
    rulesTableBody.innerHTML = `
      <tr>
        <td colspan="7">
          <p class="emptyState">No rules created yet.</p>
        </td>
      </tr>
    `;
    return;
  }

  rulesTableBody.innerHTML = rules
    .map((rule) => `
      <tr>
        <td>
          <div class="ruleNameCell">
            <strong>${escapeHtml(rule.ruleName)}</strong>
          </div>
        </td>
        <td>${escapeHtml(getCityData(rule.cityId || "hamilton").cityName)}</td>
        <td>${escapeHtml(getZoneLabel(rule.zoneId, rule.cityId || "hamilton"))}</td>
        <td>${escapeHtml(metricConfig[rule.metric]?.label ?? rule.metric)}</td>
        <td>${formatRuleEvaluation(rule)}</td>
        <td>${formatLevelsSummary(rule)}</td>
        <td>
          <div class="ruleActionGroup">
            <button
              type="button"
              class="smallButton"
              data-action="edit"
              data-rule-id="${rule.ruleId}"
            >
              Edit
            </button>
            <button
              type="button"
              class="smallButton danger"
              data-action="delete"
              data-rule-id="${rule.ruleId}"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    `)
    .join("");
}

function renderTriggeredAlerts() {
  const alerts = currentTriggeredAlerts;

  if (!alerts.length) {
    triggeredAlertsBody.innerHTML = `
      <tr>
        <td colspan="6">
          <p class="emptyState">No alerts are currently active.</p>
        </td>
      </tr>
    `;
    return;
  }

  triggeredAlertsBody.innerHTML = alerts
    .map((alert) => `
      <tr>
        <td>
          <div class="ruleNameCell">
            <strong>${escapeHtml(alert.ruleName)}</strong>
            <span class="ruleSubtext">${escapeHtml(alert.message)}</span>
          </div>
        </td>
        <td>${escapeHtml(getZoneLabel(alert.zoneId, alert.cityId || "hamilton"))}</td>
        <td>${escapeHtml(metricConfig[alert.metric]?.label ?? alert.metric)}</td>
        <td><span class="badge ${alert.severity}">${escapeHtml(alert.severityLabel)}</span></td>
        <td>${alert.reading} ${escapeHtml(alert.unit)}</td>
        <td><span class="badge active">${capitalize(alert.status)}</span></td>
      </tr>
    `)
    .join("");
}

function renderAuditLog() {
  currentAuditEntries = [];

  if (!auditLog) return;

  auditLog.innerHTML = `<p class="emptyState">No AWS-backed audit entries yet.</p>`;
}


function getZoneLabel(zoneId, cityId = "hamilton") {
  if (zoneId === "all-zones") return "All Zones";
  const zone = getZones(cityId).find((item) => item.id === zoneId);
  return zone ? zone.zoneName : zoneId;
}

function showFeedback(message, type) {
  formFeedback.textContent = message;
  formFeedback.classList.remove("isSuccess", "isError");

  if (type === "success") formFeedback.classList.add("isSuccess");
  if (type === "error") formFeedback.classList.add("isError");
}

function clearFeedback() {
  formFeedback.textContent = "";
  formFeedback.classList.remove("isSuccess", "isError");
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function renderAllFromApi() {
  await loadRulesFromApi();
  await loadAlertsFromApi();
  renderRulesTable();
  renderTriggeredAlerts();
  renderAuditLog();
  renderSummary();
}
async function loadRulesFromApi() {
  const selectedCityId = getSelectedCityId();
  currentRules = await getRulesApi(selectedCityId);
}

async function loadAlertsFromApi() {
  const selectedCityId = getSelectedCityId();
  currentTriggeredAlerts = await getAlertsApi(selectedCityId);
}