import {
  createRule,
  deleteRule,
  evaluateRulesAgainstCurrentData,
  formatRuleEvaluation,
  getAuditEntries,
  getCityData,
  getMetrics,
  getRuleStats,
  getRules,
  getTriggeredAlerts,
  getZones,
  metricConfig,
  seedDefaultRules,
  toggleRuleEnabled
} from "./adminAlerts.js";

const accountMenuButton = document.getElementById("accountMenuButton");
const accountDropdown = document.getElementById("accountDropdown");

const ruleForm = document.getElementById("ruleForm");
const clearFormButton = document.getElementById("clearFormButton");
const resetRulesButton = document.getElementById("resetRulesButton");
const runEvaluationButton = document.getElementById("runEvaluationButton");

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

initializeAdminPage();

function initializeAdminPage() {
  seedDefaultRules();
  populateZoneOptions();
  populateMetricOptions();
  evaluateRulesAgainstCurrentData();
  renderAll();
  setupAccountMenu();
  setupEventListeners();
}

function setupAccountMenu() {
  if (!accountMenuButton || !accountDropdown) {
    return;
  }

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
  ruleForm.addEventListener("submit", handleRuleSubmit);

  clearFormButton.addEventListener("click", () => {
    ruleForm.reset();
    clearFeedback();
  });

  resetRulesButton.addEventListener("click", () => {
    localStorage.removeItem("geoAlertAdminRules");
    localStorage.removeItem("geoAlertTriggeredAlerts");
    localStorage.removeItem("geoAlertAdminAudit");
    seedDefaultRules(true);
    renderAll();
    showFeedback("Demo rules were reset successfully.", "success");
  });

  runEvaluationButton.addEventListener("click", () => {
    evaluateRulesAgainstCurrentData();
    renderAll();
    showFeedback("Alert evaluation completed against the current Hamilton data.", "success");
  });

  rulesTableBody.addEventListener("click", handleRulesTableActions);
}

function populateZoneOptions() {
  const cityData = getCityData();
  const zones = getZones();

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

  const formData = new FormData(ruleForm);
  const payload = Object.fromEntries(formData.entries());

  if (!payload.ruleName.trim() || !payload.alertMessage.trim()) {
    showFeedback("Please complete the rule name and alert message.", "error");
    return;
  }

  if (!payload.threshold || Number.isNaN(Number(payload.threshold))) {
    showFeedback("Please enter a valid numeric threshold.", "error");
    return;
  }

  createRule(payload);
  evaluateRulesAgainstCurrentData();
  renderAll();
  ruleForm.reset();
  showFeedback("Alert rule created successfully.", "success");
}

function handleRulesTableActions(event) {
  const toggleButton = event.target.closest("[data-action='toggle']");
  const deleteButton = event.target.closest("[data-action='delete']");

  if (toggleButton) {
    const ruleId = toggleButton.dataset.ruleId;
    toggleRuleEnabled(ruleId);
    evaluateRulesAgainstCurrentData();
    renderAll();
    showFeedback("Rule status updated.", "success");
    return;
  }

  if (deleteButton) {
    const ruleId = deleteButton.dataset.ruleId;
    deleteRule(ruleId);
    evaluateRulesAgainstCurrentData();
    renderAll();
    showFeedback("Rule deleted.", "success");
  }
}

function renderAll() {
  renderSummary();
  renderRulesTable();
  renderTriggeredAlerts();
  renderAuditLog();
}

function renderSummary() {
  const stats = getRuleStats();

  summaryCity.textContent = stats.cityName;
  summaryZones.textContent = String(stats.zoneCount);
  summaryRules.textContent = String(stats.activeRules);
  summaryTriggered.textContent = String(stats.triggeredAlerts);
}

function renderRulesTable() {
  const rules = getRules();

  if (!rules.length) {
    rulesTableBody.innerHTML = `
      <tr>
        <td colspan="8">
          <p class="emptyState">No rules created yet.</p>
        </td>
      </tr>
    `;
    return;
  }

  rulesTableBody.innerHTML = rules
    .map((rule) => {
      const zoneName = getZoneLabel(rule.zoneId);
      const metricLabel = metricConfig[rule.metric]?.label ?? rule.metric;
      const severityLabel = capitalize(rule.severity);
      const statusLabel = rule.enabled ? "Enabled" : "Disabled";
      const thresholdLabel = `${rule.comparison === "greaterThan" ? ">" : "<"} ${rule.threshold} ${metricConfig[rule.metric]?.unit ?? ""}`;

      return `
        <tr>
          <td>
            <div class="ruleNameCell">
              <strong>${rule.ruleName}</strong>
              <span class="ruleSubtext">${escapeHtml(rule.alertMessage)}</span>
            </div>
          </td>
          <td>${zoneName}</td>
          <td>${metricLabel}</td>
          <td>${formatRuleEvaluation(rule)}</td>
          <td>${thresholdLabel}</td>
          <td><span class="badge ${rule.severity}">${severityLabel}</span></td>
          <td><span class="badge ${rule.enabled ? "enabled" : "disabled"}">${statusLabel}</span></td>
          <td>
            <div class="ruleActionGroup">
              <button
                type="button"
                class="smallButton ${rule.enabled ? "" : "success"}"
                data-action="toggle"
                data-rule-id="${rule.id}"
              >
                ${rule.enabled ? "Disable" : "Enable"}
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
      `;
    })
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
    .map((alert) => {
      return `
        <tr>
          <td>
            <div class="ruleNameCell">
              <strong>${alert.ruleName}</strong>
              <span class="ruleSubtext">${escapeHtml(alert.message)}</span>
            </div>
          </td>
          <td>${alert.zoneName}</td>
          <td>${alert.metricLabel}</td>
          <td><span class="badge ${alert.severity}">${capitalize(alert.severity)}</span></td>
          <td>${alert.reading} ${alert.unit}</td>
          <td><span class="badge active">${capitalize(alert.status)}</span></td>
        </tr>
      `;
    })
    .join("");
}

function renderAuditLog() {
  const entries = getAuditEntries();

  if (!entries.length) {
    auditLog.innerHTML = `<p class="emptyState">No audit entries recorded yet.</p>`;
    return;
  }

  auditLog.innerHTML = entries
    .map((entry) => {
      return `
        <article class="auditItem">
          <div class="auditTop">
            <p class="auditAction">${entry.action}</p>
            <span class="auditTime">${formatTimestamp(entry.timestamp)}</span>
          </div>
          <p class="auditText">${entry.details}</p>
        </article>
      `;
    })
    .join("");
}

function getZoneLabel(zoneId) {
  if (zoneId === "all-zones") {
    return "All Hamilton Zones";
  }

  const zone = getZones().find((item) => item.id === zoneId);
  return zone ? zone.zoneName : zoneId;
}

function showFeedback(message, type) {
  formFeedback.textContent = message;
  formFeedback.classList.remove("isSuccess", "isError");

  if (type === "success") {
    formFeedback.classList.add("isSuccess");
  }

  if (type === "error") {
    formFeedback.classList.add("isError");
  }
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
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}