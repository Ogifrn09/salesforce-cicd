const demoData = {
  generatedAt: "2026-06-01 01:00:00 WIB",
  environment: "trailhead",
  status: "YELLOW",
  limits: [
    { name: "DailyApiRequests", max: 15000, remaining: 14661 },
    { name: "DailyBulkApiBatches", max: 15000, remaining: 15000 },
    { name: "DailyAsyncApexExecutions", max: 250000, remaining: 250000 },
    { name: "DataStorageMB", max: 1024, remaining: 880 },
    { name: "FileStorageMB", max: 2048, remaining: 1794 },
  ],
  events: [
    {
      severity: "YELLOW",
      domain: "Product",
      check: "products_missing_code",
      title: "Active products missing ProductCode",
      count: 1,
      detail: "Review product master data before quote/order processing.",
    },
    {
      severity: "YELLOW",
      domain: "Opportunity",
      check: "opportunities_past_close",
      title: "Open opportunities past CloseDate",
      count: 2,
      detail: "Update stale pipeline records or close invalid opportunities.",
    },
    {
      severity: "GREEN",
      domain: "Apex",
      check: "async_apex_failures",
      title: "Async Apex failures",
      count: 0,
      detail: "No failed AsyncApexJob records detected in the last day.",
    },
    {
      severity: "GREEN",
      domain: "Security",
      check: "login_failures",
      title: "Login failures",
      count: 0,
      detail: "LoginHistory unavailable or no failures returned.",
    },
  ],
  incidents: [
    {
      id: "INC-001",
      severity: "YELLOW",
      title: "Product code missing",
      owner: "CRM Ops",
      status: "Open",
    },
    {
      id: "INC-002",
      severity: "YELLOW",
      title: "Opportunity close date review",
      owner: "Sales Ops",
      status: "Open",
    },
  ],
  deployments: [
    {
      time: "Today 00:28",
      title: "Manual deploy to dummy prod",
      meta: "Product2.Product_Release_Notes__c, Account.CustomerPriority__c",
      status: "Succeeded",
    },
    {
      time: "Today 00:04",
      title: "Metadata backup",
      meta: "force-app and manifest refreshed",
      status: "Succeeded",
    },
    {
      time: "Yesterday 23:41",
      title: "Product health check",
      meta: "Known product data issue detected",
      status: "Warning",
    },
  ],
  businessData: {
    Account: [
      { Id: "001-DEMO-001", Name: "Acme Manufacturing", Industry: "Manufacturing", Type: "Customer", Status: "Active" },
      { Id: "001-DEMO-002", Name: "Global Media Group", Industry: "Media", Type: "Prospect", Status: "Review" },
    ],
    Opportunity: [
      { Id: "006-DEMO-001", Name: "Acme Renewal FY26", StageName: "Proposal", Amount: "125000", CloseDate: "2026-06-30" },
      { Id: "006-DEMO-002", Name: "Global Media Expansion", StageName: "Negotiation", Amount: "84000", CloseDate: "2026-07-15" },
    ],
    Quote: [
      { Id: "0Q0-DEMO-001", Name: "Q-0001", QuoteNumber: "Q-0001", Status: "Draft", GrandTotal: "125000" },
      { Id: "0Q0-DEMO-002", Name: "Q-0002", QuoteNumber: "Q-0002", Status: "Approved", GrandTotal: "84000" },
    ],
    Order: [
      { Id: "801-DEMO-001", OrderNumber: "00000100", Status: "Draft", EffectiveDate: "2026-06-01", TotalAmount: "125000" },
      { Id: "801-DEMO-002", OrderNumber: "00000101", Status: "Activated", EffectiveDate: "2026-06-03", TotalAmount: "84000" },
    ],
    Contract: [
      { Id: "800-DEMO-001", ContractNumber: "C-0001", Status: "Activated", StartDate: "2026-06-01", EndDate: "2027-05-31" },
    ],
    Asset: [
      { Id: "02i-DEMO-001", Name: "CloudyBot License", Status: "Installed", SerialNumber: "CB-001", InstallDate: "2026-06-01" },
    ],
    Product2: [
      { Id: "01t-DEMO-001", Name: "CloudyBot", ProductCode: "CB-001", IsActive: "true", Family: "Robotics" },
      { Id: "01t-DEMO-002", Name: "RainbowBot", ProductCode: "RB-001", IsActive: "true", Family: "Robotics" },
    ],
    PricebookEntry: [
      { Id: "01u-DEMO-001", Product2Id: "01t-DEMO-001", UnitPrice: "125000", IsActive: "true" },
    ],
  },
  opsActions: [
    {
      id: "platform-health",
      name: "Run Platform Health",
      purpose: "Collect platform health, performance, login, Apex, and data-quality signals.",
      workflow: "salesforce-platform-health.yml",
      target: "Dummy prod / trailhead",
      severity: "GREEN",
      inputs: ["Branch: main"],
      checklist: ["Use before business review or after suspected platform issue.", "Download platform-health-report artifact.", "Review Summary, Data Quality, and Recommendations sheets."],
    },
    {
      id: "org-health",
      name: "Run Org Health",
      purpose: "Run broader org health checks including object-level business checks.",
      workflow: "salesforce-org-health.yml",
      target: "Dummy prod / trailhead",
      severity: "GREEN",
      inputs: ["Branch: main"],
      checklist: ["Run after deploy or before release window.", "Download org-health-report artifact.", "Review Org Limits and Health Report sheets."],
    },
    {
      id: "metadata-backup",
      name: "Backup Metadata",
      purpose: "Retrieve Salesforce metadata from dummy prod and commit changes when detected.",
      workflow: "salesforce-backup.yml",
      target: "Dummy prod / trailhead",
      severity: "YELLOW",
      inputs: ["Branch: main"],
      checklist: ["Run before manual deploy.", "Confirm workflow completed.", "Review backup commit if metadata changed."],
    },
    {
      id: "data-backup",
      name: "Backup Business Data",
      purpose: "Export configured business objects to CSV backup files.",
      workflow: "salesforce-data-backup.yml",
      target: "Dummy prod / trailhead",
      severity: "YELLOW",
      inputs: ["Branch: main"],
      checklist: ["Run before deployment impacting business data.", "Confirm CSV files exist in backups/data/YYYY-MM-DD.", "Do not expose production CSV in public repositories."],
    },
    {
      id: "deploy",
      name: "Deploy Metadata",
      purpose: "Deploy manifest/deploy-package.xml to dummy prod with deploy evidence report.",
      workflow: "salesforce-deploy.yml",
      target: "Dummy prod / trailhead",
      severity: "YELLOW",
      inputs: ["Branch: main", "confirm_deploy: DEPLOY"],
      checklist: ["Validate PR is green.", "Run backup and health checks first.", "Download deploy-report artifact after completion."],
    },
    {
      id: "rollback",
      name: "Rollback Metadata",
      purpose: "Delete metadata listed in manifest/destructiveChanges.xml from dummy prod.",
      workflow: "salesforce-rollback.yml",
      target: "Dummy prod / trailhead",
      severity: "RED",
      inputs: ["Branch: main", "confirm_rollback: ROLLBACK"],
      checklist: ["Review destructiveChanges.xml carefully.", "Confirm deleted fields/objects are intended.", "Verify metadata returns 0 records after rollback."],
    },
    {
      id: "data-restore",
      name: "Restore Data",
      purpose: "Restore one object from a selected CSV backup using bulk upsert.",
      workflow: "salesforce-data-restore.yml",
      target: "Dummy prod / trailhead",
      severity: "RED",
      inputs: ["Branch: main", "backup_date", "sobject_name", "csv_file", "external_id", "confirm_restore: RESTORE"],
      checklist: ["Restore one object at a time.", "Use Id only for same-org restore.", "Follow dependency order for Account, Contact, Opportunity, Product, Pricebook, Quote, Order, Asset."],
    },
  ],
};

