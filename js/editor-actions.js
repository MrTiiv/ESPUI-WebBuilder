// Preserve the active field when a structural change needs to rebuild its panel.
function captureEditorFocus() {
  const element = document.activeElement;
  if (!element?.matches?.('input, select, textarea, button, [data-select]')) return null;
  const data = {...element.dataset};
  return {element, elementId: element.id, tag: element.tagName, data,
    controlId: element.closest('#properties') ? selected : null,
    start: element.selectionStart, end: element.selectionEnd};
}
function restoreEditorFocus(focus) {
  if (!focus || focus.element.isConnected || (focus.controlId && focus.controlId !== selected)) return;
  const replacement = focus.elementId ? document.getElementById(focus.elementId) :
    [...document.querySelectorAll(focus.tag)].find((element) => Object.keys(focus.data).length &&
      Object.entries(focus.data).every(([key, value]) => element.dataset[key] === value));
  if (!replacement || replacement.disabled || !replacement.getClientRects().length) return;
  replacement.focus({preventScroll: true});
  if (typeof focus.start === 'number' && replacement.setSelectionRange) replacement.setSelectionRange(focus.start, focus.end);
}
function selectControl(controlId) {
  selected = controlId;
  document.querySelectorAll('[data-select]').forEach((card) => card.classList.toggle('selected', card.dataset.select === selected));
  renderProps();
  validate();
}
function showPage(page) {
  document.querySelectorAll('.page').forEach((node) => node.classList.toggle('active', node.id === page));
  document.querySelectorAll('#nav button').forEach((node) => node.classList.toggle('active', node.dataset.page === page));
}
function focusVariable(variableId) {
  const input = [...document.querySelectorAll('[data-v][data-k="name"]')].find((node) => node.dataset.v === variableId);
  input?.focus();
  input?.select();
  input?.closest?.('.variableCard')?.scrollIntoView?.({block: 'center', behavior: 'smooth'});
}
function editLinkedVariable(variableId) {
  if (!p.variables.some((variable) => variable.id === variableId)) return;
  document.querySelector('#variableSearch').value = '';
  document.querySelector('#variableTypeFilter').value = '';
  showPage('vars');
  renderVars();
  focusVariable(variableId);
}
function variableNamesInUse() {
  return new Set([...p.variables.map((v) => v.name), ...p.variables.filter((v) => v.type === 'enum').map((v) => v.enumType),
    ...['ssidVar', 'passwordVar', 'reconnectVariable', 'statusVariable'].map((key) => p.wifi[key]), ...reservedCppNames()]);
}
function uniqueVariableName(base = 'neueVariable') {
  base = String(base).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (!/^[A-Za-z]/.test(base) || !validCppName(base)) base = 'neueVariable';
  const used = variableNamesInUse();
  let name = base, number = 2;
  while (used.has(name) || !validCppName(name)) name = `${base}${number++}`;
  return name;
}
function makeVariable(name, type = 'int', access = 'readwrite') {
  return {id: newId('v_'), name, type, access, tolerance: 0.001, capacity: 64, enumType: uniqueVariableName('MyEnum')};
}
function addVariable() {
  const variable = makeVariable(uniqueVariableName());
  p.variables.push(variable);
  save();
  focusVariable(variable.id);
}
function createLinkedVariable(controlId) {
  const control = p.controls.find((c) => c.id === controlId);
  if (!control) return;
  const rule = componentRule(control.type);
  const access = rule.direction === 'read' || (control.type === 'Text' && control.textMode === 'output') ? 'read' :
    rule.direction === 'write' ? 'write' : 'readwrite';
  const types = rule.types.filter((type) => variableCompatible(control, {type, access}));
  const preferred = ['bool', 'int', 'String', 'float'].find((type) => types.includes(type)) || types[0];
  openEditorDialog(t('vars.createLinked', 'Variable erstellen und zuordnen'),
    field(t('vars.name', 'Name'), `<input id="newVariableName" name="name" value="${html(uniqueVariableName(control.label))}" required>`) +
    field(t('vars.dataType', 'Datentyp'), `<select name="type">${types.map((type) => `<option ${type === preferred ? 'selected' : ''}>${html(type)}</option>`).join('')}</select>`) +
    `<p class="mutedBlock">${t('vars.autoLink', 'Die Variable wird diesem Element automatisch zugeordnet. Der Zugriff passt zum Element.')}</p>`,
    (form) => {
      const name = form.elements.namedItem('name').value.trim();
      if (!validCppName(name) || variableNamesInUse().has(name)) return t('vars.nameError', 'Bitte einen gültigen, noch nicht verwendeten C++-Namen eingeben.');
      const type = form.elements.namedItem('type').value;
      if (!types.includes(type)) return t('vars.typeError', 'Bitte einen passenden Datentyp auswählen.');
      const variable = makeVariable(name, type, access);
      p.variables.push(variable);
      control.variableId = variable.id;
      save();
    });
}
function copyLabel(base, used) {
  const copy = t('action.copySuffix', 'Kopie');
  let result = `${base} (${copy})`, index = 2;
  while (used.includes(result)) result = `${base} (${copy} ${index++})`;
  return result;
}
function duplicateControl(controlId) {
  const index = p.controls.findIndex((c) => c.id === controlId);
  if (index < 0) return;
  const original = p.controls[index];
  const copy = {...clone(original), id: newId('c_'), groupId: '',
    label: copyLabel(original.label, p.controls.map((c) => c.label))};
  p.controls.splice(index + 1, 0, copy);
  selected = copy.id;
  activeTab = copy.tabId;
  save();
  showActionStatus(t('control.copied', 'Element dupliziert. Die Variablenzuordnung wurde übernommen.'));
}
function moveControl(controlId, direction) {
  const siblings = p.controls.filter((c) => c.tabId === activeTab);
  const index = siblings.findIndex((c) => c.id === controlId);
  const target = siblings[index + direction];
  if (index < 0 || !target) return false;
  if (!reorderControl(controlId, target.id, direction > 0)) return false;
  save();
  showActionStatus(t('control.moved', 'Element verschoben.'));
  return true;
}
function renameTab(tabId) {
  const tab = p.tabs.find((entry) => entry.id === tabId);
  if (tab) editName(t('tabs.rename', 'Seite umbenennen'), tab.name, (name) => { tab.name = name; save(); });
}
function duplicateTab(tabId) {
  const original = p.tabs.find((tab) => tab.id === tabId);
  if (!original) return;
  const copy = {id: newId('tab_'), name: copyLabel(original.name, p.tabs.map((tab) => tab.name))};
  const controls = p.controls.filter((c) => c.tabId === tabId);
  const mapping = new Map(controls.map((c) => [c.id, newId('c_')]));
  p.tabs.splice(p.tabs.indexOf(original) + 1, 0, copy);
  p.controls.push(...controls.map((c) => ({...clone(c), id: mapping.get(c.id), tabId: copy.id, groupId: mapping.get(c.groupId) || ''})));
  activeTab = copy.id;
  selected = mapping.get(controls[0]?.id) || null;
  save();
  showActionStatus(t('tabs.copied', 'Seite dupliziert. Die Elemente verwenden weiterhin dieselben Variablen.'));
}
function removeTab(tabId) {
  if (p.tabs.length < 2 || !p.tabs.some((tab) => tab.id === tabId)) return;
  p.tabs = p.tabs.filter((tab) => tab.id !== tabId);
  const target = p.tabs[0].id;
  p.controls.forEach((control) => { if (control.tabId === tabId) control.tabId = target; });
  activeTab = target;
  selected = null;
  save();
}
function deleteTab(tabId) {
  const tab = p.tabs.find((entry) => entry.id === tabId);
  if (!tab || p.tabs.length < 2) return;
  const target = p.tabs.find((entry) => entry.id !== tabId);
  openEditorDialog(t('tabs.delete', 'Seite löschen'), `<p>${html(t('tabs.deleteDescription', '„{name}“ löschen? Die Elemente werden nach „{target}“ verschoben. Rückgängig ist anschließend möglich.', {name: tab.name, target: target.name}))}</p>`, () => removeTab(tabId));
}
function deleteVariable(variableId) {
  const variable = p.variables.find((entry) => entry.id === variableId);
  if (!variable) return;
  const controls = p.controls.filter((control) => control.variableId === variableId);
  const details = controls.length
    ? `<p>${html(controls.length === 1 ? t('vars.deleteUsedOne', 'Diese Variable wird von einem Element verwendet. Beim Löschen wird diese Verknüpfung entfernt:') : t('vars.deleteUsedMany', 'Diese Variable wird von {count} Elementen verwendet. Beim Löschen werden diese Verknüpfungen entfernt:', {count: controls.length}))}</p><ul class="dialogList">${controls.map((control) => `<li>${html(control.label)} · ${html(p.tabs.find((tab) => tab.id === control.tabId)?.name || '')}</li>`).join('')}</ul>`
    : `<p>${html(t('vars.deleteUnused', 'Diese Variable wird derzeit von keinem Element verwendet.'))}</p>`;
  openEditorDialog(
    t('vars.deleteTitle', 'Variable löschen'),
    `<p>${html(t('vars.deleteQuestion', 'Variable „{name}“ wirklich löschen?', {name: variable.name}))}</p>${details}<p class="mutedBlock">${html(t('vars.deleteUndo', 'Die Aktion kann anschließend rückgängig gemacht werden.'))}</p>`,
    () => {
      p.variables = p.variables.filter((entry) => entry.id !== variableId);
      p.controls.forEach((control) => { if (control.variableId === variableId) control.variableId = ''; });
      save();
      showActionStatus(t('vars.deleted', 'Variable gelöscht.'));
    },
    {submitLabel: t('action.delete', 'Löschen'), danger: true},
  );
}
let editorDialogPreviousFocus = null;
function openEditorDialog(title, content, onSubmit, options = {}) {
  const dialog = document.querySelector('#editorDialog');
  editorDialogPreviousFocus = document.activeElement;
  document.querySelectorAll('.pageMenu[open]').forEach((menu) => { menu.open = false; });
  document.querySelector('#editorDialogTitle').textContent = title;
  document.querySelector('#editorDialogFields').innerHTML = content;
  document.querySelector('#editorDialogError').textContent = '';
  const form = document.querySelector('#editorForm');
  const submit = document.querySelector('#editorSubmit');
  submit.textContent = options.submitLabel || t('action.apply', 'Übernehmen');
  submit.classList.toggle('danger', Boolean(options.danger));
  submit.classList.toggle('primary', !options.danger);
  form.onsubmit = (event) => {
    event.preventDefault();
    const error = onSubmit(form);
    if (error) { document.querySelector('#editorDialogError').textContent = error; return; }
    dialog.close();
  };
  dialog.showModal();
  const input = dialog.querySelector('input');
  input?.focus();
  input?.select();
}
function editName(title, initial, onSubmit) {
  openEditorDialog(title, field(t('tabs.name', 'Seitenname'), `<input name="name" value="${html(initial)}" required maxlength="120">`), (form) => {
    const name = form.elements.namedItem('name').value.trim();
    if (!name) return t('tabs.nameRequired', 'Bitte einen Seitennamen eingeben.');
    onSubmit(name);
  });
}
document.querySelector('#editorCancel').onclick = () => document.querySelector('#editorDialog').close();
document.querySelector('#editorDialog').addEventListener('close', () => {
  if (editorDialogPreviousFocus?.isConnected) editorDialogPreviousFocus.focus();
  else (document.querySelector('#vars')?.classList.contains('active') ? document.querySelector('#addVar') : document.querySelector('#addTab'))?.focus();
});
document.addEventListener('click', (event) => {
  document.querySelectorAll('.pageMenu[open]').forEach((menu) => { if (!menu.contains(event.target)) menu.open = false; });
});
function updateEditorHeight() {
  const grid = document.querySelector('.grid3');
  if (grid?.getClientRects().length) document.documentElement.style.setProperty('--editor-top', `${Math.max(0, grid.getBoundingClientRect().top)}px`);
}
if (typeof ResizeObserver !== 'undefined') {
  const observer = new ResizeObserver(updateEditorHeight);
  ['header', '#notice'].forEach((selector) => observer.observe(document.querySelector(selector)));
  window.addEventListener('resize', updateEditorHeight, {passive: true});
}
