function updateMobileGuard() {
  const guard = document.querySelector("#mobileGuard");
  if (!guard) return;
  const small = window.innerWidth < 900;
  const touch =
    window.matchMedia("(pointer:coarse)").matches ||
    navigator.maxTouchPoints > 0;
  const block = small && touch;
  guard.classList.toggle("show", block);
  document.body.classList.toggle("mobileBlocked", block);
}
window.addEventListener("resize", updateMobileGuard, { passive: true });
window.addEventListener("orientationchange", updateMobileGuard);
setTimeout(updateMobileGuard, 0);
let p = load(),
  selected = p.controls[0]?.id || null,
  activeTab = p.tabs[0]?.id || null,
  currentFile = "WebUI.cpp";
let undoStack = [];
let redoStack = [];
let lastSavedProject = JSON.stringify(p);
const statusTimers = new Map();
function setStatus(elementId, message, {duration = 3500, error = false} = {}) {
  const element = document.querySelector(`#${elementId}`);
  if (!element) return;
  const previousTimer = statusTimers.get(elementId);
  if (previousTimer) clearTimeout(previousTimer);
  statusTimers.delete(elementId);
  element.textContent = message;
  element.classList.toggle("statusError", error);
  if (!message || !duration) return;
  const timer = setTimeout(() => {
    if (element.textContent === message) {
      element.textContent = "";
      element.classList.remove("statusError");
    }
    statusTimers.delete(elementId);
  }, duration);
  statusTimers.set(elementId, timer);
}
function showActionStatus(message, options) {
  setStatus("actionStatus", message, options);
}
function clone(x) {
  return JSON.parse(JSON.stringify(x));
}
function normalize(x) {
  if (x !== null && x !== undefined && (typeof x !== "object" || Array.isArray(x))) throw new Error("Projekt muss ein JSON-Objekt sein.");
  if (x?.wifi && (typeof x.wifi !== "object" || Array.isArray(x.wifi))) throw new Error("Ungültige Netzwerkeinstellungen.");
  for (const key of ["tabs", "variables", "controls"]) {
    if (x?.[key] !== undefined && (!Array.isArray(x[key]) || x[key].some((entry) => !entry || typeof entry !== "object" || Array.isArray(entry)))) throw new Error(`Ungültige Projektliste: ${key}`);
  }
  const q = Object.assign(clone(defaults), x || {});
  q.wifi = Object.assign(clone(defaults.wifi), (x || {}).wifi || {});
  for (const [object, template] of [[q, defaults], [q.wifi, defaults.wifi]]) {
    for (const [key, value] of Object.entries(template)) {
      if (["string", "number", "boolean"].includes(typeof value) && typeof object[key] !== typeof value) throw new Error(`Ungültiger Wert: ${key}`);
    }
  }
  for (const item of [...(q.controls || []), ...(q.variables || []), ...(q.tabs || [])]) {
    for (const key of ["id", "name", "label", "type", "color", "variableId", "tabId", "groupId", "access", "enumType", "options", "staticValue", "buttonText", "filePath", "boolFalseText", "boolTrueText"]) {
      if (item[key] !== undefined && typeof item[key] !== "string") throw new Error(`Ungültiger Textwert: ${key}`);
    }
  }
  if (q.controls.some((control) => !TYPES.includes(control.type))) throw new Error("Unbekannter Control-Typ.");
  q.tabs = Array.isArray(q.tabs)
    ? q.tabs.filter((tab) => tab && typeof tab.id === "string" && typeof tab.name === "string")
    : [];
  if (!q.tabs.length) q.tabs = clone(defaults.tabs);
  q.variables = Array.isArray(q.variables)
    ? q.variables.filter((variable) => variable && typeof variable === "object")
    : [];
  q.controls = Array.isArray(q.controls)
    ? q.controls.filter((control) => control && typeof control === "object" && TYPES.includes(control.type))
    : [];
  q.controls.forEach((c) => {
    if (c.staticValue === undefined)
      c.staticValue = c.type === "Label" ? "Status" : "";
    if (c.filePath === undefined) c.filePath = "/data.txt";
    if (c.boolFalseText === undefined) c.boolFalseText = "Aus";
    if (c.boolTrueText === undefined) c.boolTrueText = "Ein";
    if (c.buttonText === undefined) c.buttonText = c.label || "Ausführen";
    if (c.textMode === undefined) c.textMode = "auto";
    if (c.groupId === undefined) c.groupId = "";
    if (c.vertical === undefined) c.vertical = false;
  });
  q.variables.forEach((v) => {
    if (v.type === "char[]" && v.capacity === undefined) v.capacity = 64;
    if (v.type === "enum" && !v.enumType) v.enumType = "MyEnum";
  });
  return q;
}
function newId(prefix) {
  return `${prefix}${globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
}
function load() {
  try {
    return normalize(JSON.parse(localStorage.getItem("espui-project")));
  } catch {
    return clone(defaults);
  }
}
function persistProject(serialized) {
  try {
    localStorage.setItem("espui-project", serialized);
    setStatus("saveStatus", t("storage.saved", "Lokal gespeichert"), {duration: 1800});
    return true;
  } catch {
    setStatus("saveStatus", t("storage.failed", "Nicht gespeichert: Browserspeicher nicht verfügbar. Bitte Projekt als JSON sichern."), {duration: 0, error: true});
    return false;
  }
}
function save(options = {}) {
  const serialized = JSON.stringify(p);
  if (serialized !== lastSavedProject) {
    redoStack = [];
    undoStack.push(lastSavedProject);
    if (undoStack.length > 50) undoStack.shift();
    lastSavedProject = serialized;
  }
  persistProject(serialized);
  render(options);
}
function undo() {
  const previous = undoStack.pop();
  if (!previous) return false;
  redoStack.push(JSON.stringify(p));
  restoreProject(previous);
  return true;
}
function redo() {
  const next = redoStack.pop();
  if (!next) return false;
  undoStack.push(JSON.stringify(p));
  restoreProject(next);
  return true;
}
function restoreProject(previous) {
  p = normalize(JSON.parse(previous));
  lastSavedProject = previous;
  const selectedControl = p.controls.find((c) => c.id === selected) || p.controls[0] || null;
  selected = selectedControl?.id || null;
  activeTab = selectedControl?.tabId || p.tabs.find((tab) => tab.id === activeTab)?.id || p.tabs[0]?.id || null;
  persistProject(previous);
  render();
  return true;
}
function id(x) {
  return String(x || "item")
    .replace(/[^A-Za-z0-9_]/g, "_")
    .replace(/^[0-9]/, "_$&");
}
function esc(x) {
  return String(x ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r")
    .replaceAll("\0", "\\000");
}
function html(x) {
  return String(x ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
function vBy(c) {
  return p.variables.find((v) => v.id === c.variableId);
}
function read(a) {
  return a === "read" || a === "readwrite";
}
function write(a) {
  return a === "write" || a === "readwrite";
}
function val(v) {
  if (v?.type === "bool") return `${v.name} ? "1" : "0"`;
  if (v?.type === "enum")
    return `String(static_cast<int>(${v.name}))`;
  return `String(${v?.name || '""'})`;
}
function controlType(t) {
  return (
    {
      Switch: "Switcher",
      Buttonpad: "Pad",
      File: "FileDisplay",
      Password: "Text",
      Date: "Text",
      Color: "Text",
      Log: "Label",
    }[t] || t
  );
}
function assign(v) {
  if (v.type === "bool")
    return `${v.name} = sender->value == "1" || sender->value == "true";`;
  if (v.type === "String") return `${v.name} = sender->value;`;
  if (v.type === "char[]")
    return `strncpy(${v.name}, sender->value.c_str(), sizeof(${v.name}) - 1); ${v.name}[sizeof(${v.name}) - 1] = '\\0';`;
  if (v.type === "const char*") return "";
  if (v.type === "float" || v.type === "double")
    return `${v.name} = (${v.type})sender->value.toDouble();`;
  if (v.type === "enum")
    return `${v.name} = (decltype(${v.name}))sender->value.toInt();`;
  return `${v.name} = (${v.type})sender->value.toInt();`;
}
