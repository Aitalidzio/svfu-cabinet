"""Check which Google Fonts families contain the Sakha (Yakut) Cyrillic letters.

Usage: python -I check_sakha_fonts.py <download_dir>
"""
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from fontTools.ttLib import TTFont

SAKHA = "ҔҕҤҥӨөҺһҮү"
BASE = "ЖжЁё"
FAMILIES = [
    "Inter", "Manrope", "Onest", "Golos Text", "Unbounded", "Montserrat",
    "Rubik", "Nunito", "PT Sans", "Geologica", "Commissioner", "Raleway",
    "Jost", "Mulish", "Wix Madefor Text", "Wix Madefor Display", "Exo 2",
    "Roboto Flex", "IBM Plex Sans", "Noto Sans", "Source Sans 3", "Comfortaa",
]
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36")


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def main() -> None:
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    text = urllib.parse.quote(SAKHA + BASE)
    for family in FAMILIES:
        fam = urllib.parse.quote_plus(family)
        try:
            css = fetch(f"https://fonts.googleapis.com/css2?family={fam}&text={text}").decode()
        except Exception as exc:  # noqa: BLE001
            print(f"{family:22} ERROR css: {exc}")
            continue
        urls = re.findall(r"url\((https://[^)]+)\)", css)
        cps: set[int] = set()
        for i, u in enumerate(urls):
            path = out / f"{family.replace(' ', '_')}_{i}.font"
            path.write_bytes(fetch(u))
            font = TTFont(str(path))
            cps |= set(font.getBestCmap().keys())
        missing = [f"U+{ord(c):04X}" for c in SAKHA + BASE if ord(c) not in cps]
        status = "OK  " if not missing else "MISS"
        print(f"{family:22} {status} missing: {' '.join(missing) or '-'}", flush=True)


if __name__ == "__main__":
    main()
