#!/usr/bin/env python3
"""
Fuzzy-match fishing_sessions.river_name → rivers.id
Fetches data from Supabase, matches, and PATCHes HIGH confidence rows.
"""

import json
import re
import subprocess
from collections import Counter

SUPABASE_URL = "https://qlasxtfbodyxbcuchvxz.supabase.co"
SERVICE_KEY  = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

STOPWORDS = {"river", "creek", "fork", "run", "spring", "the", "of", "a", "an",
             "upper", "lower", "middle", "north", "south", "east", "west",
             "big", "little", "great", "long", "deep", "clear", "black", "white",
             "red", "blue", "green", "grand", "rock", "salt", "cold", "hot"}


# ── HTTP helpers via curl ─────────────────────────────────────────────────────

def get(path, params=""):
    url = f"{SUPABASE_URL}/rest/v1/{path}?{params}&limit=1000"
    result = subprocess.run(
        ["curl", "-s", url,
         "-H", f"Authorization: Bearer {SERVICE_KEY}",
         "-H", f"apikey: {SERVICE_KEY}"],
        capture_output=True, text=True, check=True
    )
    return json.loads(result.stdout)


def patch(table, row_id, data):
    url = f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{row_id}"
    result = subprocess.run(
        ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
         "-X", "PATCH", url,
         "-H", f"Authorization: Bearer {SERVICE_KEY}",
         "-H", f"apikey: {SERVICE_KEY}",
         "-H", "Content-Type: application/json",
         "-H", "Prefer: return=minimal",
         "-d", json.dumps(data)],
        capture_output=True, text=True
    )
    return int(result.stdout.strip())


# ── Text helpers ──────────────────────────────────────────────────────────────

def normalize(s):
    return re.sub(r"\s+", " ", s.lower().strip()) if s else ""


def sig_words(s):
    """Significant (non-stopword) words, length > 2."""
    return {w for w in re.split(r"\W+", normalize(s))
            if w and w not in STOPWORDS and len(w) > 2}


# ── Matching ──────────────────────────────────────────────────────────────────

def match_confidence(session_name, river_name, unique_words=None):
    """Return (confidence, note) for a session river_name vs a river name."""
    sn = normalize(session_name)
    rn = normalize(river_name)

    if not sn:
        return "NONE", "empty-session-name"

    # 1. Exact
    if sn == rn:
        return "HIGH", "exact"

    # 2. Contains (either direction)
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
        # Only promote if word is specific enough (len >= 5 to filter out "big", "little", "green", etc.)
        if unique_words and word in unique_words and len(word) >= 5:
            return "HIGH", f"unique-word({word})"
        return "LOW", f"single-word({word})"

    return "NONE", "no-match"


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  Executive Angler — River Fuzzy Matcher")
    print("=" * 60)

    # ── Fetch data ────────────────────────────────────────────────
    print("\n[1] Fetching data from Supabase...")
    sessions = get("fishing_sessions", "select=id,river_name&river_id=is.null")
    rivers   = get("rivers", "select=id,name,slug")
    if not isinstance(sessions, list):
        print(f"    ERROR - sessions response: {sessions}")
        return
    if not isinstance(rivers, list):
        print(f"    ERROR - rivers response: {rivers}")
        return
    print(f"    Sessions with NULL river_id : {len(sessions)}")
    print(f"    Rivers in table             : {len(rivers)}")

    # ── Build unique-word index ───────────────────────────────────
    # A word is "unique" if it appears in exactly ONE river (union of name+slug)
    word_river_count = Counter()
    for river in rivers:
        combined = sig_words(river["name"]) | sig_words(river["slug"].replace("-", " "))
        for w in combined:
            word_river_count[w] += 1
    unique_words = {w for w, cnt in word_river_count.items() if cnt == 1}

    # ── Build match table ─────────────────────────────────────────
    print("\n[2] Running fuzzy match...")
    results = []

    for sess in sessions:
        sname = sess.get("river_name") or ""
        best_conf  = "NONE"
        best_note  = ""
        best_river = None
        rank = {"HIGH": 3, "MEDIUM": 2, "LOW": 1, "NONE": 0}

        for river in rivers:
            conf, note = match_confidence(sname, river["name"], unique_words)
            if rank[conf] > rank[best_conf]:
                best_conf, best_note, best_river = conf, note, river
            # Also try slug
            slug_name = river["slug"].replace("-", " ")
            conf2, note2 = match_confidence(sname, slug_name, unique_words)
            if rank[conf2] > rank[best_conf]:
                best_conf, best_note, best_river = conf2, note2 + "(slug)", river

        results.append({
            "session_id"  : sess["id"],
            "river_name"  : sname,
            "matched_id"  : best_river["id"]   if best_river else None,
            "matched_name": best_river["name"] if best_river else None,
            "confidence"  : best_conf,
            "note"        : best_note,
        })

    # ── Print full report ─────────────────────────────────────────
    high   = [r for r in results if r["confidence"] == "HIGH"]
    medium = [r for r in results if r["confidence"] == "MEDIUM"]
    low    = [r for r in results if r["confidence"] == "LOW"]
    none_  = [r for r in results if r["confidence"] == "NONE"]

    print(f"\n    HIGH   : {len(high)}")
    print(f"    MEDIUM : {len(medium)}")
    print(f"    LOW    : {len(low)}")
    print(f"    NONE   : {len(none_)}")

    if high:
        print("\n── HIGH CONFIDENCE (will be applied) ───────────────────────")
        seen = {}
        for r in high:
            key = (r["river_name"], r["matched_name"], r["note"])
            seen[key] = seen.get(key, 0) + 1
        for (rn, mn, note), cnt in sorted(seen.items()):
            print(f"  '{rn}'  →  '{mn}'  [{note}]  ({cnt} session(s))")

    if medium:
        print("\n── MEDIUM confidence (NOT auto-applied) ────────────────────")
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
        if status in (200, 201, 204):
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
    print(f"  Total sessions with NULL river_id : {total}")
    print(f"  HIGH confidence → auto-applied    : {len(high)}")
    print(f"  Still unmatched after this run     : {total - len(high)}")

    unmatched_names = sorted(set(
        r["river_name"] for r in results if r["confidence"] != "HIGH" and r["river_name"]
    ))
    if unmatched_names:
        print(f"\n  Unmatched river_name values ({len(unmatched_names)} unique):")
        for name in unmatched_names:
            print(f"    • {name!r}")
    else:
        print("\n  All sessions matched!")

    print("\nDone.")


if __name__ == "__main__":
    main()
