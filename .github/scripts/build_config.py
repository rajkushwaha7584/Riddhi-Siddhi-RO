"""Generate the public JavaScript config from local .env or CI variables."""

from __future__ import annotations

import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULTS = {
    "SITE_PHONE_DISPLAY": "+91 70004 11604",
    "SITE_PHONE_DIAL": "+917000411604",
    "SITE_EMAIL": "hello@riddhisiddhienterprises.in",
    "WEB3FORMS_ACCESS_KEY": "PASTE_WEB3FORMS_ACCESS_KEY",
    "FIREBASE_API_KEY": "PASTE_FIREBASE_API_KEY",
    "FIREBASE_AUTH_DOMAIN": "PASTE_FIREBASE_AUTH_DOMAIN",
    "FIREBASE_PROJECT_ID": "PASTE_FIREBASE_PROJECT_ID",
    "FIREBASE_APP_ID": "PASTE_FIREBASE_APP_ID",
}


def read_env_file(path: Path) -> dict[str, str]:
    """Read simple KEY=value entries without requiring a dotenv dependency."""
    values: dict[str, str] = {}
    if not path.is_file():
        return values
    for line_number, raw_line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[7:].lstrip()
        if "=" not in line:
            raise ValueError(f"Invalid .env entry on line {line_number}: expected KEY=value")
        key, value = line.split("=", 1)
        key = key.strip()
        if key not in DEFAULTS:
            raise ValueError(f"Unknown .env key on line {line_number}: {key}")
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        values[key] = value
    return values


def main() -> None:
    values = DEFAULTS | read_env_file(ROOT / ".env")
    # CI variables override local .env values, so repository Actions Variables
    # can configure the published Pages artifact without committing .env.
    values.update({key: os.environ[key] for key in DEFAULTS if os.environ.get(key)})
    missing = [key for key, value in values.items() if not value]
    if missing:
        raise ValueError("Configuration values cannot be empty: " + ", ".join(missing))

    content = {
        "phoneDisplay": values["SITE_PHONE_DISPLAY"],
        "phoneDial": values["SITE_PHONE_DIAL"],
        "email": values["SITE_EMAIL"],
        "web3FormsAccessKey": values["WEB3FORMS_ACCESS_KEY"],
    }
    firebase = {
        "apiKey": values["FIREBASE_API_KEY"],
        "authDomain": values["FIREBASE_AUTH_DOMAIN"],
        "projectId": values["FIREBASE_PROJECT_ID"],
        "appId": values["FIREBASE_APP_ID"],
    }
    (ROOT / "content.js").write_text(
        "// Generated from .env or GitHub Actions Variables by build_config.py.\n"
        f"window.SITE_CONTENT = {json.dumps(content, ensure_ascii=False, indent=2)};\n",
        encoding="utf-8",
    )
    configured_check = "Object.values(firebaseConfig).every(value => typeof value === \"string\" && value.length > 0 && !value.startsWith(\"PASTE_\"))"
    (ROOT / "firebase-config.js").write_text(
        "// Generated from .env or GitHub Actions Variables by build_config.py.\n"
        f"export const firebaseConfig = {json.dumps(firebase, ensure_ascii=False, indent=2)};\n\n"
        f"export const isFirebaseConfigured = {configured_check};\n",
        encoding="utf-8",
    )
    print("Generated content.js and firebase-config.js from public site settings.")


if __name__ == "__main__":
    main()
