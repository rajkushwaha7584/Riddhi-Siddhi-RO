"""Check that local page assets and in-page navigation targets exist."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[2]
INDEX = ROOT / "index.html"


class PageReferences(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.references = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        element_id = values.get("id")
        if element_id:
            self.ids.add(element_id)
        for attribute in ("href", "src"):
            value = values.get(attribute)
            if value:
                self.references.append((tag, attribute, value))


def main():
    if not INDEX.is_file():
        raise SystemExit("Missing index.html")

    page = PageReferences()
    page.feed(INDEX.read_text(encoding="utf-8"))
    errors = []

    for tag, attribute, value in page.references:
        parsed = urlsplit(value)
        if parsed.scheme or parsed.netloc:
            continue
        if attribute == "href" and not parsed.path:
            fragment = unquote(parsed.fragment)
            if fragment and fragment not in page.ids:
                errors.append(f"Missing in-page target #{fragment}")
            continue
        if not parsed.path:
            continue
        target = (ROOT / unquote(parsed.path)).resolve()
        try:
            target.relative_to(ROOT)
        except ValueError:
            errors.append(f"Reference points outside the site: {value}")
            continue
        if not target.is_file():
            errors.append(f"Missing local {attribute} in <{tag}>: {value}")

    if errors:
        raise SystemExit("\n".join(errors))
    print("HTML local references and in-page navigation targets are present.")


if __name__ == "__main__":
    main()
