import json
import os
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


ROOT_DIR = Path(__file__).resolve().parents[1]
DOWNLOADS_DIR = (ROOT_DIR / "../drive-test-assistant/output/downloads").resolve()
PAGE_PATH = ROOT_DIR / "available-dates/index.html"
SOURCE_DIRECTORY_LABEL = "../drive-test-assistant/output/downloads"
MAX_AGE_HOURS = 48
DEFAULT_TIMEZONE = "America/Toronto"
DATA_RE = re.compile(
    r"(?P<prefix>const BOOKABLE_DATES_DATA = )(?P<payload>\{[\s\S]*?\})(?P<suffix>;\n\n\s*let allRows = \[\];)"
)
FILENAME_RE = re.compile(
    r"^drivetest-dates-(?P<test_type>G2|G)-locations-(?P<centre>.+)-"
    r"(?P<hit_time>\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})-\d{3}\.txt$"
)


def get_source_timezone():
    timezone_name = os.environ.get("BOOKABLE_DATES_TIMEZONE", DEFAULT_TIMEZONE)
    try:
        return ZoneInfo(timezone_name)
    except ZoneInfoNotFoundError:
        return datetime.now().astimezone().tzinfo


def parse_available_date(value):
    parts = value.strip().split(" ", 1)
    if len(parts) != 2:
        return None

    try:
        return datetime.strptime(parts[1], "%B %d, %Y").date()
    except ValueError:
        return None


def parse_hit_time(value, source_tz):
    try:
        return datetime.strptime(value, "%Y-%m-%d-%H-%M-%S").replace(tzinfo=source_tz)
    except ValueError:
        return None


def format_centre(value):
    return value.replace("_", " ").strip()


def format_date_label(value):
    return value.strftime("%B %-d, %Y")


def parse_file(file_path, source_tz):
    match = FILENAME_RE.match(file_path.name)
    if not match:
        return None

    available_dates = []
    updated_at = parse_hit_time(match.group("hit_time"), source_tz)
    if updated_at is None:
        return None

    with file_path.open("r", encoding="utf-8") as file:
        for raw_line in file:
            columns = raw_line.rstrip("\n").split("\t")
            if len(columns) != 3 or columns[1] not in ("true", "false"):
                continue

            if columns[1] == "false":
                available_date = parse_available_date(columns[0])
                if available_date:
                    available_dates.append(available_date)

    return {
        "test_type": match.group("test_type"),
        "test_centre": format_centre(match.group("centre")),
        "updated_at": updated_at,
        "available_date": max(available_dates) if available_dates else None,
    }


def build_rows():
    source_tz = get_source_timezone()
    cutoff = datetime.now(source_tz) - timedelta(hours=MAX_AGE_HOURS)
    latest_by_centre = {}

    if not DOWNLOADS_DIR.exists():
        raise FileNotFoundError(f"Downloads directory not found: {DOWNLOADS_DIR}")

    for file_path in DOWNLOADS_DIR.glob("drivetest-dates-*-locations-*.txt"):
        parsed = parse_file(file_path, source_tz)
        if not parsed:
            continue

        key = (parsed["test_type"], parsed["test_centre"])
        existing = latest_by_centre.get(key)
        if existing is None or parsed["updated_at"] > existing["updated_at"]:
            latest_by_centre[key] = parsed

    rows = []
    for parsed in latest_by_centre.values():
        if parsed["updated_at"] < cutoff or parsed["available_date"] is None:
            continue

        updated_at = parsed["updated_at"]
        available_date = parsed["available_date"]
        rows.append({
            "testType": parsed["test_type"],
            "testCentre": parsed["test_centre"],
            "availableDate": available_date.isoformat(),
            "availableDateLabel": format_date_label(available_date),
            "updatedAt": updated_at.isoformat(),
            "updatedAtEpochMs": int(updated_at.timestamp() * 1000),
        })

    return sorted(rows, key=lambda row: (row["testType"], row["testCentre"]))


def payload_core(payload):
    return {
        "sourceDirectory": payload.get("sourceDirectory"),
        "rows": payload.get("rows"),
    }


def read_existing_payload(page_html):
    match = DATA_RE.search(page_html)
    if not match:
        return None

    try:
        return json.loads(match.group("payload"))
    except json.JSONDecodeError:
        return None


def update_page(payload):
    page_html = PAGE_PATH.read_text(encoding="utf-8")
    match = DATA_RE.search(page_html)
    if not match:
        raise ValueError("BOOKABLE_DATES_DATA block not found in available-dates/index.html")

    payload_lines = json.dumps(payload, indent=4).splitlines()
    embedded_payload = "\n".join(
        [payload_lines[0]] + [f"        {line}" for line in payload_lines[1:]]
    )
    replacement = f"{match.group('prefix')}{embedded_payload}{match.group('suffix')}"
    PAGE_PATH.write_text(DATA_RE.sub(replacement, page_html, count=1), encoding="utf-8")


def main():
    rows = build_rows()
    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceDirectory": SOURCE_DIRECTORY_LABEL,
        "rows": rows,
    }

    page_html = PAGE_PATH.read_text(encoding="utf-8")
    existing_payload = read_existing_payload(page_html)
    if existing_payload and payload_core(existing_payload) == payload_core(payload):
        payload["generatedAt"] = existing_payload.get("generatedAt", payload["generatedAt"])

    update_page(payload)
    print(f"Embedded {len(rows)} rows in {PAGE_PATH}")


if __name__ == "__main__":
    main()
