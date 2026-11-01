#!/usr/bin/env python3
"""Download the Chess Opening Theory book as raw, revision-tagged wikitext.

This is maintainer source material; the application never reads it at runtime.
The separate explanation-source snapshot stays pinned to its original revisions.
"""

import datetime
import json
import pathlib
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://en.wikibooks.org/w/api.php"
BOOK = "Chess Opening Theory"
OUTPUT = pathlib.Path(__file__).resolve().parent.parent / "data/wikibooks/complete-book.json"
USER_AGENT = "ChessOpeningExplorer/1.0 (https://github.com/ejball/ChessOpeningExplorer; Wikibooks source snapshot)"


def query(parameters):
    params = {"action": "query", "format": "json", "formatversion": "2", "maxlag": "5", **parameters}
    url = API + "?" + urllib.parse.urlencode(params)
    for attempt in range(6):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(request, timeout=90) as response:
                result = json.load(response)
            error = result.get("error")
            if error and error.get("code") == "maxlag":
                time.sleep(min(2 ** attempt, 30))
                continue
            if error:
                raise RuntimeError(f"MediaWiki error: {error}")
            return result
        except urllib.error.HTTPError as error:
            if error.code not in (429, 503) or attempt == 5:
                raise
            time.sleep(min(2 ** attempt, 30))
    raise RuntimeError("MediaWiki remained busy after retries")


def record(page):
    if page.get("missing") or not page.get("revisions"):
        raise RuntimeError(f"Missing revision for {page.get('title')}")
    revision = page["revisions"][0]
    try:
        content = revision["slots"]["main"]["content"]
    except KeyError as error:
        raise RuntimeError(f"Missing wikitext for {page['title']}") from error
    return {
        "title": page["title"],
        "pageId": page["pageid"],
        "revisionId": revision["revid"],
        "revisionTimestamp": revision["timestamp"],
        "url": page["fullurl"],
        "wikitext": content,
    }


def main():
    properties = {"prop": "revisions|info", "inprop": "url", "rvprop": "ids|timestamp|content", "rvslots": "main"}
    pages = {}
    root = query({**properties, "titles": BOOK})["query"]["pages"]
    if len(root) != 1:
        raise RuntimeError("Could not identify the book's main page")
    root_page = record(root[0])
    pages[root_page["pageId"]] = root_page

    parameters = {**properties, "generator": "allpages", "gapprefix": BOOK + "/", "gapnamespace": "0", "gaplimit": "25"}
    while True:
        result = query(parameters)
        for page in result.get("query", {}).get("pages", []):
            item = record(page)
            pages[item["pageId"]] = item
        if len(pages) % 250 < 25:
            print(f"Downloaded {len(pages)} pages", flush=True)
        if "continue" not in result:
            break
        parameters.update(result["continue"])
        time.sleep(0.2)

    snapshot = {
        "source": "https://en.wikibooks.org/wiki/Chess_Opening_Theory",
        "retrieved": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "license": "https://creativecommons.org/licenses/by-sa/4.0/",
        "pages": sorted(pages.values(), key=lambda page: page["title"]),
    }
    # Only replace the snapshot once all pages have been fetched successfully.
    temporary = OUTPUT.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(OUTPUT)
    print(f"Saved {len(pages)} pages to {OUTPUT}", flush=True)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Snapshot failed: {error}", file=sys.stderr)
        sys.exit(1)
