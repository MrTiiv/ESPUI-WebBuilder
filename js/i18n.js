const LANGUAGE_STORAGE_KEY = "espui-language";
const SUPPORTED_LANGUAGES = ["de", "en"];

const translations = {
  en: {
    "header.redo": "Redo",
    "action.cancel": "Cancel", "action.apply": "Apply", "action.rename": "Rename", "action.duplicate": "Duplicate", "action.delete": "Delete", "action.copySuffix": "Copy",
    "components.search": "Search components", "components.empty": "No matching components.", "components.Eingabe": "Input", "components.Anzeige": "Display", "components.Layout": "Layout",
    "ui.editMode": "Edit · Click an element",
    "control.up": "Move element up", "control.down": "Move element down", "control.moved": "Element moved.", "control.copied": "Element duplicated. Its variable binding was preserved.", "control.pageChanged": "Element moved. The destination page is now open.",
    "vars.createLinked": "Create and link variable", "vars.editLinked": "Edit variable", "vars.autoLink": "The variable is linked to this element automatically with matching access.", "vars.nameError": "Enter a valid, unused C++ name.", "vars.typeError": "Select a compatible data type.",
    "vars.search": "Search variables", "vars.filterType": "Filter by data type", "vars.allTypes": "All data types", "vars.noResults": "No matching variables.", "vars.usedByOne": "Used by 1 element", "vars.usedByMany": "Used by {count} elements", "vars.unused": "Not used", "vars.deleteNamed": "Delete variable {name}",
    "vars.deleteTitle": "Delete variable", "vars.deleteQuestion": "Delete variable “{name}”?", "vars.deleteUsedOne": "This variable is used by one element. Deleting it removes this link:", "vars.deleteUsedMany": "This variable is used by {count} elements. Deleting it removes these links:", "vars.deleteUnused": "This variable is not used by any element.", "vars.deleteUndo": "You can undo this action afterwards.", "vars.deleted": "Variable deleted.",
    "props.wide": "Full width", "props.wideHelp": "The element uses the full available row in ESPUI.",
    "tabs.actions": "Actions for {name}", "tabs.add": "New page", "tabs.rename": "Rename page", "tabs.delete": "Delete page", "tabs.name": "Page name", "tabs.nameRequired": "Enter a page name.", "tabs.copied": "Page duplicated. Elements still use the same variables.", "tabs.deleteDescription": "Delete “{name}”? Its elements will move to “{target}”. You can undo this afterwards.",
    "validation.count": "{count} issues – check before exporting", "validation.toElement": "Go to element", "validation.toField": "Go to field", "validation.exportBlocked": "Please correct the highlighted fields first.",
    "export.started": "ZIP download started. Includes Arduino files and the project file.", "network.channel": "Hotspot channel",
    "storage.saved": "Saved locally",
    "storage.failed": "Not saved: browser storage unavailable. Please save the project as JSON.",
    "copy.success": "Code copied.",
    "copy.failed": "Copying failed. Please download the file or copy the code manually.",
    "vars.capacity": "Buffer size including terminator",
    "document.title": "ESPUI WebBuilder",
    "wizard.welcome": "Welcome",
    "wizard.project": "Set up project",
    "wizard.wifi": "Choose Wi-Fi",
    "wizard.network": "Network details",
    "wizard.sub.welcome": "Set up your ESP32 web interface in a few steps.",
    "wizard.sub.project": "Define the basic settings for your web interface.",
    "wizard.sub.wifi": "How should your ESP32 be reachable?",
    "wizard.sub.network": "The suggested values can be adjusted.",
    "wizard.back": "Back",
    "wizard.start": "Get started",
    "wizard.next": "Next",
    "wizard.create": "Create project",
    "wizard.cancelled": "New project cancelled. Your previous project is still open.",
    "wizard.createdWith": "This builder was created with",
    "wizard.createdWithTail": "",
    "wizard.codeFor": "The generated Arduino code is designed for",
    "wizard.codeForTail": ".",
    "wizard.local": "The builder works entirely locally in your browser. Projects and Wi-Fi data are not sent to a server. The builder and generated code may contain errors.",
    "wizard.setupHelp": "Tap or point at an i to see a brief explanation of each setting.",
    "wizard.projectName": "Project name",
    "wizard.projectNameHelp": "Internal name for the project file. It has no effect on the Wi-Fi connection or ESP32 address.",
    "wizard.interfaceTitle": "Web interface title",
    "wizard.interfaceTitleHelp": "This text is displayed later as the title of the ESPUI web interface.",
    "wizard.hostnameHelp": "Network name of the ESP32. Depending on the router and device, the web interface may later be available, for example, at espui.local.",
    "wizard.port": "Web server port",
    "wizard.portHelp": "TCP port of the web interface. Port 80 is the normal HTTP standard and does not need to be added in the browser.",
    "wizard.external": "Wi-Fi in main code",
    "wizard.externalHelp": "The builder does not generate Wi-Fi initialization. Your main sketch must connect WiFi itself before WebUI::begin() is called.",
    "wizard.externalDetail": "Builder starts ESPUI only",
    "wizard.station": "Connect to Wi-Fi",
    "wizard.stationHelp": "The ESP32 connects as a client to an existing router or Wi-Fi network.",
    "wizard.stationDetail": "ESP32 as a Wi-Fi client",
    "wizard.hotspot": "Create hotspot",
    "wizard.hotspotHelp": "The ESP32 creates its own Wi-Fi network. Phone or tablet connects directly to this hotspot.",
    "wizard.hotspotDetail": "Direct connection to the ESP32",
    "wizard.captive": "Hotspot + captive portal",
    "wizard.captiveHelp": "Like a hotspot, but DNS requests are also redirected to the ESP32. This opens the portal automatically on many devices.",
    "wizard.captiveDetail": "Automatic portal redirect",
    "wizard.persistent": "Keep connection active permanently",
    "wizard.persistentHelp": "Enabled: Wi-Fi or hotspot remains active. Disabled: The connection is stopped after the timeout and can optionally be restarted with the reconnect bool.",
    "wizard.persistentDetail": "No timeout is needed when a persistent connection is active.",
    "wizard.reconnectHelp": "Name of a global bool variable in the main code. When your main code sets it to true, the configured Wi-Fi connection is restarted. The field may be left empty.",
    "wizard.statusHelp": "Name of a global bool variable in the main code. It is true when the Wi-Fi client is connected or the hotspot is active. The field may be left empty.",
    "wizard.network.external": "The Wi-Fi connection is set up entirely in your main code.",
    "wizard.network.ssid": "Wi-Fi name (SSID)",
    "wizard.network.ssidHelp": "Name of the existing Wi-Fi network the ESP32 should connect to.",
    "wizard.network.password": "Wi-Fi password",
    "wizard.network.passwordHelp": "Password of the existing Wi-Fi network. It is only processed locally in the browser project.",
    "wizard.network.timeout": "Connection timeout in ms",
    "wizard.network.timeoutHelp": "Maximum time for the first connection attempt. 15000 equals 15 seconds.",
    "wizard.network.apSsid": "Hotspot name",
    "wizard.network.apSsidHelp": "Name of the Wi-Fi network created by the ESP32. It appears in the device's Wi-Fi list. Maximum 32 bytes.",
    "wizard.network.apPassword": "Hotspot password",
    "wizard.network.apPasswordHelp": "Password for the Wi-Fi network created by the ESP32. Use 8 to 63 bytes.",
    "wizard.network.ip": "IP address",
    "wizard.network.ipHelp": "Address of the ESP32 in its own hotspot. 192.168.4.1 is the usual ESP32 access-point default.",
    "wizard.network.clients": "Max. clients",
    "wizard.network.clientsHelp": "Maximum number of devices that can connect to the ESP32 hotspot simultaneously.",
    "wizard.network.apTimeout": "Hotspot timeout in milliseconds",
    "wizard.network.apTimeoutHelp": "Time until a temporary hotspot is switched off. 600000 equals 10 minutes. This field is hidden for a persistent connection.",
    "wizard.network.dns": "DNS port",
    "wizard.network.dnsHelp": "Port of the captive-portal DNS server. 53 is the standard and normally should not be changed.",
    "header.uses": "Builder uses",
    "header.created": "Created with Codex",
    "header.new": "New project",
    "header.project": "Project",
    "header.undo": "Undo",
    "header.import": "Import project",
    "header.export": "Export project as JSON",
    "header.download": "Download project as ZIP",
    "nav.variables": "Variables",
    "nav.network": "Network",
    "nav.options": "Options",
    "nav.help": "Help",
    "ui.pages": "Pages",
    "ui.newPage": "+ New page",
    "ui.components": "Components",
    "ui.preview": "ESPUI live preview",
    "ui.previewDetail": "Faithful ESPUI mobile view",
    "ui.previewName": "ESPUI preview",
    "ui.drag": "☷ Drag controls to reorder them within this page",
    "ui.properties": "Properties",
    "ui.selectControl": "Select a control",
    "vars.title": "External variables",
    "vars.description": "Defined in the main code and accessed through extern in the generated code.",
    "vars.add": "+ Variable",
    "network.title": "Network mode",
    "network.mode": "Mode",
    "network.external": "Wi-Fi in main code",
    "network.station": "Connect to Wi-Fi",
    "network.ap": "Wi-Fi hotspot",
    "network.captive": "Hotspot with captive portal",
    "network.control": "Connection control",
    "network.persistent": "Keep active permanently",
    "network.persistentHelp": "When disabled, the connection is stopped after the timeout.",
    "network.timeout": "Timeout in milliseconds",
    "network.optionalHelp": "Reconnect bool and status bool are optional. Both fields may be left empty.",
    "network.reconnect": "Reconnect bool (optional)",
    "network.resetReconnect": "Reset reconnect bool after execution",
    "network.status": "Status bool (optional)",
    "expert.title": "Options",
    "expert.projectName": "Project name",
    "expert.uiTitle": "UI title",
    "expert.port": "ESPUI port",
    "expert.sync": "Sync interval ms",
    "expert.auth": "Enable HTTP authentication",
    "code.copy": "Copy",
    "code.download": "Download file",
    "footer.hosting": "Hosting by",
    "footer.created": "Made with AI",
    "dialog.close": "Close",
    "project.newConfirm": "Start a new project? Export the current project first if needed.",
    "project.invalid": "Invalid project file",
    "tabs.newPrompt": "Name of the new page",
    "tabs.newDefault": "Settings",
    "tabs.renamePrompt": "Page name",
    "tabs.deleteConfirm": "Delete page “{name}”? Assigned controls will be moved to the first remaining page.",
    "network.credentials": "Credentials",
    "network.externalVariables": "External variables",
    "network.inCode": "In code",
    "network.ssidVariable": "SSID variable",
    "network.passwordVariable": "Password variable",
    "network.ssid": "SSID",
    "network.password": "Password",
    "expert.username": "Username",
    "props.noneStatic": "None, static content",
    "props.type": "Type",
    "props.label": "Label",
    "props.variableRequired": "Variable (required)",
    "props.variableOptional": "Variable (optional)",
    "props.selectVariable": "Select a variable",
    "props.page": "Page",
    "props.color": "Color",
    "props.min": "Min",
    "props.max": "Max",
    "props.textUse": "Text usage",
    "props.textAuto": "Automatic from variable access",
    "props.textInput": "Input",
    "props.textOutput": "Output only",
    "props.textOutputHelp": "Output only displays the value, disables the field and creates no callback.",
    "props.group": "Set / shared tile",
    "props.noGroup": "None, separate tile",
    "props.groupHelp": "Groups multiple {type} controls visually in one ESPUI panel. Each control keeps its own variable and function.",
    "props.vertical": "Display vertically in set",
    "props.buttonText": "Button text",
    "props.staticText": "Static display text",
    "props.false": "Text for false",
    "props.true": "Text for true",
    "props.booleanHelp": "The label shows the specified status texts instead of 0 and 1.",
    "props.filePath": "File path in the ESP32 file system",
    "props.options": "Options",
    "props.delete": "Delete control",
    "vars.name": "Name",
    "vars.dataType": "Data type",
    "vars.access": "Access",
    "vars.read": "Read only",
    "vars.write": "Write only",
    "vars.readWrite": "Read/write",
    "vars.tolerance": "Tolerance",
    "preview.set": "Set",
    "preview.static": "static",
    "preview.noVariable": "no variable",
    "preview.input": "Input",
    "preview.output": "Output",
    "preview.empty": "There are no controls on this page yet. Choose a component on the left.",
    "files.title": "Files",
    "validation.unique": "Variable names must be unique.",
    "validation.invalidName": "Invalid variable name: {name}",
    "validation.constWrite": "{name}: const char* cannot be written.",
    "validation.invalidSet": "{name}: The selected set is no longer valid.",
    "validation.incompatible": "{name}: {type} or the access mode does not match {control}.",
    "validation.required": "{name}: A compatible variable is required for {control}.",
    "rule.label": "Optional: static text or a readable variable.",
    "rule.button": "Requires bool and triggers an event when pressed.",
    "rule.switch": "Requires bool for on/off.",
    "rule.slider": "Requires an integer data type within the signed 32-bit range.",
    "rule.number": "Requires an integer data type within the signed 32-bit range.",
    "rule.text": "Can be used as input, output or automatically according to variable access.",
    "rule.password": "Requires String or a writable char array.",
    "rule.date": "The date is transferred as text.",
    "rule.time": "The time is transferred as text.",
    "rule.color": "The color is transferred as text, for example #22d3ee.",
    "rule.select": "Requires a number, enum, String or char array.",
    "rule.buttonpad": "Writes direction and key codes.",
    "rule.separator": "Pure layout element without a variable.",
    "rule.log": "Optional: readable text variable for a status or log output.",
    "rule.file": "Uses a file path instead of a variable.",
    "rule.graph": "Requires a readable numeric measurement.",
  },
};