const defaultConfig = {
  reportUrl: "",
  workflowBaseUrl: "https://github.com/Ogifrn09/salesforce-cicd/actions/workflows",
  warningThreshold: 80,
  criticalThreshold: 90,
  monitoredDomains: ["Product", "Opportunity", "Apex", "Security"],
};

const demoCredentials = {
  username: "admin",
  password: "monitoring123",
};

let state = structuredClone(demoData);
let config = loadConfig();
let uiState = {
  search: "",
  severity: "ALL",
  domain: "ALL",
};

const views = document.querySelectorAll(".view");
const navItems = document.querySelectorAll(".nav-item");

initAuth();

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");
    views.forEach((view) => view.classList.remove("active"));
    document.getElementById(`view-${item.dataset.view}`).classList.add("active");
  });
});

document.getElementById("reset-data").addEventListener("click", () => {
  state = structuredClone(demoData);
  render();
});

document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  if (username === demoCredentials.username && password === demoCredentials.password) {
    sessionStorage.setItem("sf-monitoring-user", username);
    document.getElementById("login-error").textContent = "";
    applyAuthState();
    return;
  }

  document.getElementById("login-error").textContent = "Username atau password salah.";
});

document.getElementById("logout-button").addEventListener("click", () => {
  sessionStorage.removeItem("sf-monitoring-user");
  document.getElementById("login-password").value = "";
  applyAuthState();
});

