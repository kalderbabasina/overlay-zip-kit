"""Build the extension ZIP and a synthetic widget ZIP for release downloads."""

import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


ROOT = Path(__file__).resolve().parents[1]
EXTENSION = ROOT / "extension"
DEMO = ROOT / "demo"
DIST = ROOT / "dist"


def write_zip(name, files):
    destination = DIST / name
    with ZipFile(destination, "w") as archive:
        for entry, source in sorted(files.items()):
            info = ZipInfo(entry, date_time=(2020, 1, 1, 0, 0, 0))
            archive.writestr(info, source.read_bytes(), compress_type=ZIP_DEFLATED)
    with ZipFile(destination) as archive:
        if archive.testzip() is not None or set(archive.namelist()) != files.keys():
            raise ValueError(f"Invalid archive: {destination}")
    print(destination)


def main():
    manifest = json.loads((EXTENSION / "manifest.json").read_text(encoding="utf-8"))
    content = manifest["content_scripts"][0]
    extension_paths = {
        "manifest.json", manifest["action"]["default_popup"], "popup.js",
        "vendor/JSZip-LICENSE.md", *manifest["icons"].values(),
        *content["js"], *content["css"],
    }
    sources = {path: EXTENSION / path for path in extension_paths}
    sources["LICENSE"] = ROOT / "LICENSE"
    demo_paths = ("widget.ini", "html.txt", "css.txt", "js.txt", "fields.txt", "data.txt")
    DIST.mkdir(exist_ok=True)
    write_zip(f"overlay-zip-kit-{manifest['version']}.zip", sources)
    write_zip("demo-widget.zip", {path: DEMO / path for path in demo_paths})


if __name__ == "__main__":
    main()
