import {
  getRulesApi,
  createRuleApi,
  updateRuleApi,
  deleteRuleApi,
  getAlertsApi,
  fetchOperatorCityData
} from "./adminApi.js";

const CITY_OPTIONS = [
  { cityId: "hamilton", cityName: "Hamilton" },
  { cityId: "halton", cityName: "Halton" }
];

const metricConfig = {
  airQuality: { label: "Air Quality", unit: "AQI" },
  temperature: { label: "Temperature", unit: "°C" },
  humidity: { label: "Humidity", unit: "%" },
  noiseLevel: { label: "Noise Level", unit: "dB" }
};

let currentRules = [];
let currentTriggeredAlerts = [];
let currentAuditEntries = [];
let cityDataCache = {};

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
const adminSubheading = document.getElementById("adminSubheading");

function getCityFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("city") || "hamilton";
}

function setCityInUrl(cityId) {
  const url = new URL(window.location.href);
  url.searchParams.set("city", cityId);
  window.history.replaceState({}, "", url);
}

function getSelectedCityId() {
  return cityIdSelect?.value || getCityFromUrl() || "hamilton";
}

function getAdminCities() {
  return CITY_OPTIONS;
}

function getCityData(cityId) {
  const found = CITY_OPTIONS.find((city) => city.cityId === cityId);
  return found || { cityId, cityName: capitalizeWords(cityId) };
}

function getMetrics() {
  return Object.entries(metricConfig).map(([value, config]) => ({
    value,
    label: config.label
  }));
}

function getZones(cityId) {
  const cityData = cityDataCache[cityId];
  if (!cityData?.zones?.length) {
    return [];
  }

  return cityData.zones.map((zone) => ({
    id: zone.id,
    zoneName: zone.zoneName || capitalizeWords(zone.id)
  }));
}

async function ensureCityData(cityId) {
  if (cityDataCache[cityId]) {
    return cityDataCache[cityId];
  }

  const data = await fetchOperatorCityData(cityId, 60);
  cityDataCache[cityId] = data;
  return data;
}

function updateCityUi(selectedCityId = getSelectedCityId()) {
  const cityData = getCityData(selectedCityId);

  if (summaryCity) {
    summaryCity.textContent = cityData.cityName;
  }

  if (accountMenuUsername) {
    accountMenuUsername.textContent = `${cityData.cityName} Admin`;
  }

  if (adminSubheading) {
    adminSubheading.textContent = `Create and manage ${cityData.cityName} alert rules using zone-based thresholds.`;
  }
}

initializeAdminPage();