document.getElementById("event-search").addEventListener("input", (event) => {
  uiState.search = event.target.value.trim().toLowerCase();
  renderEvents();
});

document.getElementById("severity-filter").addEventListener("change", (event) => {
  uiState.severity = event.target.value;
  renderEvents();
});

document.getElementById("domain-filter").addEventListener("change", (event) => {
  uiState.domain = event.target.value;
  renderEvents();
});

document.getElementById("clear-filters").addEventListener("click", () => {
  uiState = { search: "", severity: "ALL", domain: "ALL" };
  document.getElementById("event-search").value = "";
  document.getElementById("severity-filter").value = "ALL";
  document.getElementById("domain-filter").value = "ALL";
  renderEvents();
});

document.getElementById("export-json").addEventListener("click", () => {
  downloadFile("salesforce-monitoring-report.json", JSON.stringify(buildReport(), null, 2), "application/json");
});

document.getElementById("export-csv").addEventListener("click", () => {
  downloadFile("salesforce-health-events.csv", eventsToCsv(state.events), "text/csv");
});

document.getElementById("print-report").addEventListener("click", () => {
  window.print();
});

document.getElementById("load-source").addEventListener("click", loadReportSource);

document.getElementById("save-config").addEventListener("click", () => {
  config = readConfigFromForm();
  localStorage.setItem("sf-monitoring-config", JSON.stringify(config));
  document.getElementById("source-status").textContent = "Config saved";
  render();
});

document.getElementById("health-file").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  setLoading("Importing JSON report...");
  const text = await file.text();
  const parsed = JSON.parse(text);
  state = normalizeImportedData(parsed);
  setLoading("");
  render();
});

document.getElementById("csv-file").addEventListener("change", async (event) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  setLoading(`Importing ${files.length} CSV file${files.length === 1 ? "" : "s"}...`);
  let lastObjectName = "";
  for (const file of files) {
    const text = await file.text();
    const objectName = file.name.replace(/\.error\.csv$/i, " Error").replace(/\.csv$/i, "");
    state.businessData[objectName] = parseCsv(text);
    lastObjectName = objectName;
  }
  renderBusinessOptions(lastObjectName);
  renderBusinessData(lastObjectName);
  document.querySelector('[data-view="business"]').click();
  setLoading("");
});

document.getElementById("business-object-select").addEventListener("change", (event) => {
  renderBusinessData(event.target.value);
});

function initAuth() {
  applyAuthState();
}

function applyAuthState() {
  const user = sessionStorage.getItem("sf-monitoring-user");
  const isAuthenticated = Boolean(user);
  document.body.classList.toggle("auth-locked", !isAuthenticated);
  document.body.classList.toggle("auth-ready", isAuthenticated);
  document.getElementById("login-screen").setAttribute("aria-hidden", String(isAuthenticated));
  document.getElementById("session-user").textContent = isAuthenticated ? user : "";
  if (!isAuthenticated) {
    document.getElementById("login-username").focus();
  }
}

function loadConfig() {
  try {
    return { ...defaultConfig, ...(JSON.parse(localStorage.getItem("sf-monitoring-config")) || {}) };
  } catch {
    return { ...defaultConfig };
  }
}

function hydrateConfigForm() {
  document.getElementById("data-source-url").value = config.reportUrl || "";
  document.getElementById("repo-url-input").value = config.workflowBaseUrl || defaultConfig.workflowBaseUrl;
  document.getElementById("warning-threshold").value = config.warningThreshold;
  document.getElementById("critical-threshold").value = config.criticalThreshold;
  document.getElementById("monitored-domains").value = config.monitoredDomains.join(", ");
}

