"""Headless Edge/Chrome: screenshot a page, or dump its DOM after scripts run.

python tools/shoot.py <url-or-path[#hash]> <out.png> [--size 1440x900] [--wait 8000]
python tools/shoot.py <url-or-path[#hash]> --dom [--wait 8000]
"""
import argparse
import os
import pathlib
import subprocess
import sys
import tempfile

BROWSERS = [
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
]


def to_url(target):
    if '://' in target:
        return target
    path, sep, frag = target.partition('#')
    path, qsep, query = path.partition('?')
    url = pathlib.Path(path).resolve().as_uri()
    return url + (qsep + query if qsep else '') + (sep + frag if sep else '')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('target')
    ap.add_argument('out', nargs='?')
    ap.add_argument('--dom', action='store_true')
    ap.add_argument('--size', default='1440x900')
    ap.add_argument('--wait', type=int, default=8000)
    a = ap.parse_args()
    if not a.dom and not a.out:
        ap.error('give an output .png or --dom')
    exe = next((b for b in BROWSERS if os.path.exists(b)), None)
    if not exe:
        sys.exit('no Edge/Chrome found')
    w, h = a.size.lower().split('x')
    with tempfile.TemporaryDirectory() as profile:
        cmd = [exe, '--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars',
               '--no-first-run', '--disable-gpu-sandbox', f'--user-data-dir={profile}',
               f'--virtual-time-budget={a.wait}', f'--window-size={w},{h}']
        if a.dom:
            cmd.append('--dump-dom')
        else:
            out = os.path.abspath(a.out)
            os.makedirs(os.path.dirname(out), exist_ok=True)
            cmd.append(f'--screenshot={out}')
        cmd.append(to_url(a.target))
        r = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=180)
        if a.dom:
            sys.stdout.buffer.write(r.stdout.encode('utf-8'))
        elif not os.path.exists(out):
            sys.exit(f'screenshot failed: {r.stderr[-800:]}')
        else:
            print(out)


if __name__ == '__main__':
    main()
