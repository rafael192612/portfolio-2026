"""Optional static checks with Python stdlib; no build or runtime dependency."""
from pathlib import Path
from html.parser import HTMLParser
import json
import re

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.anchors, self.assets, self.scripts = [], [], [], []
        self.h1 = self.canvas = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        for key in ("href", "src", "poster", "data-src"):
            value = attrs.get(key, "")
            if value.startswith("#"):
                self.anchors.append(value[1:])
            elif value.startswith("./"):
                self.assets.append(value)
        if tag == "script":
            self.scripts.append(attrs)
        self.h1 += tag == "h1"
        self.canvas += tag == "canvas"


html = (ROOT / "index.html").read_text(encoding="utf-8")
for required in (
    "Presenças digitais construídas com estratégia e direção.",
    "Cada trabalho é desenvolvido a partir das necessidades do negócio, unindo clareza, identidade e uma experiência profissional para seus clientes.",
    "Os primeiros trabalhos da VERTEX serão apresentados aqui conforme forem concluídos.",
):
    assert required in html, "Commercial copy missing or encoding damaged"
assert not re.search(r"\w\?\w", html), "Possible damaged encoding in HTML"
page = Page()
page.feed(html)
assert len(page.ids) == len(set(page.ids)), "Duplicate HTML IDs"
assert set(page.anchors) <= set(page.ids), "Broken anchors"
assert all((ROOT / asset).exists() for asset in page.assets), "Missing HTML asset"
assert page.h1 == 1 and page.canvas == 1
css = (ROOT / "assets/css/style.css").read_text(encoding="utf-8")
assert css.count("{") == css.count("}"), "Unbalanced CSS braces (not a CSS parser)"
for asset in re.findall(r'url\(["\x27]?([^"\x27)]+)', css):
    assert (ROOT / "assets/css" / asset).is_file(), asset
json.loads((ROOT / "site.webmanifest").read_text(encoding="utf-8"))
for data in re.findall(r'<script type="application/ld\+json">([\s\S]*?)</script>', html):
    json.loads(data)

files = {path.resolve(): path.read_text(encoding="utf-8") for path in (ROOT / "assets/js").rglob("*.js")}
exports = {path: set(re.findall(r"export\s+(?:async\s+)?(?:function|const|let)\s+(\w+)", source)) for path, source in files.items()}
graph = {}
for path, source in files.items():
    assert not re.search(r"innerHTML|insertAdjacentHTML|document\.write|console\.log", source), path
    assert 'createElement("canvas")' not in source, path
    graph[path] = []
    for spec in re.findall(r'(?:from\s*|import\s*\()\s*["\x27]([^"\x27]+)', source):
        if spec.startswith("."):
            target = (path.parent / spec).resolve()
            assert target.is_file(), (path, spec)
            graph[path].append(target)
    for names, spec in re.findall(r'import\s*\{([^}]+)\}\s*from\s*["\x27]([^"\x27]+)', source):
        target = (path.parent / spec).resolve()
        assert {name.strip().split(" as ")[0] for name in names.split(",")} <= exports[target], (path, spec)


def visit(path, parents):
    assert path not in parents, f"Circular dependency: {path}"
    for child in graph[path]:
        visit(child, parents | {path})


for path in graph:
    visit(path, set())
print(json.dumps({
    "result": "PASS: static structure, references, exports, acyclic graph and JSON",
    "production_js_files": len(files),
    "es_modules": len(files) - 1,
    "html_script_elements": len(page.scripts),
    "listener_registration_sites": sum(s.count(".addEventListener(") for s in files.values()),
    "intersection_observer_constructors": sum(s.count("new IntersectionObserver") for s in files.values()),
    "resize_observer_constructors": sum(s.count("new ResizeObserver") for s in files.values()),
    "canvas": page.canvas,
    "limits": "Does not execute JS, validate CSS grammar, render layouts or verify external services.",
}, indent=2))