function readConfigFromForm() {
  return {
    reportUrl: document.getElementById("data-source-url").value.trim(),
    workflowBaseUrl: document.getElementById("repo-url-input").value.trim() || defaultConfig.workflowBaseUrl,
    warningThreshold: Number(document.getElementById("warning-threshold").value || defaultConfig.warningThreshold),
    criticalThreshold: Number(document.getElementById("critical-threshold").value || defaultConfig.criticalThreshold),
    monitoredDomains: document
      .getElementById("monitored-domains")
      .value.split(",")
      .map((domain) => domain.trim())
      .filter(Boolean),
  };
}

async function loadReportSource() {
  config = readConfigFromForm();
  if (!config.reportUrl) {
    document.getElementById("source-status").textContent = "URL required";
    return;
  }

  setLoading("Fetching health JSON source...");
  document.getElementById("source-status").textContent = "Loading...";
  try {
    const response = await fetch(config.reportUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state = normalizeImportedData(await response.json());
    localStorage.setItem("sf-monitoring-config", JSON.stringify(config));
    document.getElementById("source-status").textContent = "Loaded";
    render();
  } catch (error) {
    document.getElementById("source-status").textContent = "Load failed";
    alert(`Could not load report source: ${error.message}`);
  } finally {
    setLoading("");
  }
}

function normalizeImportedData(data) {
  const sourceEvents = Array.isArray(data) ? data : data.events || data.healthEvents || data.records || [];
  const normalizedEvents = sourceEvents.map((event) => normalizeEvent(event));

  if (Array.isArray(data)) {
    return {
      ...demoData,
      generatedAt: new Date().toLocaleString(),
      status: deriveStatus(normalizedEvents),
      events: normalizedEvents,
      incidents: deriveIncidents(normalizedEvents, demoData.incidents),
    };
  }

  const importedLimits = data.limits || data.orgLimits || data.limitUsage || demoData.limits;
  const importedBusinessData = data.businessData || data.objects || data.recordsByObject || demoData.businessData;

  return {
    ...demoData,
    ...data,
    generatedAt: data.generatedAt || data.timestamp || data.runAt || new Date().toLocaleString(),
    environment: data.environment || data.org || data.salesforceOrg || demoData.environment,
    status: data.status || deriveStatus(normalizedEvents),
    events: normalizedEvents.length ? normalizedEvents : demoData.events,
    limits: importedLimits,
    businessData: importedBusinessData,
    incidents: deriveIncidents(normalizedEvents.length ? normalizedEvents : demoData.events, data.incidents || []),
    trends: data.trends || data.metrics || demoData.trends,
  };
}

function normalizeEvent(event) {
  const severity = normalizeSeverity(event.severity || event.status || event.level || "GREEN");
  return {
    severity,
    domain: event.domain || event.object || event.sobject || "Salesforce",
    check: event.check || event.checkName || event.metric || "custom_check",
    title: event.title || event.message || event.check || "Imported health event",
    count: Number(event.count ?? event.value ?? 0),
    detail: event.detail || event.description || event.message || "Imported from health-events JSON.",
    owner: event.owner || inferOwner(event.domain || event.object || "Salesforce"),
    status: event.incidentStatus || event.statusLabel || (severity === "RED" ? "Open" : "Investigating"),
  };
}

function normalizeSeverity(value) {
  const severity = String(value || "GREEN").toUpperCase();
  if (["RED", "CRITICAL", "ERROR", "FAILED"].includes(severity)) return "RED";
  if (["YELLOW", "WARNING", "WARN", "DEGRADED"].includes(severity)) return "YELLOW";
  return "GREEN";
}

function deriveStatus(events) {
  if (events.some((event) => normalizeSeverity(event.status || event.severity) === "RED")) {
    return "RED";
  }
  if (events.some((event) => normalizeSeverity(event.status || event.severity) === "YELLOW")) {
    return "YELLOW";
  }
  return "GREEN";
}

function deriveIncidents(events, existingIncidents = []) {
  const existingByTitle = new Map(existingIncidents.map((incident) => [incident.title, incident]));
  const generated = events
    .filter((event) => event.severity !== "GREEN" || Number(event.count || 0) > 0)
    .map((event, index) => {
      const existing = existingByTitle.get(event.title);
      return {
        id: existing?.id || `INC-${String(index + 1).padStart(3, "0")}`,
        severity: event.severity,
        title: event.title,
        owner: existing?.owner || event.owner || inferOwner(event.domain),
        status: existing?.status || (event.severity === "RED" ? "Open" : "Investigating"),
      };
    });

  return generated.length ? generated : existingIncidents;
}

function inferOwner(domain) {
  const normalizedDomain = String(domain || "").toLowerCase();
  if (normalizedDomain.includes("opportunity") || normalizedDomain.includes("quote") || normalizedDomain.includes("order")) return "Sales Ops";
  if (normalizedDomain.includes("product") || normalizedDomain.includes("pricebook")) return "CRM Ops";
  if (normalizedDomain.includes("apex") || normalizedDomain.includes("api") || normalizedDomain.includes("integration")) return "Platform Ops";
  if (normalizedDomain.includes("security") || normalizedDomain.includes("login")) return "Security Ops";
  return "Ops";
}

function getFilteredEvents() {
  return state.events.filter((event) => {
    const searchTarget = `${event.title} ${event.domain} ${event.check} ${event.detail}`.toLowerCase();
    const matchesSearch = !uiState.search || searchTarget.includes(uiState.search);
    const matchesSeverity = uiState.severity === "ALL" || event.severity === uiState.severity;
    const matchesDomain = uiState.domain === "ALL" || event.domain === uiState.domain;
    return matchesSearch && matchesSeverity && matchesDomain;
  });
}

function render() {
  state.events = state.events.map(normalizeEvent);
  state.incidents = deriveIncidents(state.events, state.incidents || []);
  state.status = deriveStatus(state.events);

  const criticalCount = state.events.filter((event) => event.severity === "RED").length;
  const warningCount = state.events.filter((event) => event.severity === "YELLOW").length;
  const apiLimit = state.limits.find((limit) => limit.name === "DailyApiRequests") || {
    max: 1,
    remaining: 1,
  };
  const apiUsed = Math.max(0, Math.round(((apiLimit.max - apiLimit.remaining) / apiLimit.max) * 100));

  document.getElementById("last-run").textContent = `Last run: ${state.generatedAt} | ${state.environment}`;
  document.getElementById("overall-status").textContent = state.status;
  document.querySelector(".status-panel.overall").dataset.status = state.status;
  document.querySelector(".overall-check").textContent = state.status === "GREEN" ? "OK" : state.status === "YELLOW" ? "!" : "X";
  document.getElementById("critical-count").textContent = criticalCount;
  document.getElementById("warning-count").textContent = warningCount;
  document.getElementById("api-used").textContent = `${apiUsed}%`;
  document.getElementById("event-total").textContent = `${state.events.length} events`;
  document.querySelector(".environment-value").textContent = state.environment || "unknown";
  document.querySelector(".overall-check").textContent = state.status === "GREEN" ? "OK" : state.status === "YELLOW" ? "!" : "X";
  document.querySelector(".api-gauge").style.background = `conic-gradient(var(--cloud) 0 ${apiUsed}%, #e2edf5 ${apiUsed}% 100%)`;
  document.getElementById("event-total").textContent = `${getFilteredEvents().length}/${state.events.length} events`;

  hydrateConfigForm();
  renderFilters();
  renderPrioritySummary(apiUsed);
  renderVisuals(apiUsed);
  renderEvents();
  renderRecommendations();
  renderDomains();
  renderLimits();
  renderBusinessOptions();
  renderBusinessData();
  renderQuality();
  renderIncidents();
  renderDeployments();
  renderOpsActions();
}

function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  if (current || row.length) {
    row.push(current);
    rows.push(row);
  }

  const headers = rows.shift() || [];
  return rows.map((values) =>
    headers.reduce((record, header, index) => {
      record[header || `Column${index + 1}`] = values[index] || "";
      return record;
    }, {}),
  );
}

