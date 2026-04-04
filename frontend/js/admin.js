import {
  createRule,
  deleteRule,
  evaluateRulesAgainstCurrentData,
  formatLevelsSummary,
  formatRuleEvaluation,
  getAdminCities,
  getAuditEntries,
  getCityData,
  getMetrics,
  getRuleById,
  getRuleStats,
  getRules,
  getTriggeredAlerts,
  getZones,
  metricConfig,
  seedDefaultRules,
  updateRule
} from "./adminAlerts.js";

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

function initializeAdminPage() {
  seedDefaultRules();
  populateCityOptions();
  populateZoneOptions(getSelectedCityId());
  populateMetricOptions();
  evaluateRulesAgainstCurrentData();
  updateCityUi(getSelectedCityId());
  renderAll();
  setupAccountMenu();
  setupEventListeners();
  resetFormState();
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
      localStorage.removeItem("geoAlertAdminRules");
      localStorage.removeItem("geoAlertTriggeredAlerts");
      localStorage.removeItem("geoAlertAdminAudit");
      seedDefaultRules(true);
      resetFormState();
      renderAll();
      showFeedback("Demo rules were reset successfully.", "success");
    });
  }

if (runEvaluationButton) {
  runEvaluationButton.addEventListener("click", () => {
    const selectedCityId = getSelectedCityId();
    const selectedCity = getCityData(selectedCityId);

    evaluateRulesAgainstCurrentData();
    renderAll();
    showFeedback(`Alert evaluation completed against the current ${selectedCity.cityName} data.`, "success");
  });
}

if (cityIdSelect) {
  cityIdSelect.addEventListener("change", () => {
    const selectedCityId = cityIdSelect.value;
    populateZoneOptions(selectedCityId);
    updateCityUi(selectedCityId);
    renderSummary();
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

function handleRuleSubmit(event) {
  event.preventDefault();
  clearFeedback();

  const payload = buildRulePayloadFromForm();
  const validationError = validateRulePayload(payload);

  if (validationError) {
    showFeedback(validationError, "error");
    return;
  }

  const editingRuleId = editingRuleIdInput.value.trim();

  if (editingRuleId) {
    updateRule(editingRuleId, payload);
    showFeedback("Rule updated successfully.", "success");
  } else {
    createRule(payload);
    showFeedback("Alert rule created successfully.", "success");
  }

  evaluateRulesAgainstCurrentData();
  renderAll();
  resetFormState();
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

function handleRulesTableActions(event) {
  const editButton = event.target.closest("[data-action='edit']");
  const deleteButton = event.target.closest("[data-action='delete']");

  if (editButton) {
    const ruleId = editButton.dataset.ruleId;
    startEditingRule(ruleId);
    return;
  }

  if (deleteButton) {
    const ruleId = deleteButton.dataset.ruleId;
    deleteRule(ruleId);
    evaluateRulesAgainstCurrentData();
    renderAll();
    resetFormState();
    showFeedback("Rule deleted.", "success");
  }
}

function startEditingRule(ruleId) {
  const rule = getRuleById(ruleId);
  if (!rule) return;

  editingRuleIdInput.value = rule.id;
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

function renderAll() {
  renderSummary();
  renderRulesTable();
  renderTriggeredAlerts();
  renderAuditLog();
}

function renderSummary() {
  const selectedCityId = getSelectedCityId();
  const stats = getRuleStats(selectedCityId);

  summaryCity.textContent = stats.cityName;
  summaryZones.textContent = String(stats.zoneCount);
  summaryRules.textContent = String(stats.activeRules);
  summaryTriggered.textContent = String(stats.triggeredAlerts);

  updateCityUi(selectedCityId);
}

function renderRulesTable() {
  const rules = getRules();

  if (!rules.length) {
    rulesTableBody.innerHTML = `
      <tr>
        <td colspan="6">
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
      <td>${escapeHtml(rule.cityName || "Hamilton")}</td>
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
            data-rule-id="${rule.id}"
          >
            Edit
          </button>
          <button
            type="button"
            class="smallButton danger"
            data-action="delete"
            data-rule-id="${rule.id}"
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
  const alerts = getTriggeredAlerts();

  if (!alerts.length) {
    triggeredAlertsBody.innerHTML = `
      <tr>
        <td colspan="6">
          <p class="emptyState">No alerts are currently triggered by the active rules.</p>
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
        <td>${escapeHtml(alert.zoneName)}</td>
        <td>${escapeHtml(alert.metricLabel)}</td>
        <td><span class="badge ${alert.severity}">${escapeHtml(alert.severityLabel)}</span></td>
        <td>${alert.reading} ${alert.unit}</td>
        <td><span class="badge active">${capitalize(alert.status)}</span></td>
      </tr>
    `)
    .join("");
}

function renderAuditLog() {
  if (!auditLog) return;

  const entries = getAuditEntries();

  if (!entries.length) {
    auditLog.innerHTML = `<p class="emptyState">No audit entries recorded yet.</p>`;
    return;
  }

  auditLog.innerHTML = entries
    .map((entry) => `
      <article class="auditItem">
        <div class="auditTop">
          <p class="auditAction">${entry.action}</p>
          <span class="auditTime">${formatTimestamp(entry.timestamp)}</span>
        </div>
        <p class="auditText">${entry.details}</p>
      </article>
    `)
    .join("");
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