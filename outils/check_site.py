#!/usr/bin/env python3
"""Vérifie les liens locaux, les ancres, les identifiants et le JS du site."""
from html.parser import HTMLParser
import json
import re
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
        self.jsonld = []
        self.meta = {}
        self.canonical = None
        self.redirect = None
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                self.duplicates.append(attrs['id'])
            self.ids.add(attrs['id'])
        if tag == 'a' and 'href' in attrs:
            self.links.append(attrs['href'])
        if tag == 'meta' and attrs.get('http-equiv') == 'refresh':
            self.redirect = attrs.get('content', '').split('url=', 1)[-1]
        if tag == 'meta' and ('name' in attrs or 'property' in attrs):
            self.meta[attrs.get('name') or attrs.get('property')] = attrs.get('content', '')
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href')
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.jsonld.append('')
            self.script = self.jsonld
        elif tag == 'script' and 'src' not in attrs and attrs.get('type') != 'application/json':
            self.script = ''

    def handle_data(self, data):
        if self.script is self.jsonld:
            self.jsonld[-1] += data
        elif self.script is not None:
            self.script += data

    def handle_endtag(self, tag):
        if tag == 'script' and self.script is not None:
            if self.script is not self.jsonld:
                self.scripts.append(self.script)
            self.script = None


SITE_URL = 'https://jordiordonez.github.io/reussite-maths/'


def seo(pages):
    """Descriptions uniques, liens canoniques absolus, JSON-LD valide, sitemap cohérent."""
    errors, seen = [], {}
    for path, page in pages.items():
        rel = path.relative_to(ROOT).as_posix()
        if page.redirect:
            target = (path.parent / page.redirect).resolve().relative_to(ROOT).as_posix()
            if page.canonical != SITE_URL + target or page.meta.get('robots') != 'noindex':
                errors.append(f'{rel}: redirection sans canonique absolu vers {target} ou sans noindex')
            continue
        description = page.meta.get('description', '')
        if not 100 <= len(description) <= 170:
            errors.append(f'{rel}: description absente ou de longueur {len(description)}')
        seen.setdefault(description, []).append(rel)
        expected = SITE_URL if rel == 'index.html' else SITE_URL + rel
        if page.canonical != expected:
            errors.append(f'{rel}: lien canonique {page.canonical!r} au lieu de {expected!r}')
        for key in ('og:title', 'og:description', 'og:url', 'og:image', 'twitter:card'):
            if not page.meta.get(key):
                errors.append(f'{rel}: balise {key} absente')
        for data in page.jsonld:
            try:
                json.loads(data)
            except ValueError as error:
                errors.append(f'{rel}: JSON-LD illisible ({error})')
        if rel.startswith('chapitres/') and not page.jsonld:
            errors.append(f'{rel}: fil d’Ariane JSON-LD absent')
    errors += [f'description partagée par {rels}' for rels in seen.values() if len(rels) > 1]
    sitemap = ROOT / 'sitemap.xml'
    if not sitemap.exists():
        return errors + ['sitemap.xml absent']
    for url in re.findall(r'<loc>([^<]+)</loc>', sitemap.read_text()):
        rel = url[len(SITE_URL):] or 'index.html'
        target = ROOT / rel
        if not url.startswith(SITE_URL) or not target.exists() or 'http-equiv="refresh"' in target.read_text():
            errors.append(f'sitemap.xml: adresse invalide {url}')
    if not (ROOT / 'og-image.png').exists():
        errors.append('og-image.png absent')
    return errors


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
    errors += seo(pages)
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'✓ {len(pages)} pages : liens locaux, ancres, identifiants, syntaxe JavaScript et référencement valides.')


if __name__ == '__main__':
    main()
