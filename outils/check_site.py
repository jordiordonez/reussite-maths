#!/usr/bin/env python3
"""Vérifie les liens locaux, les ancres, les identifiants et le JS du site."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent.parent


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.ids = set()
        self.duplicates = []
        self.links = []
        self.scripts = []
        self.script = None
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                self.duplicates.append(attrs['id'])
            self.ids.add(attrs['id'])
        if tag == 'a' and 'href' in attrs:
            self.links.append(attrs['href'])
        if tag == 'script' and 'src' not in attrs and attrs.get('type') != 'application/json':
            self.script = ''

    def handle_data(self, data):
        if self.script is not None:
            self.script += data

    def handle_endtag(self, tag):
        if tag == 'script' and self.script is not None:
            self.scripts.append(self.script)
            self.script = None


def main():
    files = [ROOT / 'index.html', ROOT / 'chapitres.html', ROOT / 'progres.html',
             ROOT / 'strategie/reussir_lannee.html', *sorted((ROOT / 'chapitres').glob('*/*.html'))]
    pages = {p.resolve(): Page(p.read_text()) for p in files}
    errors = []
    for path, page in pages.items():
        if page.duplicates:
            errors.append(f'{path.name}: identifiants en double {page.duplicates}')
        for link in page.links:
            parts = urlsplit(link)
            if parts.scheme or parts.netloc:
                continue
            target = (path.parent / unquote(parts.path)).resolve() if parts.path else path
            if not target.exists():
                errors.append(f'{path.name}: lien absent {link}')
            elif parts.fragment and target in pages and unquote(parts.fragment) not in pages[target].ids:
                errors.append(f'{path.name}: ancre absente {link}')
        for index, script in enumerate(page.scripts):
            with tempfile.NamedTemporaryFile('w', suffix='.js', encoding='utf-8') as tmp:
                tmp.write(script)
                tmp.flush()
                result = subprocess.run(['node', '--check', tmp.name], capture_output=True, text=True)
                if result.returncode:
                    errors.append(f'{path.name}: script {index}: {result.stderr[:700]}')
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'✓ {len(pages)} pages : liens locaux, ancres, identifiants et syntaxe JavaScript valides.')


if __name__ == '__main__':
    main()
