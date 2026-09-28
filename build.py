"""Build index.html using Python 3.9+ standard library only.

Edit content/en/*.html, content/zh/*.html and assets directly.
This builder never reads the old DOCX or the earlier translation mappings.
"""
from pathlib import Path
from html.parser import HTMLParser
from html import escape
from collections import Counter
import json
import re

ROOT = Path(__file__).resolve().parent

class Inspector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids, self.links, self.resources, self.headings = [], [], [], []
        self.heading = None
        self.tables = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if tag == 'a' and a.get('href', '').startswith('#'): self.links.append(a['href'][1:])
        if tag in ('img', 'script') and a.get('src'): self.resources.append(a['src'])
        if tag == 'link' and a.get('href'): self.resources.append(a['href'])
        if tag in ('h2', 'h3', 'h4'): self.heading = [int(tag[1]), '']
        if tag == 'table': self.tables += 1
    def handle_data(self, data):
        if self.heading is not None: self.heading[1] += data
    def handle_endtag(self, tag):
        if self.heading is not None and tag == 'h' + str(self.heading[0]):
            self.headings.append(self.heading)
            self.heading = None

def read_local(relative):
    path = (ROOT / relative).resolve()
    if ROOT not in path.parents:
        raise ValueError('Path must be inside the manual directory: ' + relative)
    return path.read_text(encoding='utf-8-sig')

def build():
    manifest = json.loads(read_local('content/manifest.json'))
    page = read_local('templates/page.html')
    counts = {}
    for language in ('en', 'zh'):
        chapters, toc = [], []
        entries = manifest['languages'][language]
        for entry in entries:
            source = read_local(entry['file'])
            info = Inspector()
            info.feed(source)
            if entry['id'] not in info.ids or not info.headings:
                raise ValueError('Missing section ID or heading in ' + entry['file'])
            level, title = info.headings[0]
            toc.append('<li class="km-level-{}"><a href="#{}">{}</a></li>'.format(
                level, escape(entry['id'], quote=True), escape(title.strip())))
            chapters.append(source.strip())
        replacements = {
            '{{sections_' + language + '}}': '\n'.join(chapters),
            '{{toc_' + language + '}}': '\n'.join(toc),
            '{{count_' + language + '}}': str(len(entries)) + (' sections' if language == 'en' else ' 个章节')
        }
        for marker, value in replacements.items():
            if page.count(marker) != 1: raise ValueError('Template marker missing or duplicated: ' + marker)
            page = page.replace(marker, value)
        counts[language] = len(entries)
    if re.search(r'\{\{(?:sections|toc|count)_', page):
        raise ValueError('Unexpanded template marker')
    inspection = Inspector()
    inspection.feed(page)
    duplicates = [key for key, count in Counter(inspection.ids).items() if count > 1]
    if duplicates: raise ValueError('Duplicate IDs: ' + ', '.join(duplicates))
    missing = set(inspection.links) - set(inspection.ids)
    if missing: raise ValueError('Missing anchor targets: ' + ', '.join(sorted(missing)))
    for resource in inspection.resources:
        if resource.startswith(('https:', 'http:', 'data:')):
            raise ValueError('Expected a local resource, got: ' + resource[:100])
        path = (ROOT / resource).resolve()
        if ROOT not in path.parents or not path.is_file():
            raise ValueError('Missing or invalid local resource: ' + resource)
    # Write only after validation. BOM plus early charset declaration supports local viewing.
    temporary = ROOT / 'index.html.tmp'
    temporary.write_text(page, encoding='utf-8-sig')
    temporary.replace(ROOT / 'index.html')
    print('Built index.html: ' + ', '.join('{} {} chapters'.format(k, v) for k, v in counts.items())
          + '; {} tables; {} bytes'.format(inspection.tables, (ROOT / 'index.html').stat().st_size))

if __name__ == '__main__':
    build()
