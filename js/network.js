function renderNetwork() {
  const w = p.wifi;
  document.querySelector("#wifiMode").value = w.mode;
  document.querySelector("#persistent").checked = w.persistent;
  document
    .querySelector("#timeoutWrap")
    .classList.toggle("hidden", w.persistent);
  document.querySelector("#timeout").value =
    w.mode === "station" ? w.timeout : w.apTimeout;
  document.querySelector("#reconnectVar").value = w.reconnectVariable;
  document.querySelector("#resetReconnect").checked = w.resetReconnect;
  document.querySelector("#statusVar").value = w.statusVariable;
  let h = "";
  if (w.mode === "station")
    h =
      field(
        t("network.credentials", "Zugangsdaten"),
        `<select data-w="credentials"><option value="external" ${w.credentials === "external" ? "selected" : ""}>${t("network.externalVariables", "Externe Variablen")}</option><option value="code" ${w.credentials === "code" ? "selected" : ""}>${t("network.inCode", "Im Code")}</option></select>`,
      ) +
      (w.credentials === "external"
        ? field(
            t("network.ssidVariable", "SSID-Variable"),
            `<input data-w="ssidVar" value="${html(w.ssidVar)}">`,
          ) +
          field(
            t("network.passwordVariable", "Passwort-Variable"),
            `<input data-w="passwordVar" value="${html(w.passwordVar)}">`,
          )
        : field(t("network.ssid", "SSID"), `<input data-w="ssid" value="${html(w.ssid)}">`) +
          field(
            t("network.password", "Passwort"),
            `<input data-w="password" type="password" value="${html(w.password)}">`,
          ));
  if (["ap", "captive"].includes(w.mode))
    h =
      field(t("wizard.network.apSsid", "Hotspot-Name"), `<input data-w="apSsid" maxlength="32" required value="${html(w.apSsid)}">`) +
      field(
        t("wizard.network.apPassword", "Hotspot-Passwort"),
        `<input data-w="apPassword" type="password" minlength="8" maxlength="63" required value="${html(w.apPassword)}">`,
      ) +
      (w.mode === "captive"
        ? field(t("wizard.network.ip", "IP-Adresse"), `<input data-w="ip" value="${html(w.ip)}">`)
        : "");
  if (["ap", "captive"].includes(w.mode)) h += field(t("network.channel", "Hotspot-Kanal"), `<input data-w="apChannel" type="number" min="1" max="13" value="${html(w.apChannel)}">`) + field(t("wizard.network.clients", "Max. Clients"), `<input data-w="maxClients" type="number" min="1" max="10" value="${html(w.maxClients)}">`);
  if (w.mode === "captive") h += field(t("wizard.network.dns", "DNS-Port"), `<input data-w="dnsPort" type="number" min="1" max="65535" value="${html(w.dnsPort)}">`);
  document.querySelector("#networkFields").innerHTML = h;
  document.querySelectorAll("[data-w]").forEach(
    (e) =>
      (e.onchange = () => {
        w[e.dataset.w] = e.type === "number" ? Number(e.value) : e.value;
        save({keepProperties: true, keepVars: true, keepNetwork: e.dataset.w !== "credentials", keepExpert: true});
      }),
  );
}
function renderExpert() {
  ["projectName", "title", "hostname", "port", "syncMs"].forEach(
    (k) => (document.querySelector("#" + k).value = p[k]),
  );
  document.querySelector("#auth").checked = p.auth;
  document.querySelector("#authFields").innerHTML = p.auth
    ? field(t("expert.username", "Benutzername"), `<input data-p="username" value="${html(p.username)}">`) +
      field(
        t("network.password", "Passwort"),
        `<input data-p="password" type="password" value="${html(p.password)}">`,
      )
    : "";
  document.querySelectorAll("[data-p]").forEach(
    (e) =>
      (e.onchange = () => {
        p[e.dataset.p] = e.value;
        save({keepProperties: true, keepVars: true, keepNetwork: true, keepExpert: true});
      }),
  );
}
const CPP_KEYWORDS = new Set(("alignas alignof and and_eq asm atomic_cancel atomic_commit atomic_noexcept auto bitand bitor bool break case catch char char8_t char16_t char32_t class compl concept const consteval constexpr constinit const_cast continue co_await co_return co_yield decltype default delete do double dynamic_cast else enum explicit export extern false float for friend goto if inline int long mutable namespace new noexcept not not_eq nullptr operator or or_eq private protected public reflexpr register reinterpret_cast requires return short signed sizeof static static_assert static_cast struct switch synchronized template this thread_local throw true try typedef typeid typename union unsigned using virtual void volatile wchar_t while xor xor_eq").split(" "));
function validCppName(name) {
  return typeof name === "string" && /^[A-Za-z][A-Za-z0-9_]*$/.test(name) && !name.includes("__") && !CPP_KEYWORDS.has(name);
}
function reservedCppNames() {
  return new Set([
    "WebUI", "ESPUI", "WiFi", "String", "Control", "ControlType", "ControlColor", "IPAddress", "DNSServer",
    "setup", "loop", "begin", "refresh", "sender", "type", "Serial", "millis", "strncpy", "fabs",
    "dnsServer", "apIp", "lastSync", "networkStartedAt", "networkStopped", "accessPointStarted",
    ...DT.filter((type) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(type)),
    ...p.variables.map((v) => `cache_${id(v.id)}`),
    ...p.controls.flatMap((c) => [`id_${id(c.id)}`, `cb_${id(c.id)}`]),
    ...p.tabs.map((tab) => `tab_${id(tab.id)}`),
  ]);
}
function validationIssues() {
  const issues = [], w = p.wifi;
  const add = (message, page, field, owner = {}) => issues.push({message, page, field, ...owner});
  const generated = reservedCppNames();
  const symbols = p.variables.map((v) => ({name: v.name, page: 'vars', field: 'name', variableId: v.id}));
  if (w.mode === 'station' && w.credentials === 'external') {
    for (const key of ['ssidVar', 'passwordVar']) symbols.push({name: w[key], page: 'network', field: key});
  }
  if (w.mode !== 'external') {
    for (const key of ['reconnectVariable', 'statusVariable']) if (w[key]) symbols.push({name: w[key], page: 'network', field: key === 'reconnectVariable' ? 'reconnectVar' : 'statusVar'});
  }
  for (const enumType of new Set(p.variables.filter((v) => v.type === 'enum').map((v) => v.enumType))) {
    const v = p.variables.find((v) => v.enumType === enumType && v.type === 'enum');
    symbols.push({name: enumType, page: 'vars', field: 'enumType', variableId: v.id});
  }
  for (const symbol of symbols) {
    if (!validCppName(symbol.name) || generated.has(symbol.name)) add(`Ungültiger oder reservierter C++-Name: ${symbol.name}`, symbol.page, symbol.field, {variableId: symbol.variableId});
    else if (symbols.filter((entry) => entry.name === symbol.name).length > 1) add(`${symbol.name}: Variablen, Netzwerkvariablen und Enum-Typen müssen unterschiedliche Namen haben.`, symbol.page, symbol.field, {variableId: symbol.variableId});
  }
  for (const [label, entries, page] of [['Tab', p.tabs, 'ui'], ['Control', p.controls, 'ui'], ['Variablen', p.variables, 'vars']]) {
    if (entries.some((entry) => typeof entry.id !== 'string' || !entry.id)) add(`${label}-IDs dürfen nicht leer sein.`, page);
    if (new Set(entries.map((entry) => id(entry.id))).size !== entries.length) add(`${label}-IDs kollidieren im erzeugten Code.`, page);
  }
  if (!['external', 'station', 'ap', 'captive'].includes(w.mode)) add('Ungültiger Netzwerkmodus.', 'network', 'wifiMode');
  if (!['external', 'code'].includes(w.credentials)) add('Ungültiger Zugangsdatenmodus.', 'network', 'credentials');
  if (!Number.isInteger(Number(p.port)) || p.port < 1 || p.port > 65535) add('Der Webserver-Port muss zwischen 1 und 65535 liegen.', 'expert', 'port');
  if (!Number.isFinite(Number(p.syncMs)) || p.syncMs < 10) add('Das Sync-Intervall muss mindestens 10 ms betragen.', 'expert', 'syncMs');
  for (const v of p.variables) {
    const error = (message, field) => add(`${v.name}: ${message}`, 'vars', field, {variableId: v.id});
    if (!DT.includes(v.type)) error('Ungültiger Typ.', 'type');
    if (!['read', 'write', 'readwrite'].includes(v.access)) error('Ungültiger Zugriff.', 'access');
    if (v.type === 'char[]' && (!Number.isInteger(v.capacity ?? 64) || (v.capacity ?? 64) < 2 || (v.capacity ?? 64) > 65536)) error('Puffergröße muss zwischen 2 und 65536 liegen.', 'capacity');
    if (['float', 'double'].includes(v.type) && (!Number.isFinite(Number(v.tolerance)) || Number(v.tolerance) < 0)) error('Toleranz muss eine nichtnegative Zahl sein.', 'tolerance');
    if (v.type === 'const char*' && write(v.access)) error('const char* kann nicht beschrieben werden.', 'access');
  }
  for (const c of p.controls) {
    const error = (message, field) => add(`${c.label}: ${message}`, 'ui', field, {controlId: c.id});
    const v = vBy(c);
    if (!COLORS.includes(c.color)) error('Ungültige Farbe.', 'color');
    if (!p.tabs.some((tab) => tab.id === c.tabId)) error('Zugeordnete Seite fehlt.', 'tabId');
    if (c.groupId && !validGroupRoot(c)) error('Das gewählte Set ist nicht mehr gültig.', 'groupId');
    if (c.variableId && !v) error('Zugeordnete Variable fehlt.', 'variableId');
    else if (!['Separator', 'File'].includes(c.type) && v && !variableCompatible(c, v)) error(`${v.type} oder die Zugriffsart passt nicht zu ${c.type}.`, 'variableId');
    else if (componentRule(c.type).required && !v) error(`Für ${c.type} ist eine passende Variable erforderlich.`, 'variableId');
    if (['Slider', 'Number'].includes(c.type) && (!Number.isFinite(Number(c.min)) || !Number.isFinite(Number(c.max)) || Number(c.min) >= Number(c.max))) error('Min muss kleiner als Max sein.', 'min');
    if (['Slider', 'Number'].includes(c.type) && (![c.min, c.max].every((value) => Number.isInteger(Number(value))) || Number(c.min) < -2147483648 || Number(c.max) > 2147483647)) error('Min und Max müssen ganze 32-Bit-Zahlen sein.', 'min');
    if (c.type === 'Select' && !selectOptions(c).length) error('Mindestens eine Option ist erforderlich.', 'options');
  }
  if (w.mode === 'captive' && (!/^\d{1,3}(\.\d{1,3}){3}$/.test(w.ip) || w.ip.split('.').some((part) => Number(part) > 255))) add('Die Portal-IP muss eine IPv4-Adresse sein.', 'network', 'ip');
  if (['ap', 'captive'].includes(w.mode)) {
    const apSsidLength = new TextEncoder().encode(String(w.apSsid || '')).length;
    const apPasswordLength = new TextEncoder().encode(String(w.apPassword || '')).length;
    if (apSsidLength < 1 || apSsidLength > 32) add('Der Hotspot-Name muss 1 bis 32 Byte lang sein.', 'network', 'apSsid');
    if (apPasswordLength < 8 || apPasswordLength > 63) add('Das Hotspot-Passwort muss 8 bis 63 Byte lang sein.', 'network', 'apPassword');
    if (!Number.isInteger(Number(w.apChannel)) || w.apChannel < 1 || w.apChannel > 13) add('Der Hotspot-Kanal muss zwischen 1 und 13 liegen.', 'network', 'apChannel');
    if (!Number.isInteger(Number(w.maxClients)) || w.maxClients < 1 || w.maxClients > 10) add('Die maximale Client-Anzahl muss zwischen 1 und 10 liegen.', 'network', 'maxClients');
  }
  if (w.mode !== 'external' && !w.persistent) {
    const timeout = Number(w.mode === 'station' ? w.timeout : w.apTimeout);
    if (!Number.isInteger(timeout) || timeout < 1 || timeout > 4294967295) add('Timeout muss zwischen 1 und 4294967295 ms liegen.', 'network', 'timeout');
  }
  if (w.mode === 'captive' && (!Number.isInteger(Number(w.dnsPort)) || w.dnsPort < 1 || w.dnsPort > 65535)) add('DNS-Port muss zwischen 1 und 65535 liegen.', 'network', 'dnsPort');
  return issues;
}
function validationErrors() { return validationIssues().map((issue) => issue.message); }
function issueInput(issue) {
  if (issue.controlId) return issue.controlId === selected ? [...document.querySelectorAll('[data-c]')].find((input) => input.dataset.c === issue.field) : null;
  if (issue.variableId) return [...document.querySelectorAll('[data-v]')].find((input) => input.dataset.v === issue.variableId && input.dataset.k === issue.field);
  return document.getElementById(issue.field || '') || [...document.querySelectorAll('[data-w]')].find((input) => input.dataset.w === issue.field);
}
function goToIssue(issue) {
  showPage(issue.page);
  if (issue.controlId) {
    const control = p.controls.find((c) => c.id === issue.controlId);
    if (control) { activeTab = control.tabId; selected = control.id; render(); }
  }
  const input = issueInput(issue);
  input?.focus();
  input?.scrollIntoView({block: 'center', behavior: 'smooth'});
}
function validate() {
  const issues = validationIssues(), notice = document.querySelector('#notice');
  notice.classList.toggle('hidden', !issues.length);
  // Keep the summary compact; each issue links to its exact element and field.
  const wasOpen = notice.querySelector('details')?.open;
  notice.innerHTML = issues.length ? `<details ${wasOpen ? 'open' : ''}><summary>${t('validation.count', '{count} Hinweise – bitte vor dem Export prüfen', {count: issues.length})}</summary><ul>${issues.map((issue, index) => {
    const control = p.controls.find((c) => c.id === issue.controlId);
    const pageName = control ? p.tabs.find((tab) => tab.id === control.tabId)?.name : '';
    const number = control ? p.controls.filter((c) => c.tabId === control.tabId).indexOf(control) + 1 : 0;
    return `<li><span>${html(issue.message)}${control ? ` <small>(${html(pageName)} · #${number})</small>` : ''}</span><button data-issue="${index}">${issue.controlId ? t('validation.toElement', 'Zum Element') : t('validation.toField', 'Zum Feld')}</button></li>`;
  }).join('')}</ul></details>` : '';
  notice.querySelectorAll('[data-issue]').forEach((button) => button.onclick = () => goToIssue(issues[Number(button.dataset.issue)]));
  document.querySelectorAll('[data-validation-error]').forEach((node) => node.remove());
  document.querySelectorAll('[aria-invalid="true"]').forEach((node) => { node.removeAttribute('aria-invalid'); node.removeAttribute('aria-describedby'); });
  issues.forEach((issue, index) => {
    const input = issueInput(issue);
    if (!input || input.getAttribute('aria-invalid') === 'true') return;
    input.setAttribute('aria-invalid', 'true');
    const error = document.createElement('small');
    error.id = `field-error-${index}`;
    error.dataset.validationError = '';
    error.className = 'fieldError';
    error.textContent = issue.message;
    input.setAttribute('aria-describedby', error.id);
    input.closest('label')?.append(error);
  });
  return issues.map((issue) => issue.message);
}
function canExportCode() {
  const issues = validationIssues();
  validate();
  if (!issues.length) return true;
  showActionStatus(t('validation.exportBlocked', 'Bitte zuerst die markierten Felder korrigieren.'), {duration: 0, error: true});
  goToIssue(issues[0]);
  return false;
}
function renderCode() {
  const fs = files();
  if (!fs[currentFile]) currentFile = Object.keys(fs)[0];
  document.querySelector("#files").innerHTML =
    `<h3>${t("files.title", "Dateien")}</h3>` +
    Object.keys(fs)
      .map(
        (x) =>
          `<button data-file="${x}" class="${x === currentFile ? "active" : ""}">${x}</button>`,
      )
      .join("");
  document.querySelectorAll("[data-file]").forEach(
    (e) =>
      (e.onclick = () => {
        currentFile = e.dataset.file;
        renderCode();
      }),
  );
  document.querySelector("#codeName").textContent = currentFile;
  document.querySelector("#codeText").textContent = fs[currentFile];
}
function download(name, text) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    text instanceof Blob ? text : new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  a.download = name;
  a.style.display = "none";
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
