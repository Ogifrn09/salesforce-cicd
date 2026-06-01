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

let state = structuredClone(demoData);

const views = document.querySelectorAll(".view");
const navItems = document.querySelectorAll(".nav-item");

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

document.getElementById("health-file").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  const parsed = JSON.parse(text);
  state = normalizeImportedData(parsed);
  render();
});

document.getElementById("csv-file").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  const objectName = file.name.replace(/\.csv$/i, "");
  state.businessData[objectName] = parseCsv(text);
  renderBusinessOptions(objectName);
  renderBusinessData(objectName);
  document.querySelector('[data-view="business"]').click();
});

document.getElementById("business-object-select").addEventListener("change", (event) => {
  renderBusinessData(event.target.value);
});

function normalizeImportedData(data) {
  if (Array.isArray(data)) {
    return {
      ...demoData,
      generatedAt: new Date().toLocaleString(),
      status: deriveStatus(data),
      events: data.map((event) => ({
        severity: event.status || event.severity || "GREEN",
        domain: event.domain || "Salesforce",
        check: event.check || event.checkName || "custom_check",
        title: event.title || event.message || event.check || "Imported health event",
        count: Number(event.count || 0),
        detail: event.detail || event.message || "Imported from health-events JSON.",
      })),
    };
  }

  return {
    ...demoData,
    ...data,
    status: data.status || deriveStatus(data.events || []),
    events: data.events || demoData.events,
    limits: data.limits || demoData.limits,
  };
}

function deriveStatus(events) {
  if (events.some((event) => ["RED", "CRITICAL"].includes(event.status || event.severity))) {
    return "RED";
  }
  if (events.some((event) => ["YELLOW", "WARNING"].includes(event.status || event.severity))) {
    return "YELLOW";
  }
  return "GREEN";
}

function render() {
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
  document.getElementById("critical-count").textContent = criticalCount;
  document.getElementById("warning-count").textContent = warningCount;
  document.getElementById("api-used").textContent = `${apiUsed}%`;
  document.getElementById("event-total").textContent = `${state.events.length} events`;

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

function renderEvents() {
  const list = document.getElementById("event-list");
  list.innerHTML = state.events
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
      const action =
        event.domain === "Product"
          ? "Review product master data and update ProductCode or mark invalid products inactive."
          : event.domain === "Opportunity"
            ? "Ask Sales Ops to update stale opportunities or close invalid records."
            : "Open an operational review and attach the latest health report.";
      return { title: event.title, action };
    });

  const rows = recommendations.length
    ? recommendations
    : [{ title: "No action required", action: "Continue scheduled monitoring and backup checks." }];

  document.getElementById("recommendations").innerHTML = rows
    .map(
      (item) => `
        <div class="recommendation">
          <strong>${item.title}</strong>
          <span>${item.action}</span>
        </div>
      `,
    )
    .join("");
}

function renderDomains() {
  const domains = ["Product", "Opportunity", "Apex", "Security"];
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
    const status = limit.max && limit.remaining / limit.max < 0.1 ? "RED" : limit.remaining / limit.max < 0.2 ? "YELLOW" : "GREEN";
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
  document.getElementById("incident-table").innerHTML = `
    <table>
      <thead><tr><th>ID</th><th>Severity</th><th>Title</th><th>Owner</th><th>Status</th></tr></thead>
      <tbody>
        ${state.incidents
          .map(
            (incident) => `
              <tr>
                <td>${incident.id}</td>
                <td><span class="severity ${incident.severity}">${incident.severity}</span></td>
                <td>${incident.title}</td>
                <td>${incident.owner}</td>
                <td>${incident.status}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
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
    const url = `https://github.com/Ogifrn09/salesforce-cicd/actions/workflows/${action.workflow}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };
}

render();
