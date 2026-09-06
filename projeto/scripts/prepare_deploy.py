"""Copy public files only; no application compilation or third-party packages."""
from pathlib import Path
import shutil
import tomllib

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "dist"

def prepare():
    # Refuse redirected output before removing the generated directory.
    if OUTPUT.is_symlink() or OUTPUT.resolve() != ROOT / "dist":
        raise RuntimeError("Unsafe deployment output directory")
    sources = [ROOT / name for name in ("index.html", "robots.txt", "site.webmanifest")]
    sources += [p for p in (ROOT / "assets").rglob("*")
                if p.is_file() and not any(part.startswith(".") for part in p.relative_to(ROOT).parts)]
    if (ROOT / "sitemap.xml").is_file():
        sources.append(ROOT / "sitemap.xml")
    for source in sources:
        if not source.is_file() or not source.resolve().is_relative_to(ROOT) or source.is_symlink():
            raise RuntimeError(f"Invalid public source: {source}")
    config = tomllib.loads((ROOT / "netlify.toml").read_text(encoding="utf-8"))
    if config["build"]["publish"] != "dist":
        raise RuntimeError("Publish directory must match the public output")
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()
    for source in sources:
        target = OUTPUT / source.relative_to(ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
    # Manual uploads also receive the same headers without reading netlify.toml.
    headers = []
    for rule in config.get("headers", []):
        headers.append(rule["for"])
        headers.extend(f"  {key}: {value}" for key, value in rule["values"].items())
    (OUTPUT / "_headers").write_text("\n".join(headers) + "\n", encoding="utf-8")
    print(f"Prepared {len(sources)} public files and _headers in dist/")

if __name__ == "__main__":
    prepare()
