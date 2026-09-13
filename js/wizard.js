let wizardStep = 0;
let wizardNetworkDraft = null;
let wizardRestoreState = null;
function captureWizardNetwork() {
  if (!wizardNetworkDraft) return;
  const fields = { wizSsid: "ssid", wizWifiPass: "password", wizTimeout: "timeout", wizApSsid: "apSsid", wizApPass: "apPassword", wizIp: "ip", wizClients: "maxClients", wizApTimeout: "apTimeout", wizDns: "dnsPort" };
  for (const [elementId, key] of Object.entries(fields)) {
    const input = document.querySelector("#" + elementId);
    if (input) wizardNetworkDraft[key] = input.value;
  }
}
const wizTitles = [
  () => t("wizard.welcome", "Willkommen"),
  () => t("wizard.project", "Projekt einrichten"),
  () => t("wizard.wifi", "WLAN auswählen"),
  () => t("wizard.network", "Netzwerkdetails"),
];
const wizSubs = [
  () => t("wizard.sub.welcome", "Dieser Builder wurde mit Codex erstellt."),
  () => t("wizard.sub.project", "Lege die Grundeinstellungen für dein Webinterface fest."),
  () => t("wizard.sub.wifi", "Wie soll dein ESP32 erreichbar sein?"),
  () => t("wizard.sub.network", "Die Werte sind vorbelegt und können angepasst werden."),
];
function updateWizardTimeout() {
  document
    .querySelectorAll(".wizTimeoutField")
    .forEach((e) =>
      e.classList.toggle(
        "hidden",
        document.querySelector("#wizPersistent").checked,
      ),
    );
}
function wizardMode() {
  return document.querySelector('input[name="wizMode"]:checked')?.value || "ap";
}
function tip(text) {
  return `<button type="button" class="infoTip" aria-label="${t("nav.help", "Hilfe")}" aria-expanded="false">i<span class="infoBubble" role="tooltip">${text}</span></button>`;
}
function tipLabel(text, help) {
  return `<span class="fieldTitle">${text}${tip(help)}</span>`;
}
function renderWizardNetwork() {
  captureWizardNetwork();
  const mode = wizardMode(),
    w = wizardNetworkDraft || p.wifi,
    box = document.querySelector("#wizNetworkDetails");
  if (mode === "external") {
    box.innerHTML =
      `<div class="empty">${t("wizard.network.external", "Die WLAN-Verbindung wird vollständig in deinem Hauptcode aufgebaut.")}</div>`;
    return;
  }
  if (mode === "station") {
    box.innerHTML = `<div class="row"><label>${tipLabel(t("wizard.network.ssid", "WLAN-Name (SSID)"), t("wizard.network.ssidHelp", "Name des vorhandenen WLANs, mit dem sich der ESP32 verbinden soll."))}<input id="wizSsid" value="${html(w.ssid ?? "MeinWLAN")}"></label><label>${tipLabel(t("wizard.network.password", "WLAN-Passwort"), t("wizard.network.passwordHelp", "Passwort des vorhandenen WLANs. Der Wert wird nur lokal im Browserprojekt verarbeitet."))}<input id="wizWifiPass" type="password" value="${html(w.password ?? "")}"></label></div><label class="wizTimeoutField">${tipLabel(t("wizard.network.timeout", "Verbindungs-Timeout ms"), t("wizard.network.timeoutHelp", "Maximale Zeit für den ersten Verbindungsversuch. 15000 entspricht 15 Sekunden."))}<input id="wizTimeout" type="number" value="${html(w.timeout ?? 15000)}"></label>`;
    return;
  }
  box.innerHTML = `<div class="row"><label>${tipLabel(t("wizard.network.apSsid", "Hotspot-Name"), t("wizard.network.apSsidHelp", "Name des WLANs, das der ESP32 selbst erstellt. Dieser Name erscheint auf dem Handy in der WLAN-Liste. Maximal 32 Byte."))}<input id="wizApSsid" maxlength="32" required value="${html(w.apSsid ?? "ESPUI")}"></label><label>${tipLabel(t("wizard.network.apPassword", "Hotspot-Passwort"), t("wizard.network.apPasswordHelp", "Passwort für das vom ESP32 erstellte WLAN. Verwende 8 bis 63 Byte."))}<input id="wizApPass" type="password" minlength="8" maxlength="63" required value="${html(w.apPassword ?? "espui123")}"></label></div><div class="row"><label>${tipLabel(t("wizard.network.ip", "IP-Adresse"), t("wizard.network.ipHelp", "Adresse des ESP32 im eigenen Hotspot. Der Standard 192.168.4.1 ist für ESP32-Access-Points üblich."))}<input id="wizIp" value="${html(w.ip ?? "192.168.4.1")}"></label><label>${tipLabel(t("wizard.network.clients", "Max. Clients"), t("wizard.network.clientsHelp", "Maximale Anzahl Geräte, die gleichzeitig mit dem ESP32-Hotspot verbunden sein dürfen."))}<input id="wizClients" type="number" min="1" max="10" value="${html(w.maxClients ?? 4)}"></label></div><label class="wizTimeoutField">${tipLabel(t("wizard.network.apTimeout", "Hotspot-Timeout in Millisekunden"), t("wizard.network.apTimeoutHelp", "Zeit bis ein temporärer Hotspot abgeschaltet wird. 600000 entspricht 10 Minuten. Bei dauerhafter Verbindung wird dieses Feld ausgeblendet."))}<input id="wizApTimeout" type="number" min="1000" value="${html(w.apTimeout ?? 600000)}"></label>${mode === "captive" ? `<label>${tipLabel(t("wizard.network.dns", "DNS-Port"), t("wizard.network.dnsHelp", "Port des Captive-Portal-DNS-Servers. 53 ist der Standard und sollte normalerweise nicht geändert werden."))}<input id="wizDns" type="number" value="${html(w.dnsPort ?? 53)}"></label>` : ""}`;
}
function showWizard(fresh = false) {
  if (fresh) {
    wizardRestoreState = {project: clone(p), selected, activeTab};
    p = clone(defaults);
    selected = p.controls[0]?.id || null;
    activeTab = p.tabs[0]?.id || null;
  } else wizardRestoreState = null;
  wizardNetworkDraft = clone(p.wifi);
  document.querySelector("#wizNetworkDetails").innerHTML = "";
  wizardStep = 0;
  document.querySelector("#wizProjectName").value = p.projectName;
  document.querySelector("#wizTitle").value = p.title;
  document.querySelector("#wizHostname").value = p.hostname;
  document.querySelector("#wizPort").value = p.port;
  const radio = document.querySelector(
    `input[name="wizMode"][value="${p.wifi.mode || "ap"}"]`,
  );
  if (radio) radio.checked = true;
  document.querySelector("#wizPersistent").checked = p.wifi.persistent;
  document.querySelector("#wizReconnect").value =
    p.wifi.reconnectVariable || "";
  document.querySelector("#wizStatus").value = p.wifi.statusVariable || "";
  renderWizardNetwork();
  updateWizardTimeout();
  updateWizard();
  document.querySelector("#wizCancel").classList.toggle("hidden", !wizardRestoreState);
  document.querySelector("#setupModal").classList.remove("hidden");
}
function cancelWizard() {
  if (!wizardRestoreState) return;
  p = wizardRestoreState.project;
  selected = wizardRestoreState.selected;
  activeTab = wizardRestoreState.activeTab;
  wizardRestoreState = null;
  wizardNetworkDraft = null;
  document.querySelector("#setupModal").classList.add("hidden");
  render();
  showActionStatus(t("wizard.cancelled", "Neues Projekt abgebrochen. Das bisherige Projekt ist weiterhin geöffnet."));
}
function updateWizard() {
  document
    .querySelectorAll(".wizardPage")
    .forEach((e, i) => e.classList.toggle("active", i === wizardStep));
  document
    .querySelectorAll(".stepDot")
    .forEach((e, i) => e.classList.toggle("active", i <= wizardStep));
  document.querySelector("#wizardTitle").textContent = wizTitles[wizardStep]();
  document.querySelector("#wizardSubtitle").textContent = wizSubs[wizardStep]();
  document
    .querySelector("#wizBack")
    .classList.toggle("hidden", wizardStep === 0);
  document.querySelector("#wizBack").textContent = t("wizard.back", "Zurück");
  document.querySelector("#wizNext").textContent =
    wizardStep === 0
      ? t("wizard.start", "Los geht's")
      : wizardStep === 3
        ? t("wizard.create", "Projekt erstellen")
        : t("wizard.next", "Weiter");
}
function finishWizard() {
  const w = p.wifi,
    mode = wizardMode();
  p.projectName =
    document.querySelector("#wizProjectName").value.trim() ||
    "Mein ESPUI Projekt";
  p.title =
    document.querySelector("#wizTitle").value.trim() || "ESP32 Steuerung";
  p.hostname = document.querySelector("#wizHostname").value.trim() || "espui";
  p.port = Math.max(
    1,
    Math.min(65535, Number(document.querySelector("#wizPort").value) || 80),
  );
  w.mode = mode;
  w.persistent = document.querySelector("#wizPersistent").checked;
  w.reconnectVariable =
    mode === "external"
      ? ""
      : document.querySelector("#wizReconnect").value.trim();
  w.statusVariable =
    mode === "external"
      ? ""
      : document.querySelector("#wizStatus").value.trim();
  if (mode === "station") {
    w.credentials = "code";
    w.ssid = document.querySelector("#wizSsid").value;
    w.password = document.querySelector("#wizWifiPass").value;
    w.timeout = Number(document.querySelector("#wizTimeout").value) || 15000;
  } else if (mode === "ap" || mode === "captive") {
    w.apSsid = document.querySelector("#wizApSsid").value || "ESPUI";
    w.apPassword = document.querySelector("#wizApPass").value || "espui123";
    w.ip = document.querySelector("#wizIp").value || "192.168.4.1";
    w.apChannel = 1;
    w.maxClients = Number(document.querySelector("#wizClients").value) || 4;
    w.apTimeout = Math.max(
      1000,
      Number(document.querySelector("#wizApTimeout").value) || 600000,
    );
    if (mode === "captive")
      w.dnsPort = Number(document.querySelector("#wizDns").value) || 53;
  }
  p.setupComplete = true;
  document.querySelector("#setupModal").classList.add("hidden");
  wizardRestoreState = null;
  save();
}
document.querySelectorAll('input[name="wizMode"]').forEach(
  (e) =>
    (e.onchange = () => {
      renderWizardNetwork();
      updateWizardTimeout();
    }),
);
document.querySelector("#wizPersistent").onchange = updateWizardTimeout;
document.querySelector("#wizBack").onclick = () => {
  wizardStep = Math.max(0, wizardStep - 1);
  updateWizard();
};
document.querySelector("#wizCancel").onclick = cancelWizard;
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !document.querySelector("#setupModal").classList.contains("hidden") && wizardRestoreState) cancelWizard();
});
document.querySelector("#wizNext").onclick = () => {
  if (wizardStep === 3) {
    finishWizard();
    return;
  }
  wizardStep++;
  if (wizardStep === 3) {
    renderWizardNetwork();
    updateWizardTimeout();
  }
  updateWizard();
};
document.querySelector("#newProject").onclick = () => {
  if (
    confirm(
      t("project.newConfirm", "Ein neues Projekt beginnen? Das aktuelle Projekt vorher bei Bedarf exportieren."),
    )
  )
    showWizard(true);
};

document.querySelector("#importFile").onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 1024 * 1024) {
    alert("Projektdatei ist zu groß (maximal 1 MB).");
    e.target.value = "";
    return;
  }
  const r = new FileReader();
  r.onload = () => {
    const previous = p;
    try {
      p = normalize(JSON.parse(r.result));
      const errors = validationErrors();
      if (errors.length) throw new Error(errors.join("\n"));
      p.setupComplete = true;
      selected = p.controls[0]?.id;
      activeTab = p.tabs[0]?.id || null;
      save();
    } catch (error) {
      p = previous;
      render();
      alert(`${t("project.invalid", "Ungültige Projektdatei")}\n\n${error.message || ""}`);
    }
    e.target.value = "";
  };
  r.readAsText(file);
};
render();
if (!p.setupComplete) setTimeout(() => showWizard(false), 50);