function renderFilters() {
  const domainFilter = document.getElementById("domain-filter");
  const domains = [...new Set(state.events.map((event) => event.domain).filter(Boolean))].sort();
  const current = uiState.domain;
  domainFilter.innerHTML = [`<option value="ALL">All domains</option>`, ...domains.map((domain) => `<option value="${domain}">${domain}</option>`)].join("");
  domainFilter.value = domains.includes(current) ? current : "ALL";
}

function renderPrioritySummary(apiUsed) {
  const topEvent = [...state.events]
    .filter((event) => event.severity !== "GREEN" || Number(event.count || 0) > 0)
    .sort((left, right) => severityRank(right.severity) - severityRank(left.severity) || Number(right.count || 0) - Number(left.count || 0))[0];
  const score = calculateRecoveryScore(apiUsed);
  document.getElementById("recovery-score").textContent = `${score}% ready`;

  const summary = topEvent
    ? {
        title: topEvent.severity === "RED" ? "Handle critical incident first" : "Review warning signal first",
        detail: `${topEvent.domain}: ${topEvent.title}. ${topEvent.detail}`,
        action: getRecommendedAction(topEvent),
        severity: topEvent.severity,
      }
    : {
        title: "No urgent action required",
        detail: "All health signals are green. Keep scheduled checks, backup review, and deployment evidence current.",
        action: "Run platform health before the next release window.",
        severity: "GREEN",
      };

  document.getElementById("priority-summary").innerHTML = `
    <div class="priority-card ${summary.severity}">
      <span class="severity ${summary.severity}">${summary.severity}</span>
      <div>
        <strong>${summary.title}</strong>
        <p>${summary.detail}</p>
        <span>${summary.action}</span>
      </div>
    </div>
  `;
}