let language = "de";
try {
  const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (SUPPORTED_LANGUAGES.includes(storedLanguage)) language = storedLanguage;
} catch { /* Browser storage is optional. */ }
let germanHelpMarkup = null;

function helpCard(title, text) {
  return `<div class="helpCard"><h3>${title}</h3><p>${text}</p></div>`;
}

function englishHelpMarkup() {
  return `
    <div class="helpHero">
      <div><span class="helpEyebrow">Quick help</span><h2>ESPUI WebBuilder 2.18.0</h2><p>From an empty project to finished ESP32 code, explained step by step.</p></div>
      <div class="helpIcon" aria-hidden="true">?</div>
    </div>
    <nav class="helpQuickNav" aria-label="Help topics">
      <a href="#helpStart">Getting started</a><a href="#helpBasics">Basics</a><a href="#helpComponents">Components</a><a href="#helpNetwork">Network</a><a href="#helpExport">Export</a><a href="#helpProblems">Troubleshooting</a>
    </nav>
    <section class="helpSection" id="helpStart">
      <h2>Getting started</h2><p class="helpLead">These four steps are enough for your first working project.</p>
      <div class="helpGrid helpSteps">
        <article class="helpCard"><span class="helpStep">1</span><h3>Set up the project</h3><p>Choose the project name, title and network mode in the wizard. You can change everything later under <b>Network</b> and <b>Options</b>.</p></article>
        <article class="helpCard"><span class="helpStep">2</span><h3>Add an element</h3><p>Choose a component on the left. Select it in the preview to edit its label, color, page and other properties.</p></article>
        <article class="helpCard"><span class="helpStep">3</span><h3>Connect a variable</h3><p>Create a matching variable directly in the properties or select an existing one. The builder only shows compatible data types.</p></article>
        <article class="helpCard"><span class="helpStep">4</span><h3>Download the project</h3><p>Resolve all issues first. Then download the ZIP file and add the generated files to your Arduino sketch.</p></article>
      </div>
    </section>
    <section class="helpSection" id="helpBasics">
      <h2>Basics</h2><p class="helpLead">The builder connects visible ESPUI elements to variables in your ESP32 program.</p>
      <div class="helpTerms">
        <article class="helpTerm"><h3>Page</h3><p>Appears as a tab in the generated ESPUI interface.</p></article>
        <article class="helpTerm"><h3>Component</h3><p>A visible element such as a switch, text field, label or graph.</p></article>
        <article class="helpTerm"><h3>Variable</h3><p>Stores the value displayed or changed by a component.</p></article>
        <article class="helpTerm"><h3>Access</h3><p><b>Read</b> displays values, <b>Write</b> accepts input and <b>Read/write</b> supports both.</p></article>
      </div>
      <div class="helpTip"><b>Useful:</b> Several components may use the same variable. Changes are sent to all connected elements automatically.</div>
    </section>
    <section class="helpSection" id="helpComponents">
      <h2>Which component should I use?</h2><p class="helpLead">Similar components are grouped together. The variable list automatically hides incompatible types.</p>
      <div class="helpTableWrap"><table class="helpTable">
        <thead><tr><th>Task</th><th>Components</th><th>Matching variable</th><th>Note</th></tr></thead>
        <tbody>
          <tr><td><b>Control on/off</b></td><td>Button, Switch</td><td>bool</td><td>A Button is active while pressed; a Switch keeps its state.</td></tr>
          <tr><td><b>Set a number</b></td><td>Slider, Number</td><td>32-bit integer</td><td>Min and max must be between −2,147,483,648 and 2,147,483,647.</td></tr>
          <tr><td><b>Enter text</b></td><td>Text, Password, Date, Time, Color</td><td>String or char[]</td><td>Depending on access, Text can also be used as read-only output.</td></tr>
          <tr><td><b>Choose an option</b></td><td>Select, Buttonpad</td><td>Number, enum or text</td><td>Select needs at least one option. One option per line is easiest to read.</td></tr>
          <tr><td><b>Display values</b></td><td>Label, Log, Graph</td><td>Readable variable</td><td>Label shows values, Log prints text lines and Graph plots numeric points.</td></tr>
          <tr><td><b>Content and layout</b></td><td>File, Separator</td><td>No variable</td><td>File displays a file from the ESP32; Separator structures the page.</td></tr>
        </tbody>
      </table></div>
      <details class="helpDisclosure"><summary>Sets and shared panels</summary><div class="helpDisclosureBody"><p>A set combines several components of the same type in one panel. First create the element that provides the heading. Then select it for the other elements under <b>Set / shared panel</b>.</p><p>Button, Switch, Slider and Label are supported. All elements must be on the same page and keep their own variables.</p></div></details>
      <details class="helpDisclosure"><summary>What does the live preview show?</summary><div class="helpDisclosureBody"><p>The preview shows the layout, colors, tabs, panels and input elements in a style close to ESPUI 2.2.4. It is also used to select and reorder elements.</p><p>Live readings, the WebSocket connection and final rendering can only be fully tested on the running ESP32.</p></div></details>
    </section>
    <section class="helpSection" id="helpNetwork">
      <h2>Choose a network mode</h2><p class="helpLead">Choose the mode according to how the ESP32 should be reached.</p>
      <div class="helpGrid">
        <article class="helpCard"><h3>Wi-Fi in main code</h3><p>Your sketch establishes the Wi-Fi connection. Call <code>WebUI::begin()</code> afterwards.</p></article>
        <article class="helpCard"><h3>Connect to Wi-Fi</h3><p>The ESP32 connects as a client to an existing router or Wi-Fi network.</p></article>
        <article class="helpCard"><h3>Create a hotspot</h3><p>The ESP32 creates its own Wi-Fi network. A phone or computer connects directly to it.</p></article>
        <article class="helpCard"><h3>Captive portal</h3><p>Like a hotspot, with DNS redirection added so the interface opens automatically on many devices.</p></article>
      </div>
      <div class="helpTip"><b>Optional:</b> Reconnect and status bools may be empty. If used, they must exist as global bool variables in your main code.</div>
    </section>
    <section class="helpSection" id="helpExport">
      <h2>Export and use the code</h2>
      <ol class="helpChecklist">
        <li><span>1</span><div><b>Resolve issues</b><p>Export stays blocked while required or invalid values remain. Select an issue to jump to its field.</p></div></li>
        <li><span>2</span><div><b>Download the ZIP</b><p>The ZIP contains the Arduino code and a project file as a backup.</p></div></li>
        <li><span>3</span><div><b>Add the files</b><p>Copy <code>WebUI.h</code> and <code>WebUI.cpp</code> into the sketch folder. <code>MainCodeExample.ino</code> shows the required calls.</p></div></li>
        <li><span>4</span><div><b>Test on hardware</b><p>Compile with ESPUI 2.2.4 and test the network, inputs and displays on the ESP32.</p></div></li>
      </ol>
    </section>
    <section class="helpSection" id="helpProblems">
      <h2>Troubleshooting</h2>
      <div class="helpProblemList">
        <article><h3>No variable available</h3><p>The data type or access does not match the component. Use <b>Create and link variable</b> to create a compatible one automatically.</p></article>
        <article><h3>Export is blocked</h3><p>Open the issues above the workspace and resolve the highlighted fields one by one.</p></article>
        <article><h3>An edit was accidental</h3><p>Use <b>Undo</b> in the header or press Ctrl+Z.</p></article>
        <article><h3>Back up a project</h3><p>Export a JSON file from the Project menu. You can import and continue editing it later.</p></article>
      </div>
    </section>`;
}

