function files() {
  const w = p.wifi,
    vars = p.variables.filter((v) => v.name),
    ex = vars
      .map((v) =>
        v.type === "char[]"
          ? `extern char ${v.name}[${v.capacity ?? 64}];`
          : v.type === "enum"
            ? `extern ${v.enumType} ${v.name};`
            : `extern ${v.type} ${v.name};`,
      )
      .join("\n");
  let nx = [];
  if (w.mode === "station" && w.credentials === "external")
    nx.push(
      `extern const char* ${id(w.ssidVar)};`,
      `extern const char* ${id(w.passwordVar)};`,
    );
  if (w.mode !== "external" && w.reconnectVariable)
    nx.push(`extern bool ${id(w.reconnectVariable)};`);
  if (w.mode !== "external" && w.statusVariable)
    nx.push(`extern bool ${id(w.statusVariable)};`);
  const ids = p.controls
    .map((c) => `uint16_t id_${id(c.id)} = Control::noParent;`)
    .join("\n");
  const cache = vars
    .filter((v) => read(v.access))
    .map(
      (v) =>
        `${["String", "char[]", "const char*"].includes(v.type) ? "String" : v.type === "enum" ? `decltype(${v.name})` : v.type} cache_${id(v.id)} = ${["char[]", "const char*"].includes(v.type) ? `String(${v.name})` : v.name};`,
    )
    .join("\n");
  const callbacks = p.controls
    .map((c) => {
      const v = vBy(c);
      return isInteractive(c.type) &&
        v &&
        variableCompatible(c, v) &&
        write(v.access) &&
        callbackAssignment(c, v)
        ? `void cb_${id(c.id)}(Control* sender, int type) { ${callbackAssignment(c, v)} }`
        : "";
    })
    .filter(Boolean)
    .join("\n");
  const tabs = p.tabs
    .map(
      (t) =>
        `uint16_t tab_${id(t.id)} = ESPUI.addControl(ControlType::Tab, "${esc(t.name)}", "${esc(t.name)}");`,
    )
    .join("\n  ");
  const orderedControls = [...p.controls].sort(
    (a, b) => (validGroupRoot(a) ? 1 : 0) - (validGroupRoot(b) ? 1 : 0),
  );
  const controls = orderedControls
    .map((c) => {
      const rawV = vBy(c),
        v = variableCompatible(c, rawV) ? rawV : null,
        parent = validGroupRoot(c)
          ? `id_${id(c.groupId)}`
          : `tab_${id(c.tabId)}`,
        controlLabel = validGroupRoot(c) ? "" : c.label,
        cb =
          isInteractive(c.type) &&
          v &&
          write(v.access) &&
          callbackAssignment(c, v)
            ? `, cb_${id(c.id)}`
            : "";
      let s =
        c.type === "File"
          ? `id_${id(c.id)} = ESPUI.addControl(ControlType::FileDisplay, "${esc(c.label)}", "${esc(c.filePath || "/data.txt")}", ControlColor::${c.color}, ${parent});`
          : c.type === "Separator"
            ? `id_${id(c.id)} = ESPUI.addControl(ControlType::Separator, "${esc(c.label)}", "", ControlColor::None, ${parent});`
            : `id_${id(c.id)} = ESPUI.addControl(ControlType::${controlType(c.type)}, "${esc(controlLabel)}", ${v ? displayVal(c, v) : c.type === "Label" ? `"${esc(c.staticValue || c.label)}"` : '""'}, ControlColor::${c.color}, ${parent}${cb});`;
      if (["Password", "Date", "Time", "Color"].includes(c.type))
        s += `\n  ESPUI.setInputType(id_${id(c.id)}, "${c.type.toLowerCase()}");`;
      if (["Slider", "Number"].includes(c.type))
        s += `\n  ESPUI.addControl(ControlType::Min, "", "${c.min}", ControlColor::None, id_${id(c.id)});\n  ESPUI.addControl(ControlType::Max, "", "${c.max}", ControlColor::None, id_${id(c.id)});`;
      if (c.type === "Select")
        selectOptions(c).forEach((option, index) => {
          const optionValue = v && ["String", "char[]"].includes(v.type)
            ? option
            : String(index);
          s += `\n  ESPUI.addControl(ControlType::Option, "${esc(option)}", "${esc(optionValue)}", ControlColor::None, id_${id(c.id)});`;
        });
      if (c.type === "Button")
        s += `\n  ESPUI.setElementStyle(id_${id(c.id)}, "min-width:140px;min-height:44px;padding:12px 18px;font-size:16px;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:manipulation;cursor:pointer;");`;
      if (textOutput(c, v)) s += `\n  ESPUI.setEnabled(id_${id(c.id)}, false);`;
      if (c.vertical && ["Switch", "Slider"].includes(c.type))
        s += `\n  ESPUI.setVertical(id_${id(c.id)}, true);`;
      if (c.wide) s += `\n  ESPUI.setPanelWide(id_${id(c.id)}, true);`;
      return s;
    })
    .join("\n  ");
  const sync = vars
    .filter((v) => read(v.access))
    .map((v) => {
      const linked = p.controls.filter(
        (c) => c.variableId === v.id && variableCompatible(c, v),
      );
      if (!linked.length) return "";
      const comp = ["float", "double"].includes(v.type)
        ? `fabs((double)${v.name}-(double)cache_${id(v.id)})>${v.tolerance ?? 0.001}`
        : ["String", "char[]", "const char*"].includes(v.type)
          ? `String(${v.name}) != cache_${id(v.id)}`
          : `${v.name} != cache_${id(v.id)}`;
      const updates = linked.map((c) => updateCall(c, v)).join(" ");
      return `if (${comp}) { ${updates} cache_${id(v.id)} = ${["char[]", "const char*"].includes(v.type) ? `String(${v.name})` : v.name}; }`;
    })
    .filter(Boolean)
    .join("\n  ");
  let nb = "";
  const creds =
    w.credentials === "code"
      ? `"${esc(w.ssid)}", "${esc(w.password)}"`
      : `${id(w.ssidVar)}, ${id(w.passwordVar)}`;
  const startNetwork =
    w.mode === "station"
      ? `WiFi.mode(WIFI_STA);\n  WiFi.setHostname("${esc(p.hostname)}");\n  WiFi.begin(${creds});\n  networkStartedAt = millis();\n  networkStopped = false;`
      : w.mode === "ap" || w.mode === "captive"
        ? `WiFi.mode(WIFI_AP);\n  ${w.mode === "captive" ? "WiFi.softAPConfig(apIp, apIp, IPAddress(255,255,255,0));\n  " : ""}accessPointStarted = WiFi.softAP("${esc(w.apSsid)}", "${esc(w.apPassword)}", ${w.apChannel}, false, ${w.maxClients});${w.mode === "captive" ? `\n  dnsServer.start(${w.dnsPort}, "*", apIp);` : ""}\n  networkStartedAt = millis();\n  networkStopped = false;`
        : "";
  if (w.mode !== "external") nb = startNetwork;
  let nl = w.mode === "captive" ? "if (!networkStopped) dnsServer.processNextRequest();\n  " : "";
  if (w.mode !== "external" && !w.persistent)
    nl += `if (!networkStopped && millis() - networkStartedAt >= ${w.mode === "station" ? w.timeout : w.apTimeout}) { ${w.mode === "station" ? "WiFi.disconnect(true);" : "WiFi.softAPdisconnect(true); accessPointStarted = false;"} WiFi.mode(WIFI_OFF); networkStopped = true; }\n  `;
  if (w.mode !== "external" && w.reconnectVariable)
    nl += `if (${id(w.reconnectVariable)}) { ${w.resetReconnect ? id(w.reconnectVariable) + " = false;" : ""} ${startNetwork} }\n  `;
  if (w.mode !== "external" && w.statusVariable)
    nl += `${id(w.statusVariable)} = ${w.mode === "station" ? "WiFi.status() == WL_CONNECTED" : "accessPointStarted"};`;
  const dns =
    w.mode === "captive"
      ? `#include <DNSServer.h>\nDNSServer dnsServer;\nIPAddress apIp(${w.ip.split(".").join(",")});`
      : "";
  const auth = p.auth
    ? `ESPUI.begin("${esc(p.title)}", "${esc(p.username)}", "${esc(p.password)}", ${p.port});`
    : `ESPUI.begin("${esc(p.title)}", nullptr, nullptr, ${p.port});`;
  const enumDefinitions = [...new Set(vars.filter((v) => v.type === "enum").map((v) => v.enumType))]
    .map((type) => `enum class ${type} { Value0 = 0 };`)
    .join("\n");
  const h = `#pragma once\n// Generated by ESPUI Builder ${BUILDER_VERSION} for ESPUI ${ESPUI_VERSION}\n#include <Arduino.h>\n${enumDefinitions}${enumDefinitions ? "\n" : ""}namespace WebUI { void begin(); void loop(); void refresh(); }\n`;
  const cpp = `// Generated by ESPUI Builder ${BUILDER_VERSION} for ESPUI ${ESPUI_VERSION}\n#include "WebUI.h"\n#include <ESPUI.h>\n#include <WiFi.h>\n#include <math.h>\n#include <cstring>\n${dns}\n${ex}\n${nx.join("\n")}\nnamespace {\n${w.mode === "ap" || w.mode === "captive" ? "bool accessPointStarted = false;\n" : ""}${w.mode !== "external" ? "unsigned long networkStartedAt = 0;\nbool networkStopped = false;\n" : ""}${ids}\n${cache}\nunsigned long lastSync=0;\n${callbacks}\n}\nnamespace WebUI {\nvoid begin() {\n  ${nb}\n  ${tabs}\n  ${controls}\n  ${auth}\n}\nvoid loop() {\n  ${nl}\n  if (millis()-lastSync < ${p.syncMs}) return;\n  lastSync=millis();\n  ${sync}\n}\nvoid refresh() {\n${p.controls
    .map((c) => {
      const v = vBy(c);
      return v && variableCompatible(c, v) && read(v.access)
        ? `  ${updateCall(c, v)}`
        : "";
    })
    .filter(Boolean)
    .join("\n")}\n}\n}\n`;
  const definitions = vars
    .map((v) =>
      v.type === "bool"
        ? `bool ${v.name} = false;`
        : v.type === "String"
          ? `String ${v.name} = "";`
          : v.type === "char[]"
            ? `char ${v.name}[${v.capacity ?? 64}] = "";`
            : v.type === "const char*"
            ? `const char* ${v.name} = "";`
            : v.type === "enum"
              ? `${v.enumType} ${v.name} = ${v.enumType}::Value0;`
            : `${v.type} ${v.name} = 0;`,
    )
    .join("\n");
  const main = `#include <Arduino.h>\n#include "WebUI.h"\n\n${definitions}${w.mode === "station" && w.credentials === "external" ? `\nconst char* ${id(w.ssidVar)} = "WLAN-NAME";\nconst char* ${id(w.passwordVar)} = "WLAN-PASSWORT";` : ""}${w.mode !== "external" && w.reconnectVariable ? `\nbool ${id(w.reconnectVariable)} = false;` : ""}${w.mode !== "external" && w.statusVariable ? `\nbool ${id(w.statusVariable)} = false;` : ""}\n\nvoid setup() {\n  Serial.begin(115200);\n  WebUI::begin();\n}\n\nvoid loop() {\n  WebUI::loop();\n}\n`;
  return {
    "WebUI.h": h,
    "WebUI.cpp": cpp,
    "MainCodeExample.ino": main,
    "WebUIProject.json": JSON.stringify(
      Object.assign(
        { builderVersion: BUILDER_VERSION, espuiVersion: ESPUI_VERSION },
        p,
      ),
      null,
      2,
    ),
  };
}
