// Generated from .env or GitHub Actions Variables by build_config.py.
export const firebaseConfig = {
  "apiKey": "AIzaSyDtlFpUe093jgN7ccK5UMwLokti7GTGcec",
  "authDomain": "ro-by-rs.firebaseapp.com",
  "projectId": "ro-by-rs",
  "appId": "1:89907085535:web:3665f91e723ad8035aa96a"
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(value => typeof value === "string" && value.length > 0 && !value.startsWith("PASTE_"));
