document.querySelector("#nav").onclick = (e) => {
  const x = e.target.dataset.page;
  if (!x) return;
  showPage(x);
};
const COMPONENT_GROUPS = {
  Eingabe: ["Button", "Switch", "Slider", "Number", "Text", "Password", "Date", "Time", "Color", "Select", "Buttonpad"],
  Anzeige: ["Label", "Log", "Graph", "File"],
  Layout: ["Separator"],
};
const COMPONENT_ALIASES = {Button:'Taste Taster Knopf',Switch:'Schalter Ein Aus',Slider:'Regler Schieberegler',Number:'Zahl Nummer',Text:'Text Eingabe',Password:'Passwort',Date:'Datum',Time:'Zeit Uhrzeit',Color:'Farbe',Select:'Auswahl Dropdown',Buttonpad:'Steuerkreuz',Label:'Anzeige Status',Log:'Protokoll',Graph:'Diagramm Kurve',File:'Datei',Separator:'Trennlinie'};
let componentGroupOpen = null;
function filterComponents(query = document.querySelector('#componentSearch').value) {
  query = query.trim().toLocaleLowerCase();
  const groups = [...document.querySelectorAll('.componentGroup')];
  if (query && !componentGroupOpen) componentGroupOpen = groups.map((group) => group.open);
  let found = 0;
  groups.forEach((group, index) => {
    let visible = 0;
    group.querySelectorAll('[data-add]').forEach((button) => {
      const matches = !query || `${button.dataset.add} ${COMPONENT_ALIASES[button.dataset.add]}`.toLocaleLowerCase().includes(query);
      button.hidden = !matches;
      if (matches) { visible++; found++; }
    });
    group.hidden = !visible;
    if (query) group.open = true;
    else if (componentGroupOpen) group.open = componentGroupOpen[index];
  });
  if (!query) componentGroupOpen = null;
  document.querySelector('#noComponents').classList.toggle('hidden', found > 0);
}
function renderComponentPalette() {
  const openGroups = new Set([...document.querySelectorAll('.componentGroup[open]')].map((group) => group.dataset.group));
  const hadGroups = document.querySelectorAll('.componentGroup').length > 0;
  document.querySelector("#components").innerHTML = Object.entries(COMPONENT_GROUPS).map(([name, types]) =>
    `<details data-group="${name}" class="componentGroup" ${!hadGroups || openGroups.has(name) ? 'open' : ''}><summary data-i18n="components.${name}" data-i18n-original="${name}">${t('components.' + name, name)}</summary><div class="components">${types.map((type) => `<button data-add="${type}" title="${html(COMPONENT_ALIASES[type])}"><span aria-hidden="true">＋</span> ${type}</button>`).join('')}</div></details>`).join('');
  document.querySelectorAll("[data-add]").forEach((button) => button.onclick = () => addControl(button.dataset.add));
  filterComponents();
}
document.querySelector('#componentSearch').oninput = (event) => filterComponents(event.target.value);
document.querySelector("#addTab").onclick = addTab;
document.querySelector("#tabManager").ondblclick = (e) => {
  if (e.target.dataset.openTab) {
    activeTab = e.target.dataset.openTab;
    renameActiveTab();
  }
};
function addControl(type) {
      const c = {
          id: newId("c_"),
          type,
          label: type,
          variableId: "",
          tabId: activeTab || p.tabs[0].id,
          color: "Turquoise",
          min: 0,
          max: 100,
          step: 1,
          options: type === "Select" ? "Option 1\nOption 2" : "",
          filePath: "/data.txt",
          staticValue: "Status",
          boolFalseText: "Aus",
          boolTrueText: "Ein",
          buttonText: "Ausführen",
          textMode: "auto",
          groupId: "",
          vertical: false,
          wide: false,
          visible: true,
          enabled: true,
          css: "",
        };
      p.controls.push(c);
      selected = c.id;
      save();
}
renderComponentPalette();
document.querySelector("#addVar").onclick = addVariable;
function renderVariableTypeFilter() {
  const filter = document.querySelector("#variableTypeFilter");
  const selectedType = filter.value;
  filter.innerHTML = `<option value="">${t("vars.allTypes", "Alle Datentypen")}</option>${DT.map((type) => `<option ${type === selectedType ? "selected" : ""}>${html(type)}</option>`).join("")}`;
}
renderVariableTypeFilter();
document.querySelector("#variableSearch").oninput = renderVars;
document.querySelector("#variableTypeFilter").onchange = renderVars;
document.querySelector("#undoProject").onclick = () => undo();
document.querySelector("#redoProject").onclick = () => redo();
document.addEventListener("click", (event) => {
  const menu = document.querySelector(".projectMenu");
  if (menu?.open && !menu.contains(event.target)) menu.open = false;
});
document.addEventListener("keydown", (event) => {
  const editable = event.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName);
  if (editable || document.querySelector('#editorDialog').open) return;
  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && ['z','y'].includes(key)) {
    event.preventDefault();
    if (key === 'y' || event.shiftKey) redo(); else undo();
  }
});
document.querySelector("#wifiMode").onchange = (e) => {
  p.wifi.mode = e.target.value;
  save();
};
document.querySelector("#persistent").onchange = (e) => {
  p.wifi.persistent = e.target.checked;
  document
    .querySelector("#timeoutWrap")
    .classList.toggle("hidden", e.target.checked);
  save();
};
document.querySelector("#timeout").onchange = (e) => {
  p.wifi[p.wifi.mode === "station" ? "timeout" : "apTimeout"] = Number(
    e.target.value,
  );
  save();
};
document.querySelector("#reconnectVar").onchange = (e) => {
  p.wifi.reconnectVariable = e.target.value;
  save();
};
document.querySelector("#resetReconnect").onchange = (e) => {
  p.wifi.resetReconnect = e.target.checked;
  save();
};
document.querySelector("#statusVar").onchange = (e) => {
  p.wifi.statusVariable = e.target.value;
  save();
};
["projectName", "title", "hostname", "port", "syncMs"].forEach(
  (k) =>
    (document.querySelector("#" + k).onchange = (e) => {
      p[k] =
        e.target.type === "number" ? Number(e.target.value) : e.target.value;
      save();
    }),
);
document.querySelector("#auth").onchange = (e) => {
  p.auth = e.target.checked;
  save();
};
document.querySelector("#exportProject").onclick = () =>
  download(`${projectFilename()}.json`, JSON.stringify(p, null, 2));
document.querySelector("#downloadOne").onclick = () => {
  if (!canExportCode()) return;
  download(currentFile, files()[currentFile]);
};
document.querySelector("#copyCode").onclick = async () => {
  if (!canExportCode()) return;
  try {
    await navigator.clipboard.writeText(files()[currentFile]);
    showActionStatus(t("copy.success", "Code kopiert."));
  } catch {
    showActionStatus(t("copy.failed", "Kopieren nicht möglich. Bitte die Datei herunterladen oder den Code manuell kopieren."), {duration: 0, error: true});
  }
};
document.querySelector("#downloadAll").onclick = () => {
  if (!canExportCode()) return;
  download(`${projectFilename()}.zip`, new Blob([zipBytes(files())], {type: 'application/zip'}));
  showActionStatus(t('export.started', 'ZIP-Download gestartet. Enthält Arduino-Dateien und die Projektdatei.'));
};
