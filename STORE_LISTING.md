# Chrome Web Store submission

## Listing

**Name** Overlay ZIP Kit

**Short description** Import and export Custom Widgets as ZIP files in the StreamElements overlay editor.

**Description**

> Overlay ZIP Kit lets you transfer Custom Widgets between ZIP files and the StreamElements overlay editor. Open Overlay ZIP in the editor, choose an archive, and create a new Custom Widget with its HTML, CSS, JavaScript, Fields, and Data. Select an existing Custom Widget to download its code as a ZIP.
>
> Supports the Widget.io archive format and individual code files. The extension processes packages in your browser and works with the StreamElements editor you already use.
>
> This is an independent extension based on Widget.io by Sigma. It is available in English and Russian.

## Dashboard

- **Single purpose** Import and export StreamElements Custom Widget code and settings as ZIP files.
- **Site access justification** The content script runs on `https://streamelements.com/overlay/*/editor*` so users can create a Custom Widget, fill its tabs, or export one selected widget. It uses the page's Monaco editor to read and write the selected widget models.
- **Remote code** The extension ships the code it executes, including JSZip, inside the package. Imported widget code is passed to the site's editor as text. StreamElements runs the widget as part of its own overlay functionality.
- **Privacy policy URL** https://github.com/kalderbabasina/overlay-zip-kit/blob/main/PRIVACY.md
- **Support URL** https://github.com/kalderbabasina/overlay-zip-kit/issues

Use these descriptions to fill in the dashboard's data and site-access declarations. The extension handles selected file contents in browser memory and provides them to the editor when prompted. Store listing language should match the corresponding listing text.

## Reviewer test

1. In a test StreamElements account, open an existing overlay in its editor or create a blank overlay.
2. Download `demo-widget.zip` from the [release page](https://github.com/kalderbabasina/overlay-zip-kit/releases/latest). At the bottom right of the editor, open **Overlay ZIP**, choose that archive, and click **Create widget**.
3. The new Custom Widget displays “Overlay ZIP Kit · Demo” and has editable HTML, CSS, JS, Fields, and Data. Change the label in its Settings to check that the demo responds.
4. Select the widget and click **Download selected**. The resulting ZIP contains the five text files and `widget.ini`.

## Submit

1. Sign in to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole). First-time publishers must register, pay the one-time registration fee, and enable two-step verification. [Registration](https://developer.chrome.com/docs/webstore/register) · [Two-step verification](https://developer.chrome.com/docs/webstore/program-policies/two-step-verification)
2. Create a new item and upload `overlay-zip-kit-1.6.0.zip` from the release. Fill in the listing, privacy and distribution forms. [Upload and review](https://developer.chrome.com/docs/webstore/publish)
3. Add at least one real screenshot of the extension in the overlay editor. Use a test overlay with the demo widget and the **Overlay ZIP** panel open. Use 1280 × 800 or 640 × 400 pixels. The required 128 × 128 icon is already in the extension ZIP. [Image requirements](https://developer.chrome.com/docs/webstore/images)
4. Submit the item for review. When Google approves and publishes it, share its Chrome Web Store link for one-click installs.
