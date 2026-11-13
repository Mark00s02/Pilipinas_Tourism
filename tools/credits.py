"""Print a destination's credits array (JS) from the fetch_photo log, in plate order.
python tools/credits.py <id> <src1> <src2> ...   (reads .superpowers/credits/<id>.jsonl)"""
import json, sys
dest, order = sys.argv[1], sys.argv[2:]
rows = {r['src']: r for r in map(json.loads, open(f'.superpowers/credits/{dest}.jsonl', encoding='utf-8'))}
out = []
for i, src in enumerate(order, 1):
    r = rows[src]
    out.append({'plate': f'Plate {i:02d}', 'title': r['title'], 'url': r['url'], 'author': r['author'], 'license': r['license'], 'licenseUrl': r['licenseUrl']})
sys.stdout.buffer.write(('  credits: ' + json.dumps(out, ensure_ascii=False, indent=2).replace('\n', '\n  ') + ',\n').encode('utf-8'))