async function initializeAdminPage() {
  populateCityOptions();
  cityIdSelect.value = getCityFromUrl();
  populateMetricOptions();
  updateCityUi(getSelectedCityId());
  setupAccountMenu();
  setupEventListeners();
  resetFormState();

  await ensureCityData(getSelectedCityId());
  populateZoneOptions(getSelectedCityId());
  updateCityUi(getSelectedCityId());

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
    clearFormButton.addEventListener("click", async () => {
      resetFormState();
      cityIdSelect.value = getCityFromUrl();
      await ensureCityData(getSelectedCityId());
      populateZoneOptions(getSelectedCityId());
      updateCityUi(getSelectedCityId());
      clearFeedback();
    });
  }

  if (cancelEditButton) {
    cancelEditButton.addEventListener("click", async () => {
      resetFormState();
      cityIdSelect.value = getCityFromUrl();
      await ensureCityData(getSelectedCityId());
      populateZoneOptions(getSelectedCityId());
      updateCityUi(getSelectedCityId());
      showFeedback("Edit cancelled.", "success");
    });
  }

  if (resetRulesButton) {
    resetRulesButton.addEventListener("click", async () => {
      resetFormState();
      cityIdSelect.value = getCityFromUrl();
      await ensureCityData(getSelectedCityId());
      populateZoneOptions(getSelectedCityId());
      updateCityUi(getSelectedCityId());
      clearFeedback();
      showFeedback("Form cleared.", "success");
    });
  }

  if (runEvaluationButton) {
    runEvaluationButton.addEventListener("click", async () => {
      try {
        cityDataCache = {};
        await ensureCityData(getSelectedCityId());
        populateZoneOptions(getSelectedCityId());
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
      setCityInUrl(selectedCityId);
      await ensureCityData(selectedCityId);
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

function populateZoneOptions(selectedCityId = getSelectedCityId()) {
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

    cityDataCache = {};
    await ensureCityData(payload.cityId);
    await renderAllFromApi();
    resetFormState();
    cityIdSelect.value = payload.cityId;
    populateZoneOptions(payload.cityId);
    updateCityUi(payload.cityId);
    setCityInUrl(payload.cityId);
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
    await startEditingRule(ruleId);
    return;
  }

  if (deleteButton) {
    const ruleId = deleteButton.dataset.ruleId;

    try {
      await deleteRuleApi(ruleId);
      await renderAllFromApi();
      resetFormState();
      cityIdSelect.value = getCityFromUrl();
      await ensureCityData(getSelectedCityId());
      populateZoneOptions(getSelectedCityId());
      updateCityUi(getSelectedCityId());
      showFeedback("Rule deleted.", "success");
    } catch (error) {
      console.error("delete rule error:", error);
      showFeedback(error.message || "Failed to delete rule.", "error");
    }
  }
}

async function startEditingRule(ruleId) {
  const rule = currentRules.find((item) => item.ruleId === ruleId);
  if (!rule) return;

  await ensureCityData(rule.cityId || "hamilton");

  editingRuleIdInput.value = rule.ruleId;
  document.getElementById("ruleName").value = rule.ruleName;
  cityIdSelect.value = rule.cityId || getCityFromUrl() || "hamilton";
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
  updateCityUi(cityIdSelect.value);
  setCityInUrl(cityIdSelect.value);
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

  const selectedCityId = getCityFromUrl();
  if (cityIdSelect) {
    cityIdSelect.value = selectedCityId;
  }

  populateZoneOptions(selectedCityId);
  updateCityUi(selectedCityId);

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

function formatLevelsSummary(rule) {
  const levels = rule.levels || [];

  if (!levels.length) {
    return `<span class="ruleSubtext">No levels</span>`;
  }

  return levels
    .map((level) => {
      const thresholdText =
        level.threshold !== undefined && level.threshold !== null
          ? ` (${level.threshold})`
          : "";
      return `<span class="badge ${escapeHtml(level.id)}">${escapeHtml(level.label)}${escapeHtml(thresholdText)}</span>`;
    })
    .join(" ");
}

function formatRuleEvaluation(rule) {
  const evalLabel =
    rule.evaluationType === "zoneAverage" ? "Zone Average" : "Single Sensor";

  const comparisonLabel =
    rule.comparison === "lessThan" ? "Less Than" : "Greater Than";

  const windowLabel =
    rule.window === "fiveMinuteAverage" ? "5-Minute Average" : "Latest Reading";

  return `
    <div class="ruleNameCell">
      <strong>${escapeHtml(evalLabel)}</strong>
      <span class="ruleSubtext">${escapeHtml(comparisonLabel)} · ${escapeHtml(windowLabel)}</span>
    </div>
  `;
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
            <strong>${escapeHtml(alert.ruleName || "Triggered Alert")}</strong>
            <span class="ruleSubtext">${escapeHtml(alert.message || "")}</span>
          </div>
        </td>
        <td>${escapeHtml(getZoneLabel(alert.zoneId, alert.cityId || "hamilton"))}</td>
        <td>${escapeHtml(metricConfig[alert.metric]?.label ?? alert.metric)}</td>
        <td><span class="badge ${escapeHtml((alert.severity || "mild").toLowerCase())}">${escapeHtml(alert.severityLabel || alert.severity || "Alert")}</span></td>
        <td>${escapeHtml(String(alert.reading ?? ""))} ${escapeHtml(alert.unit || "")}</td>
        <td><span class="badge active">${escapeHtml(capitalize(alert.status || "active"))}</span></td>
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

function capitalize(value) {
  return String(value || "").charAt(0).toUpperCase() + String(value || "").slice(1);
}

function capitalizeWords(value) {
  return String(value || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function renderAllFromApi() {
  await ensureCityData(getSelectedCityId());
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