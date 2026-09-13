function toleranceRelevant(type) {
  return type === "float" || type === "double";
}
function field(label, html) {
  return `<label><span>${label}</span>${html}</label>`;
}
function previewControlBody(c) {
  if (c.type === "Label") return `<div class="espuiValueLabel">${html(vBy(c)?.type === "bool" ? c.boolFalseText || "Aus" : vBy(c) ? vBy(c).name : c.staticValue || c.label)}</div>`;
  if (c.type === "Slider") return `<input aria-label="${html(c.label)}" disabled type="range" min="${html(c.min)}" max="${html(c.max)}">`;
  if (c.type === "Switch") return '<div class="espuiSwitch" aria-hidden="true"><i></i></div>';
  if (c.type === "Button") return `<button type="button" class="espuiButton" disabled>${html(c.buttonText || c.label || "Ausführen")}</button>`;
  if (["Text", "Number", "Password", "Date", "Time", "Color"].includes(c.type)) return `<input disabled type="${c.type === "Password" ? "password" : c.type.toLowerCase()}" placeholder="${textOutput(c, vBy(c) || {}) ? t("preview.output", "Ausgabe") : t("preview.input", "Eingabe")}">`;
  if (c.type === "Select") return `<select disabled><option>${html(selectOptions(c)[0] || "Option")}</option></select>`;
  if (c.type === "Separator") return '<hr class="espuiSeparator">';
  if (c.type === "Graph") return '<div class="espuiGraph"></div>';
  return "";
}
function previewControlMarkup(c) {
  return `<div class="control ${c.wide ? "wide" : ""} ${selected === c.id ? "selected" : ""} ${validGroupRoot(c) ? "espuiSetMember" : ""}" data-espui-color="${html(c.color)}" role="group" aria-label="${html(c.label)}" data-select="${html(c.id)}" tabindex="0" data-drag-id="${html(c.id)}" draggable="true"><small><span class="dragHandle" title="${t("ui.drag", "Verschieben")}">⠿</span>${c.type}${validGroupRoot(c) ? " · " + t("preview.set", "Set") + ": " + html(p.controls.find((x) => x.id === c.groupId)?.label || "") : ""} · ${html(vBy(c)?.name) || (c.type === "Label" ? t("preview.static", "statisch") : t("preview.noVariable", "ohne Variable"))}</small><b style="display:block;margin-top:8px">${html(c.label)}</b>${previewControlBody(c)}</div>`;
}
function render(options = {}) {
  const focused = captureEditorFocus();
  document.querySelector("#undoProject").disabled = !undoStack.length;
  document.querySelector("#redoProject").disabled = !redoStack.length;
  document.querySelector("#previewTitle").textContent = p.title;
  if (!p.tabs.some((t) => t.id === activeTab))
    activeTab = p.tabs[0]?.id || null;
  document.querySelector("#previewTabs").innerHTML = p.tabs
    .map(
      (t) =>
        `<button data-tabview="${html(t.id)}" class="${t.id === activeTab ? "active" : ""}">${html(t.name)}</button>`,
    )
    .join("");
  document.querySelectorAll("[data-tabview]").forEach(
    (e) =>
      (e.onclick = () => {
        activeTab = e.dataset.tabview;
        selected = null;
        render();
      }),
  );
  renderTabManager();
  const visibleControls = p.controls.filter((c) => c.tabId === activeTab);
  document.querySelector("#previewControls").innerHTML = visibleControls.length
    ? visibleControls.map(previewControlMarkup).join("")
    : `<div class="empty wide">${t("preview.empty", "Auf dieser Seite gibt es noch keine Controls. Wähle links eine Komponente aus.")}</div>`;
  document.querySelectorAll("[data-select]").forEach(
    (e) =>
      (e.onclick = () => {
        if (draggingControl) return;
        selectControl(e.dataset.select);
      }),
  );
  document.querySelectorAll("[data-select]").forEach((card) => {
    card.onkeydown = (event) => {
      if (event.target !== card || !["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      selectControl(card.dataset.select);
    };
  });
  bindControlDragDrop();
  if (!options.keepProperties) renderProps();
  if (!options.keepVars) renderVars();
  if (!options.keepNetwork) renderNetwork();
  if (!options.keepExpert) renderExpert();
  validate();
  renderCode();
  restoreEditorFocus(focused);
}
let draggingControl = null;
let dragDropCommitted = false;
function reorderControl(sourceId, targetId, after) {
  if (!sourceId || !targetId || sourceId === targetId) return false;
  const source = p.controls.find((c) => c.id === sourceId),
    target = p.controls.find((c) => c.id === targetId);
  if (
    !source ||
    !target ||
    source.tabId !== activeTab ||
    target.tabId !== activeTab
  )
    return false;
  const active = p.controls.filter(
    (c) => c.tabId === activeTab && c.id !== sourceId,
  );
  let targetIndex = active.findIndex((c) => c.id === targetId);
  if (targetIndex < 0) return false;
  if (after) targetIndex++;
  active.splice(targetIndex, 0, source);
  let ai = 0;
  p.controls = p.controls.map((c) =>
    c.tabId === activeTab ? active[ai++] : c,
  );
  return true;
}
function clearDropMarkers() {
  document
    .querySelectorAll(".control.dropBefore,.control.dropAfter")
    .forEach((e) => e.classList.remove("dropBefore", "dropAfter"));
}
function bindControlDragDrop() {
  document.querySelectorAll("[data-drag-id]").forEach((card) => {
    card.addEventListener("dragstart", (e) => {
      draggingControl = card.dataset.dragId;
      dragDropCommitted = false;
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", draggingControl);
    });
    card.addEventListener("dragover", (e) => {
      if (!draggingControl || draggingControl === card.dataset.dragId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      clearDropMarkers();
      const r = card.getBoundingClientRect(),
        after = e.clientY > r.top + r.height / 2;
      card.classList.add(after ? "dropAfter" : "dropBefore");
    });
    card.addEventListener("dragleave", (e) => {
      if (!card.contains(e.relatedTarget))
        card.classList.remove("dropBefore", "dropAfter");
    });
    card.addEventListener("drop", (e) => {
      e.preventDefault();
      const r = card.getBoundingClientRect(),
        after = e.clientY > r.top + r.height / 2;
      if (reorderControl(draggingControl, card.dataset.dragId, after)) {
        dragDropCommitted = true;
        save();
      }
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      clearDropMarkers();
      setTimeout(() => {
        draggingControl = null;
        dragDropCommitted = false;
      }, 0);
    });
  });
}
function renderTabManager() {
  document.querySelector("#tabManager").innerHTML = p.tabs.map((tab) =>
    `<div class="tabRow"><button data-open-tab="${html(tab.id)}" class="${tab.id === activeTab ? "primary" : ""}">${html(tab.name)}</button><details class="pageMenu"><summary aria-label="${html(t("tabs.actions", "Aktionen für {name}", {name: tab.name}))}">⋯</summary><div class="pageActions"><button data-rename-tab="${html(tab.id)}">${t("action.rename", "Umbenennen")}</button><button data-duplicate-tab="${html(tab.id)}">${t("action.duplicate", "Duplizieren")}</button><button data-delete-tab="${html(tab.id)}" class="danger" ${p.tabs.length === 1 ? "disabled" : ""}>${t("action.delete", "Löschen")}</button></div></details></div>`).join("");
  document.querySelectorAll("[data-open-tab]").forEach((button) => button.onclick = () => {
    if (activeTab === button.dataset.openTab) return;
    activeTab = button.dataset.openTab;
    selected = null;
    render();
  });
  document.querySelectorAll("[data-rename-tab]").forEach((button) => button.onclick = () => renameTab(button.dataset.renameTab));
  document.querySelectorAll("[data-duplicate-tab]").forEach((button) => button.onclick = () => duplicateTab(button.dataset.duplicateTab));
  document.querySelectorAll("[data-delete-tab]").forEach((button) => button.onclick = () => deleteTab(button.dataset.deleteTab));
}
function addTab() {
  editName(t("tabs.add", "Neue Seite"), t("tabs.newDefault", "Einstellungen"), (name) => {
    const tab = {id: newId("tab_"), name};
    p.tabs.push(tab);
    activeTab = tab.id;
    selected = null;
    save();
  });
}
function renameActiveTab() { renameTab(activeTab); }
function renderProps() {
  const c = p.controls.find((x) => x.id === selected),
    el = document.querySelector("#properties");
  if (!c) {
    el.innerHTML = `<span style="color:var(--muted)">${t("ui.selectControl", "Control auswählen")}</span>`;
    return;
  }
  const siblings = p.controls.filter((x) => x.tabId === c.tabId);
  const position = siblings.findIndex((x) => x.id === c.id);
  el.innerHTML = `<div class="elementActions"><button id="duplicateControl">${t("action.duplicate", "Duplizieren")}</button><button id="moveControlUp" aria-label="${t("control.up", "Element nach oben")}" ${position === 0 ? "disabled" : ""}>↑</button><button id="moveControlDown" aria-label="${t("control.down", "Element nach unten")}" ${position === siblings.length - 1 ? "disabled" : ""}>↓</button></div>` +
    field(
      t("props.type", "Typ"),
      `<select data-c="type">${TYPES.map((x) => `<option ${x === c.type ? "selected" : ""}>${x}</option>`).join("")}</select>`,
    ) +
    field(t("props.label", "Beschriftung"), `<input data-c="label" value="${html(c.label)}">`) +
    (!["Separator", "File"].includes(c.type)
      ? field(
          componentRule(c.type).required
            ? t("props.variableRequired", "Variable (erforderlich)")
            : t("props.variableOptional", "Variable (optional)"),
          `<select data-c="variableId"><option value="">${componentRule(c.type).required ? t("props.selectVariable", "Bitte auswählen") : t("props.noneStatic", "Keine, statischer Inhalt")}</option>${p.variables.filter((v) => variableCompatible(c, v)).map((v) => `<option value="${html(v.id)}" ${v.id === c.variableId ? "selected" : ""}>${html(v.name)} (${html(v.type)})</option>`).join("")}</select>`,
        ) + `<div class="variableLinkActions"><button id="createLinkedVariable">${t("vars.createLinked", "＋ Variable erstellen und zuordnen")}</button>${c.variableId ? `<button id="editLinkedVariable">${t("vars.editLinked", "Variable bearbeiten")}</button>` : ""}</div><div class="mutedBlock">${componentRule(c.type).info}</div>`
      : '<div class="mutedBlock">' + componentRule(c.type).info + "</div>") +
    field(
      t("props.page", "Seite"),
      `<select data-c="tabId">${p.tabs.map((t) => `<option value="${html(t.id)}" ${t.id === c.tabId ? "selected" : ""}>${html(t.name)}</option>`).join("")}</select>`,
    ) +
    field(
      t("props.color", "Farbe"),
      `<select data-c="color">${COLORS.map((x) => `<option ${x === c.color ? "selected" : ""}>${x}</option>`).join("")}</select>`,
    ) +
    `<label class="checkRow"><input type="checkbox" data-c="wide" ${c.wide ? "checked" : ""}><span class="checkRowText"><span class="checkRowTextTitle">${t("props.wide", "Volle Breite")}</span><small>${t("props.wideHelp", "Das Element nutzt in ESPUI die gesamte verfügbare Zeile.")}</small></span></label>` +
    (["Slider", "Number"].includes(c.type)
      ? `<div class="row">${field(t("props.min", "Min"), `<input type="number" data-c="min" value="${html(c.min)}">`)}${field(t("props.max", "Max"), `<input type="number" data-c="max" value="${html(c.max)}">`)}</div>`
      : "") +
    (c.type === "Text"
      ? field(
          t("props.textUse", "Text-Verwendung"),
          `<select data-c="textMode"><option value="auto" ${c.textMode === "auto" ? "selected" : ""}>${t("props.textAuto", "Automatisch nach Variablenzugriff")}</option><option value="input" ${c.textMode === "input" ? "selected" : ""}>${t("props.textInput", "Eingabe")}</option><option value="output" ${c.textMode === "output" ? "selected" : ""}>${t("props.textOutput", "Nur Ausgabe")}</option></select>`,
        ) +
        `<div class="mutedBlock">${t("props.textOutputHelp", "Nur Ausgabe zeigt den Wert an, deaktiviert das Feld und erzeugt keinen Callback.")}</div>`
      : "") +
    (groupable(c.type)
      ? field(
          t("props.group", "Set / gemeinsame Kachel"),
          `<select data-c="groupId"><option value="">${t("props.noGroup", "Keine, eigene Kachel")}</option>${p.controls.filter((x) => x.id !== c.id && !x.groupId && x.type === c.type && x.tabId === c.tabId).map((x) => `<option value="${html(x.id)}" ${c.groupId === x.id ? "selected" : ""}>${t("preview.set", "Set")}: „${html(x.label)}“</option>`)}</select>`,
        ) +
        `<div class="mutedBlock">${t("props.groupHelp", "Gruppiert mehrere {type}-Controls optisch in einem ESPUI-Panel. Jedes Control behält seine eigene Variable und Funktion.", { type: c.type })}</div>`
      : "") +
    (["Switch", "Slider"].includes(c.type)
      ? `<label class="checkRow"><input type="checkbox" data-c="vertical" ${c.vertical ? "checked" : ""}><span class="checkRowText">${t("props.vertical", "Vertikal im Set anzeigen")}</span></label>`
      : "") +
    (c.type === "Button"
      ? field(
          t("props.buttonText", "Button-Text"),
          `<input data-c="buttonText" value="${html(c.buttonText || c.label || "Ausführen")}">`,
        )
      : "") +
    (c.type === "Label" && !c.variableId
      ? field(
          t("props.staticText", "Statischer Anzeigetext"),
          `<input data-c="staticValue" value="${html(c.staticValue || c.label)}">`,
        )
      : "") +
    (c.type === "Label" && vBy(c)?.type === "bool"
      ? `<div class="row">${field(t("props.false", "Text bei false"), `<input data-c="boolFalseText" value="${html(c.boolFalseText || "Aus")}">`)}${field(t("props.true", "Text bei true"), `<input data-c="boolTrueText" value="${html(c.boolTrueText || "Ein")}">`)}</div><div class="mutedBlock">${t("props.booleanHelp", "Das Label zeigt statt 0 und 1 die eingetragenen Statustexte an.")}</div>`
      : "") +
    (c.type === "File"
      ? field(
          t("props.filePath", "Dateipfad im ESP32-Dateisystem"),
          `<input data-c="filePath" value="${html(c.filePath || "/data.txt")}">`,
        )
      : "") +
    (c.type === "Select"
      ? field(
          t("props.options", "Optionen"),
          `<textarea data-c="options" required>${html(c.options || "")}</textarea>`,
        )
      : "") +
    `<button id="deleteControl" class="danger">${t("props.delete", "Control löschen")}</button>`;
  el.querySelector("#duplicateControl").onclick = () => duplicateControl(c.id);
  el.querySelector("#moveControlUp").onclick = () => moveControl(c.id, -1);
  el.querySelector("#moveControlDown").onclick = () => moveControl(c.id, 1);
  el.querySelector("#createLinkedVariable")?.addEventListener("click", () => createLinkedVariable(c.id));
  el.querySelector("#editLinkedVariable")?.addEventListener("click", () => editLinkedVariable(c.variableId));
  el.querySelectorAll("[data-c]").forEach(
    (e) =>
      (e.onchange = () => {
        c[e.dataset.c] =
          e.type === "checkbox"
            ? e.checked
            : e.type === "number"
              ? Number(e.value)
              : e.value;
        if (e.dataset.c === "type") {
          if (!variableCompatible(c, vBy(c))) c.variableId = "";
          c.groupId = "";
        }
        if (e.dataset.c === "tabId") {
          c.groupId = "";
          activeTab = c.tabId;
          showActionStatus(t("control.pageChanged", "Element verschoben. Die Zielseite ist jetzt geöffnet."));
        }
        save({keepProperties: !["type", "variableId", "tabId", "textMode"].includes(e.dataset.c), keepVars: !["type", "variableId"].includes(e.dataset.c), keepNetwork: true, keepExpert: true});
      }),
  );
  el.querySelector("#deleteControl").onclick = () => {
    p.controls = p.controls.filter((x) => x.id !== c.id);
    p.controls.forEach((x) => { if (x.groupId === c.id) x.groupId = ""; });
    selected = null;
    save();
  };
}
function renderVars() {
  const query = (document.querySelector("#variableSearch")?.value || "").trim().toLocaleLowerCase();
  const typeFilter = document.querySelector("#variableTypeFilter")?.value || "";
  const variables = p.variables.filter((variable) => {
    const matchesQuery = !query || `${variable.name} ${variable.type} ${variable.access}`.toLocaleLowerCase().includes(query);
    return matchesQuery && (!typeFilter || variable.type === typeFilter);
  });
  document.querySelector("#varList").innerHTML = variables
    .map(
      (v) => {
        const uses = p.controls.filter((control) => control.variableId === v.id);
        const usage = uses.length
          ? `<button class="variableUsage" data-var-usage="${html(v.id)}" type="button">${uses.length === 1 ? t("vars.usedByOne", "Von 1 Element verwendet") : t("vars.usedByMany", "Von {count} Elementen verwendet", {count: uses.length})}</button>`
          : `<span class="variableUsage unused">${t("vars.unused", "Nicht verwendet")}</span>`;
        return `<div class="item card variableCard" data-variable-card="${html(v.id)}"><div class="variableCardMeta">${usage}</div>${field(t("vars.name", "Name"), `<input data-v="${html(v.id)}" data-k="name" value="${html(v.name)}">`)}${field(t("vars.dataType", "Datentyp"), `<select data-v="${html(v.id)}" data-k="type">${DT.map((x) => `<option ${x === v.type ? "selected" : ""}>${x}</option>`).join("")}</select>`)}${v.type === "enum" ? field("Enum-Typ", `<input data-v="${html(v.id)}" data-k="enumType" value="${html(v.enumType || "MyEnum")}">`) : ""}${field(t("vars.access", "Zugriff"), `<select data-v="${html(v.id)}" data-k="access"><option value="read" ${v.access === "read" ? "selected" : ""}>${t("vars.read", "Nur lesen")}</option><option value="write" ${v.access === "write" ? "selected" : ""}>${t("vars.write", "Nur schreiben")}</option><option value="readwrite" ${v.access === "readwrite" ? "selected" : ""}>${t("vars.readWrite", "Lesen/Schreiben")}</option></select>`)}${v.type === "char[]" ? field(t("vars.capacity", "Puffergröße inkl. Abschlusszeichen"), `<input type="number" min="2" max="65536" data-v="${html(v.id)}" data-k="capacity" value="${html(v.capacity ?? 64)}">`) : toleranceRelevant(v.type) ? field(t("vars.tolerance", "Toleranz"), `<input type="number" min="0" step=".0001" data-v="${html(v.id)}" data-k="tolerance" value="${html(v.tolerance)}" title="Kleinste Wertänderung, ab der ein ESPUI-Update gesendet wird.">`) : "<div></div>"}<button aria-label="${html(t("vars.deleteNamed", "Variable {name} löschen", {name: v.name}))}" class="danger variableDelete" data-delv="${html(v.id)}" title="${html(t("vars.deleteNamed", "Variable {name} löschen", {name: v.name}))}" type="button">×</button></div>`;
      },
    )
    .join("");
  document.querySelector("#noVariables")?.classList.toggle("hidden", variables.length > 0);
  document.querySelectorAll("[data-v]").forEach(
    (e) =>
      (e.onchange = () => {
        const v = p.variables.find((x) => x.id === e.dataset.v);
        v[e.dataset.k] = e.type === "number" ? Number(e.value) : e.value;
        if (v.type === "char[]" && v.capacity === undefined) v.capacity = 64;
        const filtering = Boolean(document.querySelector("#variableSearch")?.value || document.querySelector("#variableTypeFilter")?.value);
        save({keepVars: e.dataset.k !== "type" && !filtering, keepNetwork: true, keepExpert: true});
      }),
  );
  document.querySelectorAll("[data-delv]").forEach(
    (e) => (e.onclick = () => deleteVariable(e.dataset.delv)),
  );
  document.querySelectorAll("[data-var-usage]").forEach((button) => button.onclick = () => {
    const control = p.controls.find((entry) => entry.variableId === button.dataset.varUsage);
    if (!control) return;
    activeTab = control.tabId;
    selected = control.id;
    showPage("ui");
    render();
  });
}
