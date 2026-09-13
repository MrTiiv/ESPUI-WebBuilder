const TYPES = [
  "Label",
  "Button",
  "Switch",
  "Slider",
  "Number",
  "Text",
  "Password",
  "Date",
  "Time",
  "Color",
  "Select",
  "Buttonpad",
  "Separator",
  "Log",
  "File",
  "Graph",
];
const DT = [
  "bool",
  "char",
  "unsigned char",
  "int8_t",
  "uint8_t",
  "int16_t",
  "uint16_t",
  "int32_t",
  "uint32_t",
  "int64_t",
  "uint64_t",
  "short",
  "unsigned short",
  "int",
  "unsigned int",
  "long",
  "unsigned long",
  "float",
  "double",
  "String",
  "char[]",
  "const char*",
  "enum",
];
const COLORS = [
  "Turquoise",
  "Emerald",
  "Peterriver",
  "Wetasphalt",
  "Sunflower",
  "Carrot",
  "Alizarin",
  "Dark",
  "None",
];
const BUILDER_VERSION = "2.18.0";
const ESPUI_VERSION = "2.2.4";
// Add the repository's full /issues URL here when the public issue tracker is ready.
const GITHUB_ISSUES_URL = "";
const INTEGER_TYPES = [
  "char",
  "unsigned char",
  "int8_t",
  "uint8_t",
  "int16_t",
  "uint16_t",
  "int32_t",
  "uint32_t",
  "int64_t",
  "uint64_t",
  "short",
  "unsigned short",
  "int",
  "unsigned int",
  "long",
  "unsigned long",
];
// ESPUI's slider and number update APIs use signed 32-bit integer values.
const ESPUI_INTEGER_TYPES = [
  "char",
  "unsigned char",
  "int8_t",
  "uint8_t",
  "int16_t",
  "uint16_t",
  "int32_t",
  "short",
  "unsigned short",
  "int",
  "long",
];
const NUMERIC_TYPES = [...INTEGER_TYPES, "float", "double"];
const TEXT_TYPES = ["String", "char[]", "const char*"];
function componentRule(type) {
  const rules = {
    Label: {
      types: DT,
      direction: "read",
      required: false,
      info: t("rule.label", "Optional: statischer Text oder eine lesbare Variable."),
    },
    Button: {
      types: ["bool"],
      direction: "write",
      required: true,
      info: t("rule.button", "Benötigt bool und löst beim Drücken ein Ereignis aus."),
    },
    Switch: {
      types: ["bool"],
      direction: "both",
      required: true,
      info: t("rule.switch", "Benötigt bool für Ein/Aus."),
    },
    Slider: {
      types: ESPUI_INTEGER_TYPES,
      direction: "both",
      required: true,
      info: t("rule.slider", "Benötigt einen ganzzahligen Datentyp im 32-Bit-Bereich."),
    },
    Number: {
      types: ESPUI_INTEGER_TYPES,
      direction: "both",
      required: true,
      info: t("rule.number", "Benötigt einen ganzzahligen Datentyp im 32-Bit-Bereich."),
    },
    Text: {
      types: ["String", "char[]", "const char*"],
      direction: "dynamic",
      required: true,
      info: t("rule.text", "Kann als Eingabe, Ausgabe oder automatisch nach Variablenzugriff verwendet werden."),
    },
    Password: {
      types: ["String", "char[]"],
      direction: "both",
      required: true,
      info: t("rule.password", "Benötigt String oder ein beschreibbares char-Array."),
    },
    Date: {
      types: ["String", "char[]"],
      direction: "both",
      required: true,
      info: t("rule.date", "Datum wird als Textwert übertragen."),
    },
    Time: {
      types: ["String", "char[]"],
      direction: "both",
      required: true,
      info: t("rule.time", "Zeit wird als Textwert übertragen."),
    },
    Color: {
      types: ["String", "char[]"],
      direction: "both",
      required: true,
      info: t("rule.color", "Farbe wird als Text wie #22d3ee übertragen."),
    },
    Select: {
      types: [...INTEGER_TYPES, "String", "char[]", "enum"],
      direction: "both",
      required: true,
      info: t("rule.select", "Benötigt Zahl, enum, String oder char-Array."),
    },
    Buttonpad: {
      types: [...INTEGER_TYPES, "enum"],
      direction: "write",
      required: true,
      info: t("rule.buttonpad", "Schreibt Richtungs- und Tastencodes."),
    },
    Separator: {
      types: [],
      direction: "none",
      required: false,
      info: t("rule.separator", "Reines Layoutelement ohne Variable."),
    },
    Log: {
      types: ["String", "char[]", "const char*"],
      direction: "read",
      required: false,
      info: t("rule.log", "Optional: lesbare Textvariable für eine Status- oder Logausgabe."),
    },
    File: {
      types: [],
      direction: "none",
      required: false,
      info: t("rule.file", "Verwendet einen Dateipfad statt einer Variable."),
    },
    Graph: {
      types: NUMERIC_TYPES,
      direction: "read",
      required: true,
      info: t("rule.graph", "Benötigt einen lesbaren numerischen Messwert."),
    },
  };
  return (
    rules[type] || { types: DT, direction: "both", required: false, info: "" }
  );
}
function allowedTypes(type) {
  return componentRule(type).types;
}
function accessCompatible(rule, v, c) {
  if (rule.direction === "dynamic") {
    const mode = c?.textMode || "auto";
    if (mode === "output") return read(v.access);
    if (mode === "input") return write(v.access) && v.type !== "const char*";
    return read(v.access) || write(v.access);
  }
  if (rule.direction === "read" && !read(v.access)) return false;
  if (rule.direction === "write" && !write(v.access)) return false;
  if (rule.direction === "both" && v.access !== "readwrite") return false;
  return true;
}
function variableCompatible(c, v) {
  const r = componentRule(c.type);
  return (
    !!v &&
    r.types.includes(v.type) &&
    accessCompatible(r, v, c) &&
    !(v.type === "const char*" && write(v.access))
  );
}
function isInteractive(type) {
  return [
    "Button",
    "Switch",
    "Slider",
    "Number",
    "Text",
    "Password",
    "Date",
    "Time",
    "Color",
    "Select",
    "Buttonpad",
  ].includes(type);
}
function textOutput(c, v) {
  return (
    c.type === "Text" &&
    ((c.textMode || "auto") === "output" ||
      ((c.textMode || "auto") === "auto" && read(v.access) && !write(v.access)))
  );
}
function selectOptions(c) {
  return String(c?.options || "")
    .split(/\n|,/)
    .map((option) => option.trim())
    .filter(Boolean);
}
function groupable(type) {
  return ["Button", "Switch", "Slider", "Label"].includes(type);
}
function validGroupRoot(c) {
  return (
    c.groupId &&
    p.controls.some(
      (x) =>
        x.id === c.groupId &&
        !x.groupId &&
        x.type === c.type &&
        x.tabId === c.tabId,
    )
  );
}
function displayVal(c, v) {
  if (c.type === "Label" && v.type === "bool")
    return `${v.name} ? "${esc(c.boolTrueText || "Ein")}" : "${esc(c.boolFalseText || "Aus")}"`;
  if (c.type === "Button")
    return `"${esc(c.buttonText || c.label || "Ausführen")}"`;
  return val(v);
}
function callbackAssignment(c, v) {
  if (textOutput(c, v)) return "";
  if (c.type === "Button" && v.type === "bool")
    return `if (type == B_DOWN) ${v.name} = true; else if (type == B_UP) ${v.name} = false;`;
  return assign(v);
}
function updateCall(c, v) {
  const cid = `id_${id(c.id)}`;
  if (c.type === "Graph") return `ESPUI.addGraphPoint(${cid}, (int)${v.name});`;
  if (c.type === "Switch") return `ESPUI.updateSwitcher(${cid}, ${v.name});`;
  if (c.type === "Slider") return `ESPUI.updateSlider(${cid}, (int)${v.name});`;
  if (c.type === "Number") return `ESPUI.updateNumber(${cid}, (int)${v.name});`;
  if (c.type === "Label")
    return `ESPUI.updateLabel(${cid}, ${displayVal(c, v)});`;
  if (c.type === "Log") return `ESPUI.print(${cid}, ${val(v)});`;
  if (c.type === "Select") return `ESPUI.updateSelect(${cid}, ${val(v)});`;
  return `ESPUI.updateControlValue(${cid}, ${val(v)});`;
}
const defaults = {
  setupComplete: false,
  projectName: "Mein ESPUI Projekt",
  title: "ESP32 Steuerung",
  hostname: "espui",
  port: 80,
  syncMs: 100,
  auth: false,
  username: "admin",
  password: "",
  wifi: {
    mode: "external",
    credentials: "external",
    ssidVar: "wifiSsid",
    passwordVar: "wifiPassword",
    ssid: "",
    password: "",
    persistent: true,
    timeout: 15000,
    apTimeout: 600000,
    reconnectVariable: "reconnectWebUI",
    resetReconnect: true,
    statusVariable: "webUIConnectionActive",
    apSsid: "ESPUI",
    apPassword: "espui123",
    apChannel: 1,
    maxClients: 4,
    ip: "192.168.4.1",
    dnsPort: 53,
  },
  tabs: [{ id: "main", name: "Hauptseite" }],
  variables: [
    {
      id: "v1",
      name: "motorEnabled",
      type: "bool",
      access: "readwrite",
      tolerance: 0.001,
    },
    {
      id: "v2",
      name: "targetSpeed",
      type: "int",
      access: "readwrite",
      tolerance: 0.001,
      enumType: "MyEnum",
    },
  ],
  controls: [
    {
      id: "c1",
      type: "Switch",
      label: "Motor",
      variableId: "v1",
      tabId: "main",
      color: "Emerald",
      min: 0,
      max: 1,
      step: 1,
      options: "",
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
    },
    {
      id: "c2",
      type: "Slider",
      label: "Drehzahl",
      variableId: "v2",
      tabId: "main",
      color: "Peterriver",
      min: 0,
      max: 3000,
      step: 10,
      options: "",
      wide: true,
      visible: true,
      enabled: true,
      css: "",
    },
  ],
};