function renderVisuals(apiUsed) {
  const storageLimit = state.limits.find((limit) => /storage/i.test(limit.name)) || { max: 1, remaining: 1 };
  const storageUsed = Math.max(0, Math.round(((storageLimit.max - storageLimit.remaining) / storageLimit.max) * 100));
  const warningByDomain = state.events
    .filter((event) => event.severity === "YELLOW" || event.severity === "RED")
    .reduce((accumulator, event) => {
      accumulator[event.domain] = (accumulator[event.domain] || 0) + 1;
      return accumulator;
    }, {});
  const domainBars = Object.entries(warningByDomain)
    .map(([domain, count]) => `<div><span>${domain}</span><strong>${count}</strong><div class="mini-bar"><i style="width:${Math.min(100, count * 34)}%"></i></div></div>`)
    .join("");

  document.getElementById("trend-grid").innerHTML = `
    <div class="trend-card">
      <span>API usage trend</span>
      <strong>${apiUsed}%</strong>
      <div class="trend-line api-trend"></div>
    </div>
    <div class="trend-card">
      <span>Storage usage</span>
      <strong>${storageUsed}%</strong>
      <div class="bar-track"><div class="bar-fill" style="width:${storageUsed}%"></div></div>
    </div>
    <div class="trend-card">
      <span>Warning by domain</span>
      ${domainBars || `<p class="empty-copy">No warning domains right now.</p>`}
    </div>
    <div class="trend-card">
      <span>Recovery readiness</span>
      <strong>${calculateRecoveryScore(apiUsed)}%</strong>
      <div class="readiness-meter"><i style="width:${calculateRecoveryScore(apiUsed)}%"></i></div>
    </div>
  `;
}

function calculateRecoveryScore(apiUsed) {
  const redPenalty = state.events.filter((event) => event.severity === "RED").length * 20;
  const yellowPenalty = state.events.filter((event) => event.severity === "YELLOW").length * 8;
  const apiPenalty = apiUsed > config.warningThreshold ? 10 : 0;
  const openPenalty = (state.incidents || []).filter((incident) => incident.status !== "Resolved").length * 3;
  return Math.max(0, Math.min(100, 100 - redPenalty - yellowPenalty - apiPenalty - openPenalty));
}

function getApiUsed() {
  const apiLimit = state.limits.find((limit) => limit.name === "DailyApiRequests") || { max: 1, remaining: 1 };
  return Math.max(0, Math.round(((apiLimit.max - apiLimit.remaining) / apiLimit.max) * 100));
}

function severityRank(severity) {
  return { GREEN: 1, YELLOW: 2, RED: 3 }[severity] || 0;
}

function getRecommendedAction(event) {
  if (event.domain === "Product") return "Open Business Data, inspect Product2, then run Data Quality Scan.";
  if (event.domain === "Opportunity") return "Ask Sales Ops to review stale opportunities before quote/order processing.";
  if (event.severity === "RED") return "Open incident response and attach latest health JSON report.";
  return "Assign owner and validate the latest workflow artifact.";
}

function renderEvents() {
  const list = document.getElementById("event-list");
  const events = getFilteredEvents();
  document.getElementById("event-total").textContent = `${events.length}/${state.events.length} events`;

  if (!events.length) {
    list.innerHTML = `
      <div class="empty-state">
        <strong>No matching events</strong>
        <span>Try clearing search or changing severity/domain filters.</span>
      </div>
    `;
    return;
  }

  list.innerHTML = events
    .map(
      (event) => `
        <div class="event-row">
          <span class="severity ${event.severity}">${event.severity}</span>
          <div>
            <div class="event-title">${event.title}</div>
            <div class="event-detail">${event.domain} | ${event.check} | ${event.detail}</div>
          </div>
          <div class="event-count">${event.count}</div>
        </div>
      `,
    )
    .join("");
}

