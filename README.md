# Overlay ZIP Kit

Import and export StreamElements Custom Widgets as ZIP files. Overlay ZIP Kit is an independent adaptation of [Widget.io by Sigma](https://github.com/sigma-cw/widget-io) for the current overlay editor.

## Install

1. Download the extension ZIP from [Releases](https://github.com/kalderbabasina/overlay-zip-kit/releases/latest) and extract it into a folder you can keep.
2. In Chrome, open `chrome://extensions`, turn on **Developer mode**, and click **Load unpacked**. Select the folder containing `manifest.json`. If an older Widget.io copy is active, turn it off in Chrome's Extensions list.
3. Open or refresh a StreamElements overlay editor. Click **Overlay ZIP** at the bottom right of the editor.

To update a manually installed copy, extract the newer release into the same folder. Click the reload icon on the extension card, then refresh the StreamElements editor.

## Use

- **Import.** Select a widget ZIP and click **Create widget**. The extension adds a new Custom Widget and fills the HTML, CSS, JS, Fields, and Data tabs. Click **Save** in StreamElements to keep the changes. The demo ZIP on the release page is a small test widget you can use right away.
- **Export.** Select one Custom Widget in the overlay layers and click **Download selected**. Chrome saves a ZIP with the five code files and `widget.ini`.
- **Separate files.** Expand **Individual files** and select the files for the desired tabs. This selection takes precedence over the ZIP picker until you clear the files or finish an import.

The extension accepts standard Widget.io archives and flat archives with `html.txt`, `css.txt`, `js.txt`, `fields.txt`, and `data.txt`. A ZIP can also wrap a single `widget.ini` and its files in a folder. Use JSON objects for Fields and Data. Importing adds a new widget, so use a test overlay for an unfamiliar ZIP.

## Русский

1. Скачайте ZIP расширения на странице [релизов](https://github.com/kalderbabasina/overlay-zip-kit/releases/latest) и распакуйте его.
2. В Chrome откройте `chrome://extensions`. Включите **Режим разработчика**, нажмите **Загрузить распакованное расширение** и выберите папку с `manifest.json`. Если установлен старый Widget.io, выключите его.
3. Откройте или обновите редактор оверлея StreamElements. Нажмите **Overlay ZIP** справа внизу, выберите ZIP виджета и нажмите **Создать виджет**. Затем сохраните оверлей кнопкой **Save**.
4. Для экспорта выделите один Custom Widget в слоях и нажмите **Скачать выбранный**.

Для обновления распакуйте новый релиз в ту же папку, нажмите **↻** на карточке расширения и обновите вкладку редактора.

## Build

Run `python scripts/package.py` from the repository. The extension ZIP and the demo widget ZIP are generated in `dist/`. The extension can also be loaded directly from `extension/` for development.

[Privacy policy](PRIVACY.md) · [Chrome Web Store submission notes](STORE_LISTING.md) · [MIT license](LICENSE)
