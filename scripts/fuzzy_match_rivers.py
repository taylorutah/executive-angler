#!/usr/bin/env python3
"""
Fuzzy-match fishing_sessions.river_name → rivers.id
Fetches data from Supabase, matches, and PATCHes HIGH confidence rows.
"""

import json
import os
import re
import urllib.request
import urllib.error

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://qlasxtfbodyxbcuchvxz.supabase.co")
SERVICE_KEY  = os.environ.get("SUPABASE_SERVICE_KEY", "")

HEADERS = {
    "Authorization": f"Bearer {SERVICE_KEY}",
    "apikey": SERVICE_KEY,
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

STOPWORDS = {"river", "creek", "fork", "run", "spring", "the", "of", "a", "an",
             "upper", "lower", "middle", "north", "south", "east", "west"}


def get(path, params=""):
    url = f"{SUPABASE_URL}/rest/v1/{path}?{params}&limit=1000"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


def patch(table, row_id, data):
    url = f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{row_id}"
    payload = json.dumps(data).encode()
    req = urllib.request.Request(url, data=payload, headers=HEADERS, method="PATCH")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status
    except urllib.error.HTTPError as e:
        print(f"  !! PATCH error {e.code}: {e.read()}")
        return e.code


def normalize(s):
    return re.sub(r"\s+", " ", s.lower().strip()) if s else ""


def sig_words(s):
    """Return significant (non-stopword) words from a string."""
    return {w for w in re.split(r"\W+", normalize(s)) if w and w not in STOPWORDS and len(w) > 2}


def match_confidence(session_name, river_name, unique_words=None):
    """Return (confidence, note) for a session river_name vs a river name.
    unique_words: set of words that appear in exactly one river's name.
    """
    sn = normalize(session_name)
    rn = normalize(river_name)

    # Skip empty session names
    if not sn:
        return "NONE", "empty-session-name"

    # 1. Exact match
    if sn == rn:
        return "HIGH", "exact"

    # 2. Contains match (either direction) — only if session name is non-trivial
    if len(sn) >= 3 and (rn in sn or sn in rn):
        return "HIGH", "contains"

    # 3. Word overlap
    sw = sig_words(session_name)
    rw = sig_words(river_name)
    overlap = sw & rw
    if len(overlap) >= 2:
        return "MEDIUM", f"word-overlap({','.join(sorted(overlap))})"
    if len(overlap) == 1:
        word = next(iter(overlap))
        # Promote to HIGH if this word uniquely identifies this river
        if unique_words and word in unique_words:
            return "HIGH", f"unique-word({word})"
        return "LOW", f"single-word({word})"

    return "NONE", "no-match"


def main():
    print("=" * 60)
    print("  Executive Angler — River Fuzzy Matcher")
    print("=" * 60)

    # ── Fetch data ────────────────────────────────────────────────
    print("\n[1] Fetching data from Supabase...")
    sessions = get("fishing_sessions", "select=id,river_name&river_id=is.null")
    rivers   = get("rivers", "select=id,name,slug")
    print(f"    Sessions with NULL river_id : {len(sessions)}")
    print(f"    Rivers in table             : {len(rivers)}")

    # ── Build unique-word index ───────────────────────────────────
    # A word is "unique" if it appears in exactly one river (union of name+slug words)
    from collections import Counter
    word_river_count = Counter()
    for river in rivers:
        combined = sig_words(river["name"]) | sig_words(river["slug"].replace("-", " "))
        for w in combined:
            word_river_count[w] += 1
    unique_words = {w for w, cnt in word_river_count.items() if cnt == 1}

    # ── Build match table ─────────────────────────────────────────
    print("\n[2] Running fuzzy match...")
    results = []   # list of {session_id, river_name, river_id, confidence, note}

    for sess in sessions:
        sname = sess.get("river_name") or ""
        best_conf   = "NONE"
        best_note   = ""
        best_river  = None

        for river in rivers:
            conf, note = match_confidence(sname, river["name"], unique_words)
            rank = {"HIGH": 3, "MEDIUM": 2, "LOW": 1, "NONE": 0}
            if rank[conf] > rank[best_conf]:
                best_conf  = conf
                best_note  = note
                best_river = river
            # Also try matching against the slug
            slug_name = river["slug"].replace("-", " ")
            conf2, note2 = match_confidence(sname, slug_name, unique_words)
            if rank[conf2] > rank[best_conf]:
                best_conf  = conf2
                best_note  = note2 + "(slug)"
                best_river = river

        results.append({
            "session_id"  : sess["id"],
            "river_name"  : sname,
            "matched_id"  : best_river["id"]   if best_river else None,
            "matched_name": best_river["name"] if best_river else None,
            "confidence"  : best_conf,
            "note"        : best_note,
        })

    # ── Print full report ─────────────────────────────────────────
    high    = [r for r in results if r["confidence"] == "HIGH"]
    medium  = [r for r in results if r["confidence"] == "MEDIUM"]
    low     = [r for r in results if r["confidence"] == "LOW"]
    none_   = [r for r in results if r["confidence"] == "NONE"]

    print(f"\n    HIGH   : {len(high)}")
    print(f"    MEDIUM : {len(medium)}")
    print(f"    LOW    : {len(low)}")
    print(f"    NONE   : {len(none_)}")

    if high:
        print("\n── HIGH CONFIDENCE matches (will be applied) ──────────────")
        # Deduplicate for display
        seen = {}
        for r in high:
            key = (r["river_name"], r["matched_name"])
            seen[key] = seen.get(key, 0) + 1
        for (rn, mn), cnt in sorted(seen.items()):
            print(f"  '{rn}'  →  '{mn}'  ({cnt} session(s))")

    if medium:
        print("\n── MEDIUM confidence (NOT auto-applied, review manually) ───")
        seen = {}
        for r in medium:
            key = (r["river_name"], r["matched_name"], r["note"])
            seen[key] = seen.get(key, 0) + 1
        for (rn, mn, note), cnt in sorted(seen.items()):
            print(f"  '{rn}'  ~  '{mn}'  [{note}]  ({cnt} session(s))")

    if low:
        print("\n── LOW confidence (NOT auto-applied) ───────────────────────")
        seen = {}
        for r in low:
            key = (r["river_name"], r["matched_name"], r["note"])
            seen[key] = seen.get(key, 0) + 1
        for (rn, mn, note), cnt in sorted(seen.items()):
            print(f"  '{rn}'  ?  '{mn}'  [{note}]  ({cnt} session(s))")

    if none_:
        print("\n── NO MATCH found ───────────────────────────────────────────")
        seen = {}
        for r in none_:
            seen[r["river_name"]] = seen.get(r["river_name"], 0) + 1
        for rn, cnt in sorted(seen.items()):
            print(f"  '{rn}'  ({cnt} session(s))")

    # ── Apply HIGH confidence matches ─────────────────────────────
    print("\n[3] Applying HIGH confidence matches...")
    applied = 0
    failed  = 0
    for r in high:
        status = patch("fishing_sessions", r["session_id"], {"river_id": r["matched_id"]})
        if str(status).startswith("2") or status == 204:
            applied += 1
        else:
            failed += 1
            print(f"  FAILED: session {r['session_id']} → {r['matched_id']} (HTTP {status})")

    print(f"    Applied : {applied}")
    print(f"    Failed  : {failed}")

    # ── Final summary ─────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("  SUMMARY")
    print("=" * 60)
    total = len(sessions)
    matched_count = len(high)
    unmatched_count = total - matched_count
    print(f"  Total sessions with NULL river_id : {total}")
    print(f"  HIGH confidence → auto-applied    : {matched_count}")
    print(f"  Still unmatched after this run     : {unmatched_count}")

    unmatched_names = sorted(set(
        r["river_name"] for r in results if r["confidence"] != "HIGH"
    ))
    if unmatched_names:
        print(f"\n  Unmatched river_name values ({len(unmatched_names)} unique):")
        for name in unmatched_names:
            print(f"    • {name!r}")
    else:
        print("\n  🎉 All sessions matched!")

    print("\nDone.")


if __name__ == "__main__":
    main()