function renderRecommendations() {
  const recommendations = state.events
    .filter((event) => event.severity !== "GREEN")
    .map((event) => {
      return { title: event.title, action: getRecommendedAction(event), severity: event.severity };
    });

  const rows = recommendations.length
    ? recommendations
    : [{ title: "No action required", action: "Continue scheduled monitoring and backup checks." }];

  document.getElementById("recommendations").innerHTML = rows
    .map(
      (item) => `
        <div class="recommendation">
          <span class="severity ${item.severity || "GREEN"}">${item.severity || "GREEN"}</span>
          <strong>${item.title}</strong>
          <span>${item.action}</span>
        </div>
      `,
    )
    .join("");
}

function renderDomains() {
  const domains = config.monitoredDomains.length ? config.monitoredDomains : [...new Set(state.events.map((event) => event.domain))];
  document.getElementById("domain-grid").innerHTML = domains
    .map((domain) => {
      const events = state.events.filter((event) => event.domain === domain);
      const status = deriveStatus(events);
      const count = events.reduce((sum, event) => sum + Number(event.count || 0), 0);
      return `
        <div class="domain-card">
          <span class="severity ${status}">${status}</span>
          <strong>${domain}</strong>
          <span>${count} open signal${count === 1 ? "" : "s"}</span>
        </div>
      `;
    })
    .join("");
}

function renderLimits() {
  const rows = state.limits.map((limit) => {
    const used = Math.max(0, limit.max - limit.remaining);
    const usedPct = limit.max ? Math.round((used / limit.max) * 100) : 0;
    const status = usedPct >= config.criticalThreshold ? "RED" : usedPct >= config.warningThreshold ? "YELLOW" : "GREEN";
    return `
      <tr>
        <td>${limit.name}</td>
        <td>${limit.max.toLocaleString()}</td>
        <td>${limit.remaining.toLocaleString()}</td>
        <td><div class="bar-track"><div class="bar-fill" style="width:${usedPct}%"></div></div></td>
        <td><span class="severity ${status}">${status}</span></td>
      </tr>
    `;
  });

  document.getElementById("limits-table").innerHTML = `
    <table>
      <thead><tr><th>Limit</th><th>Max</th><th>Remaining</th><th>Used</th><th>Status</th></tr></thead>
      <tbody>${rows.join("")}</tbody>
    </table>
  `;
}

function renderBusinessOptions(selectedName) {
  const select = document.getElementById("business-object-select");
  const names = Object.keys(state.businessData);
  const current = selectedName || select.value || names[0];
  select.innerHTML = names.map((name) => `<option value="${name}">${name}</option>`).join("");
  select.value = names.includes(current) ? current : names[0];
}

function renderBusinessData(objectName) {
  const select = document.getElementById("business-object-select");
  const name = objectName || select.value || Object.keys(state.businessData)[0];
  const records = state.businessData[name] || [];
  document.getElementById("business-count").textContent = `${records.length} records`;

  if (!records.length) {
    document.getElementById("business-table").innerHTML = "<p>No records loaded for this object.</p>";
    return;
  }

  const columns = Object.keys(records[0]).slice(0, 10);
  document.getElementById("business-table").innerHTML = `
    <table>
      <thead><tr>${columns.map((column) => `<th>${column}</th>`).join("")}</tr></thead>
      <tbody>
        ${records
          .slice(0, 100)
          .map((record) => `<tr>${columns.map((column) => `<td>${record[column] ?? ""}</td>`).join("")}</tr>`)
          .join("")}
      </tbody>
    </table>
  `;
}

