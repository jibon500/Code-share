# Deployment & Development

This project uses Firebase Realtime Database and Firebase Storage. The repository contains a basic frontend and an admin panel.

Steps to run locally:
1. Serve the repository via a static server (e.g., VS Code Live Server) or GitHub Pages.
2. Ensure src/firebase/config.js contains your Firebase project configuration (already added).

Recommended deployment:
- Use Firebase Hosting for proper rewrites and SSL, or GitHub Pages for static hosting.
- To use Firebase Hosting:
  - Install Firebase CLI: npm i -g firebase-tools
  - firebase login
  - firebase init hosting (choose project)
  - firebase deploy --only hosting

Security:
- Update Realtime Database rules and Storage rules in Firebase Console using the provided files (database.rules.json and storage.rules).
- Add admin user UIDs under /admins in Realtime Database to allow write access from admin UI.
