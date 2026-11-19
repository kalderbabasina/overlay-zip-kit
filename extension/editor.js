(() => {
  "use strict";

  if (!/^\/overlay\/[^/]+\/editor\/?$/.test(location.pathname)) return;

  const russian = /^ru\b/i.test(navigator.language);
  const tr = (english, russianText) => russian ? russianText : english;
  const Zip = window.JSZip;
  const tabs = [
    ["html", "HTML"],
    ["css", "CSS"],
    ["js", "JS"],
    ["fields", "Fields"],
    ["data", "Data"]
  ];
  const addWidget = '[data-editor-action="Open widget creator"]';
  const customWidget = '#overlay .widget[se-type="se-widget-custom-event-list"]';
  const customSettings = "#widget-details__widget-settings se-widget-custom-event-list-settings";

  function visible(element) {
    return element?.getClientRects().length > 0;
  }

  function labeled(root, selector, label) {
    return [...root.querySelectorAll(selector)].find(
      (element) => visible(element) && element.textContent.trim().toLowerCase() === label.toLowerCase()
    );
  }

  async function waitFor(find, message, timeout = 6000) {
    const deadline = performance.now() + timeout;
    do {
      const result = find();
      if (result) return result;
      await new Promise((resolve) => setTimeout(resolve, 50));
    } while (performance.now() < deadline);
    throw new Error(message);
  }

  function codeDialog() {
    return [...document.querySelectorAll('[role="dialog"]')].find((dialog) => {
      const title = document.getElementById(dialog.getAttribute("aria-labelledby"));
      return visible(dialog) && title?.textContent.trim() === "Code editor";
    });
  }

  async function addCustomWidget() {
    const existing = new Set([...document.querySelectorAll(customWidget)].map((widget) => widget.id));
    const trigger = await waitFor(() => {
      const button = document.querySelector(addWidget);
      return visible(button) && !button.disabled && button.getAttribute("aria-disabled") !== "true" && button;
    }, tr("Add widget is unavailable. Open the overlay editor.", "Кнопка Add widget недоступна. Откройте редактор оверлея."));
    trigger.click();

    const search = await waitFor(() => {
      const input = document.querySelector('input[aria-label="Search widgets"]');
      return visible(input) && input;
    }, tr("The Add widget menu did not open.", "Не открылось меню Add widget."));
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(search, "Custom widget");
    search.dispatchEvent(new Event("input", { bubbles: true }));

    const item = await waitFor(() => {
      const title = labeled(document, '[role="menuitem"] span', "Custom widget");
      return title?.closest('[role="menuitem"]');
    }, tr("Custom Widget was not found in the StreamElements search.", "В поиске StreamElements не найден Custom Widget."));
    item.click();
    return waitFor(() => [...document.querySelectorAll(customWidget + ".selected")].find(
      (widget) => widget.id && !existing.has(widget.id)
    ), tr("StreamElements did not confirm creation of a new widget.", "StreamElements не подтвердил создание нового виджета."));
  }

  async function openCode(widget) {
    const settingsToggle = document.querySelector('[data-editor-action="Settings toggle expand state"]');
    if (visible(settingsToggle) && !settingsToggle.classList.contains("se-widget-details-v3__header__expanded")) {
      settingsToggle.click();
    }
    const open = await waitFor(() => {
      const settings = document.querySelector(customSettings);
      return settings && widget.matches(customWidget + ".selected") &&
        labeled(settings, "button", "Open Editor");
    }, tr("Open Editor is unavailable for the selected widget.", "Не нашлась кнопка Open Editor у выбранного виджета."));
    open.click();
    return waitFor(codeDialog, tr("The code editor did not open.", "Не открылось окно редактора кода."));
  }

  async function readModels(dialog) {
    const models = {};
    for (const [key, label] of tabs) {
      const tab = await waitFor(() => labeled(dialog, '[role="tab"]', label), tr(`Missing ${label} tab.`, `Нет вкладки ${label}.`));
      tab.click();
      models[key] = await waitFor(() => {
        const pane = document.getElementById(tab.getAttribute("aria-controls"));
        if (!visible(pane) || !dialog.contains(pane)) return null;
        // Match Monaco's editor by its DOM node. Models from other tabs may still be alive.
        return window.monaco?.editor?.getEditors?.()
          .find((editor) => pane.contains(editor.getDomNode()))?.getModel();
      }, tr(`The ${label} editor did not load.`, `Редактор не загрузил вкладку ${label}.`), 15000);
    }
    return models;
  }

  async function unpack(file) {
    let zip;
    try {
      zip = await Zip.loadAsync(file);
    } catch {
      throw new Error(tr("Could not open this ZIP file.", "Не удалось открыть этот ZIP."));
    }
    let ini = zip.file("widget.ini");
    // Flat Widget.io archives take precedence over nested sample folders.
    if (!ini && !tabs.some(([key]) => zip.file(`${key}.txt`))) {
      const manifests = zip.file(/(^|\/)widget\.ini$/i);
      if (manifests.length > 1) {
        throw new Error(tr("The ZIP contains more than one widget. Choose a ZIP with one widget.", "В ZIP несколько виджетов. Выберите архив с одним виджетом."));
      }
      [ini] = manifests;
    }
    const folder = ini?.name.slice(0, ini.name.lastIndexOf("/") + 1) ?? "";
    const paths = new Map();
    if (ini) {
      let section;
      for (const line of (await ini.async("string")).split(/\r?\n/)) {
        const header = line.trim().match(/^\[([^\]]+)\]$/);
        if (header) section = header[1].toLowerCase();
        const entry = line.match(/^\s*path\s*=\s*"([^"]+)"\s*$/i);
        if (section && entry) paths.set(section, entry[1]);
      }
    }
    const code = {};
    for (const [key] of tabs) {
      const path = paths.get(key);
      const entry = zip.file(folder + (path ?? `${key}.txt`));
      if (path && !entry) {
        throw new Error(tr(`Missing file from widget.ini: ${path}`, `В ZIP отсутствует файл из widget.ini: ${path}`));
      }
      if (entry) code[key] = await entry.async("string");
    }
    return code;
  }

  function validate(code) {
    if (!Object.keys(code).length) {
      throw new Error(tr("Choose a widget ZIP or select individual code files.", "Выберите ZIP виджета или отдельные файлы."));
    }
    for (const key of ["fields", "data"]) {
      const source = code[key]?.replace(/^\uFEFF/, "").trim() || "{}";
      try {
        const value = JSON.parse(source);
        if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
      } catch {
        throw new Error(tr(`${key.toUpperCase()} must contain a JSON object.`, `Вкладка ${key.toUpperCase()} должна содержать JSON-объект.`));
      }
      code[key] = source;
    }
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  function mount() {
    const root = document.createElement("aside");
    root.id = "widgetio-local";
    root.innerHTML = `
      <div id="widgetio-local-panel" hidden role="region" aria-label="${tr("Import and export widgets", "Импорт и экспорт виджетов")}">
        <label>${tr("Widget ZIP", "ZIP виджета")} <input id="widgetio-zip" type="file" accept=".zip"></label>
        <details><summary>${tr("Individual files", "Отдельные файлы")}</summary>
          ${tabs.map(([key, label]) => `<label>${label} <input data-code-file="${key}" type="file"></label>`).join("")}
        </details>
        <div class="widgetio-actions">
          <button type="button" data-import>${tr("Create widget", "Создать виджет")}</button>
          <button type="button" data-export>${tr("Download selected", "Скачать выбранный")}</button>
        </div>
        <p role="status" hidden></p>
      </div>
      <button type="button" data-toggle aria-controls="widgetio-local-panel" aria-expanded="false">Overlay ZIP</button>`;
    document.body.append(root);
    const panel = root.querySelector("#widgetio-local-panel");
    const toggle = root.querySelector("[data-toggle]");
    const status = root.querySelector('[role="status"]');
    const zipInput = root.querySelector("#widgetio-zip");
    const fileInputs = [...root.querySelectorAll("[data-code-file]")];
    const browseButtons = [...root.querySelectorAll("input, button[data-import], button[data-export]")];

    function show(open) {
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    }

    async function run(action) {
      for (const element of browseButtons) element.disabled = true;
      status.hidden = true;
      status.textContent = "";
      show(false);
      let message;
      try {
        if (codeDialog()) throw new Error(tr("Close the open code editor first.", "Сначала закройте открытый редактор кода."));
        message = await action();
      } catch (error) {
        message = error.message;
      } finally {
        for (const element of browseButtons) element.disabled = false;
        status.textContent = message;
        status.hidden = false;
        show(true);
      }
    }

    toggle.onclick = () => show(panel.hidden);
    root.querySelector("[data-import]").onclick = () => run(async () => {
      let code = {};
      const files = fileInputs.filter((input) => input.files.length);
      if (files.length) {
        for (const input of files) code[input.dataset.codeFile] = await input.files[0].text();
      } else if (zipInput.files.length) {
        code = await unpack(zipInput.files[0]);
      }
      validate(code);

      const widget = await addCustomWidget();
      try {
        const dialog = await openCode(widget);
        const models = await readModels(dialog);
        const done = await waitFor(() => labeled(dialog, "button", "Done"), tr("Done is unavailable.", "В редакторе нет кнопки Done."));
        for (const [key] of tabs) models[key].setValue(code[key] ?? "");
        done.click();
        await waitFor(() => !codeDialog(), tr("The code editor did not close.", "Редактор не подтвердил нажатие Done."));
      } catch (error) {
        throw new Error(`${error.message} ${tr("Undo can remove the new layer.", "Новый слой можно убрать через Undo.")}`);
      }
      for (const input of [zipInput, ...fileInputs]) input.value = "";
      return tr("Widget added. Click Save in StreamElements to keep it.", "Виджет добавлен. Сохраните оверлей кнопкой Save.");
    });

    root.querySelector("[data-export]").onclick = () => run(async () => {
      const [widget, other] = document.querySelectorAll("#overlay .widget.selected");
      if (!widget?.matches(customWidget) || other) {
        throw new Error(tr("Select one Custom Widget in the overlay layers.", "Выберите один Custom Widget в слоях оверлея."));
      }
      const name = document.getElementById(`editable-widget-name-input-${widget.id.replace(/^widget-/, "")}`)?.value;
      const dialog = await openCode(widget);
      const models = await readModels(dialog);
      const zip = new Zip();
      for (const [key] of tabs) zip.file(`${key}.txt`, models[key].getValue());
      zip.file("widget.ini", tabs.map(([key]) => `[${key.toUpperCase()}]\npath = "${key}.txt"\n`).join("\n"));
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      labeled(dialog, "button", "Done")?.click();
      download(blob, (name?.replace(/[<>:"/\\|?*]/g, "_").trim() || "widget") + ".zip");
      return tr("ZIP ready.", "ZIP готов.");
    });
  }

  waitFor(() => visible(document.querySelector(addWidget)), "", 60000)
    .then(mount)
    .catch(() => {});
})();