function renderQuality() {
  const rows = state.events
    .filter((event) => ["Product", "Opportunity"].includes(event.domain))
    .map(
      (event) => `
        <tr>
          <td>${event.domain}</td>
          <td>${event.check}</td>
          <td>${event.count}</td>
          <td><span class="severity ${event.severity}">${event.severity}</span></td>
          <td>${event.detail}</td>
        </tr>
      `,
    )
    .join("");

  document.getElementById("quality-table").innerHTML = `
    <table>
      <thead><tr><th>Domain</th><th>Check</th><th>Count</th><th>Status</th><th>Detail</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderIncidents() {
  const openCount = state.incidents.filter((incident) => incident.status !== "Resolved").length;
  document.getElementById("incident-summary").textContent = `${openCount} active`;
  document.getElementById("incident-table").innerHTML = `
    <table>
      <thead><tr><th>ID</th><th>Severity</th><th>Title</th><th>Owner</th><th>Status</th><th>Workflow</th></tr></thead>
      <tbody>
        ${state.incidents
          .map(
            (incident) => `
              <tr>
                <td>${incident.id}</td>
                <td><span class="severity ${incident.severity}">${incident.severity}</span></td>
                <td>${incident.title}</td>
                <td>${incident.owner}</td>
                <td><span class="status-chip">${incident.status}</span></td>
                <td>
                  <div class="incident-actions">
                    <button data-incident-id="${incident.id}" data-status="Open">Open</button>
                    <button data-incident-id="${incident.id}" data-status="Investigating">Investigating</button>
                    <button data-incident-id="${incident.id}" data-status="Resolved">Resolved</button>
                  </div>
                </td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;

  document.querySelectorAll("[data-incident-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const incident = state.incidents.find((item) => item.id === button.dataset.incidentId);
      if (!incident) return;
      incident.status = button.dataset.status;
      renderIncidents();
      renderPrioritySummary(getApiUsed());
      renderVisuals(getApiUsed());
    });
  });
}

function renderDeployments() {
  document.getElementById("deployment-timeline").innerHTML = state.deployments
    .map(
      (item) => `
        <div class="timeline-item">
          <div class="timeline-time">${item.time}</div>
          <div>
            <div class="timeline-title">${item.title}</div>
            <div class="timeline-meta">${item.meta}</div>
          </div>
          <span class="severity ${item.status === "Succeeded" ? "GREEN" : "YELLOW"}">${item.status}</span>
        </div>
      `,
    )
    .join("");
}

function renderOpsActions() {
  const list = document.getElementById("ops-action-list");
  if (!list) return;
  list.innerHTML = state.opsActions
    .map(
      (action, index) => `
        <button class="ops-action-card ${index === 0 ? "active" : ""}" data-action-id="${action.id}">
          <div>
            <div class="ops-action-name">${action.name}</div>
            <div class="ops-action-purpose">${action.purpose}</div>
          </div>
          <span class="severity ${action.severity}">${action.severity}</span>
        </button>
      `,
    )
    .join("");

  document.querySelectorAll(".ops-action-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".ops-action-card").forEach((item) => item.classList.remove("active"));
      card.classList.add("active");
      selectOpsAction(card.dataset.actionId);
    });
  });

  selectOpsAction(state.opsActions[0].id);
}

function selectOpsAction(actionId) {
  const action = state.opsActions.find((item) => item.id === actionId);
  if (!action) return;
  document.getElementById("action-severity").className = `severity ${action.severity}`;
  document.getElementById("action-severity").textContent = action.severity === "RED" ? "CAUTION" : "READY";
  document.getElementById("action-title").textContent = action.name;
  document.getElementById("action-description").textContent = action.purpose;
  document.getElementById("action-workflow").textContent = action.workflow;
  document.getElementById("action-target").textContent = action.target;
  document.getElementById("action-inputs").innerHTML = action.inputs.map((item) => `<li>${item}</li>`).join("");
  document.getElementById("action-checklist").innerHTML = action.checklist.map((item) => `<li>${item}</li>`).join("");
  document.getElementById("open-workflow").onclick = () => {
    const url = `${config.workflowBaseUrl.replace(/\/$/, "")}/${action.workflow}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };
}

function buildReport() {
  return {
    generatedAt: new Date().toLocaleString(),
    sourceGeneratedAt: state.generatedAt,
    environment: state.environment,
    status: state.status,
    config,
    events: state.events,
    incidents: state.incidents,
    limits: state.limits,
    recoveryScore: calculateRecoveryScore(getApiUsed()),
  };
}

function eventsToCsv(events) {
  const columns = ["severity", "domain", "check", "title", "count", "detail", "owner"];
  const rows = events.map((event) => columns.map((column) => csvCell(event[column])).join(","));
  return [columns.join(","), ...rows].join("\n");
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadFile(filename, contents, type) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function setLoading(message) {
  const lastRun = document.getElementById("last-run");
  if (message) {
    document.body.dataset.loading = "true";
    lastRun.textContent = message;
  } else {
    document.body.dataset.loading = "false";
  }
}

hydrateConfigForm();
render();