function t(key, fallback = key, values = {}) {
  const translated = translations[language]?.[key];
  let text = language === "de" || translated === undefined ? fallback : translated;
  Object.entries(values).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, value);
  });
  return text;
}

function applyStaticTranslations() {
  document.documentElement.lang = language;
  document.title = t("document.title", "ESPUI WebBuilder");
  const help = document.querySelector("#help");
  if (help && !germanHelpMarkup) germanHelpMarkup = help.innerHTML;
  if (help) help.innerHTML = language === "en" ? englishHelpMarkup() : germanHelpMarkup;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    if (!element.dataset.i18nOriginal)
      element.dataset.i18nOriginal = element.textContent.trim();
    element.textContent = t(element.dataset.i18n, element.dataset.i18nOriginal);
  });
  const codeForParagraph = document.querySelector(
    '.wizardPage[data-step="0"] p:nth-of-type(2)',
  );
  const codeForText = Array.from(codeForParagraph?.childNodes || []).find(
    (node) =>
      node.nodeType === Node.TEXT_NODE &&
      (node.textContent.includes("Der erzeugte Arduino-Code") ||
        node.textContent.includes("The generated Arduino code")),
  );
  if (codeForText)
    codeForText.textContent = ` ${t("wizard.codeFor", "Der erzeugte Arduino-Code ist für")} `;
  const replaceDirectText = (selector, key, fallback) => {
    document.querySelectorAll(selector).forEach((element) => {
      const textNode = Array.from(element.childNodes).find(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
      );
      if (textNode) textNode.textContent = ` ${t(key, fallback)} `;
    });
  };
  const replaceTextContent = (selector, key, fallback) => {
    document.querySelectorAll(selector).forEach(
      (element) => (element.textContent = t(key, fallback)),
    );
  };
  const projectFields = document.querySelectorAll(
    '.wizardPage[data-step="1"] .fieldTitle',
  );
  [
    ["wizard.projectName", "Projektname"],
    ["wizard.interfaceTitle", "Titel des Webinterfaces"],
    ["wizard.hostname", "Hostname"],
    ["wizard.port", "Webserver-Port"],
  ].forEach(([key, fallback], index) => {
    const field = projectFields[index];
    if (!field) return;
    const textNode = Array.from(field.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
    );
    if (textNode) textNode.textContent = ` ${t(key, fallback)} `;
  });
  [
    ["wizard.projectNameHelp", "Interner Name für die Projektdatei. Dieser Name hat keinen Einfluss auf die WLAN-Verbindung oder die Adresse des ESP32."],
    ["wizard.interfaceTitleHelp", "Dieser Text wird später als Überschrift im ESPUI-Webinterface angezeigt."],
    ["wizard.hostnameHelp", "Netzwerkname des ESP32. Je nach Router und Gerät kann das Webinterface später zum Beispiel über espui.local erreichbar sein."],
    ["wizard.portHelp", "TCP-Port des Webinterfaces. Port 80 ist der normale HTTP-Standard und muss im Browser nicht extra angegeben werden."],
  ].forEach(([key, fallback], index) => {
    const bubble = document.querySelectorAll(
      '.wizardPage[data-step="1"] .infoBubble',
    )[index];
    if (bubble) bubble.textContent = t(key, fallback);
  });
  [
    ["wizard.external", "WLAN im Hauptcode"],
    ["wizard.station", "Mit WLAN verbinden"],
    ["wizard.hotspot", "Hotspot erstellen"],
    ["wizard.captive", "Hotspot + Captive Portal"],
  ].forEach(([key, fallback], index) => {
    const title = document.querySelectorAll(
      '.wizardPage[data-step="2"] .choiceTitle',
    )[index];
    const detail = document.querySelectorAll(
      '.wizardPage[data-step="2"] .choiceText small',
    )[index];
    const detailKeys = [
      ["wizard.externalDetail", "Builder startet nur ESPUI"],
      ["wizard.stationDetail", "ESP32 als WLAN-Client"],
      ["wizard.hotspotDetail", "Direkte Verbindung zum ESP32"],
      ["wizard.captiveDetail", "Automatische Portal-Weiterleitung"],
    ];
    if (title) {
      const textNode = Array.from(title.childNodes).find(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
      );
      if (textNode) textNode.textContent = ` ${t(key, fallback)} `;
    }
    if (detail)
      detail.textContent = t(detailKeys[index][0], detailKeys[index][1]);
  });
  [
    ["wizard.externalHelp", "Der Builder erzeugt keine WLAN-Initialisierung. Dein Hauptsketch muss WiFi selbst verbinden, bevor WebUI::begin() aufgerufen wird."],
    ["wizard.stationHelp", "Der ESP32 verbindet sich als Client mit einem vorhandenen Router oder WLAN."],
    ["wizard.hotspotHelp", "Der ESP32 erstellt ein eigenes WLAN. Handy oder Tablet verbinden sich direkt mit diesem Hotspot."],
    ["wizard.captiveHelp", "Wie ein Hotspot, zusätzlich werden DNS-Anfragen zum ESP32 umgeleitet. Dadurch öffnet sich das Portal auf vielen Geräten automatisch."],
  ].forEach(([key, fallback], index) => {
    const bubble = document.querySelectorAll(
      '.wizardPage[data-step="2"] .infoBubble',
    )[index];
    if (bubble) bubble.textContent = t(key, fallback);
  });
  replaceDirectText(
    '.wizardPage[data-step="3"] .checkRowTextTitle',
    "wizard.persistent",
    "Verbindung dauerhaft aktiv halten",
  );
  replaceTextContent(
    '.wizardPage[data-step="3"] .checkRowText small',
    "wizard.persistentDetail",
    "Bei aktiver Dauerverbindung wird kein Timeout benötigt.",
  );
  replaceTextContent(
    '.wizardPage[data-step="3"] .help',
    "network.optionalHelp",
    "Reconnect-Bool und Status-Bool sind optional. Beide Felder dürfen leer bleiben.",
  );
  [
    ["network.reconnect", "Reconnect-Bool (optional)"],
    ["network.status", "Status-Bool (optional)"],
  ].forEach(([key, fallback], index) => {
    const field = document.querySelectorAll(
      '.wizardPage[data-step="3"] .fieldTitle',
    )[index];
    if (!field) return;
    const textNode = Array.from(field.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
    );
    if (textNode) textNode.textContent = ` ${t(key, fallback)} `;
  });
  [
    ["wizard.persistentHelp", "Aktiv: WLAN oder Hotspot bleibt eingeschaltet. Deaktiviert: Die Verbindung wird nach dem eingestellten Timeout beendet und kann optional über den Reconnect-Bool erneut gestartet werden."],
    ["wizard.reconnectHelp", "Name einer globalen bool-Variable im Hauptcode. Setzt dein Hauptcode diese Variable auf true, wird die konfigurierte WLAN-Verbindung neu gestartet. Das Feld kann leer bleiben."],
    ["wizard.statusHelp", "Name einer globalen bool-Variable im Hauptcode. Wird beim WLAN-Client true, wenn die Verbindung aufgebaut ist, und beim WLAN-Hotspot, wenn der Hotspot aktiv ist. Das Feld darf leer bleiben."],
  ].forEach(([key, fallback], index) => {
    const bubble = document.querySelectorAll(
      '.wizardPage[data-step="3"] .infoBubble',
    )[index];
    if (bubble) bubble.textContent = t(key, fallback);
  });
}

function setLanguage(nextLanguage) {
  if (!SUPPORTED_LANGUAGES.includes(nextLanguage)) return;
  language = nextLanguage;
  try { localStorage.setItem(LANGUAGE_STORAGE_KEY, language); } catch { /* Keep the session preference. */ }
  applyStaticTranslations();
  document.querySelectorAll("[data-language-select]").forEach((select) =>
    (select.value = language),
  );
  if (typeof updateWizard === "function") updateWizard();
  if (typeof renderComponentPalette === "function") renderComponentPalette();
  if (typeof renderVariableTypeFilter === "function") renderVariableTypeFilter();
  if (typeof render === "function") render();
}

document.querySelectorAll("[data-language-select]").forEach((select) => {
  select.value = language;
  select.addEventListener("change", (event) => setLanguage(event.target.value));
});
applyStaticTranslations();
