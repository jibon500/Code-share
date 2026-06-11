# Production Notes

This repository now contains a complete frontend and admin CMS for the Code Sharing & Download Platform prototype. Important final steps you should do before publishing:

1. Firebase
 - Open your Firebase Console > Realtime Database > Rules and replace with database.rules.json from the repo.
 - Open Storage > Rules and update with storage.rules.
 - Add admin user UID(s) under the `admins` node in Realtime Database.

2. Hosting
 - Use Firebase Hosting for best results (rewrites to /index.html if SPA). Follow docs in docs/DEPLOY.md.

3. Ads & Analytics
 - Add your ad codes to Admin > Ads Manager.
 - Add Google Analytics code snippet to settings via Admin Panel (settings JSON) so front-end can inject.

4. Security
 - Do not commit any sensitive server keys.
 - Consider adding Cloud Functions for server-side download validation and to avoid client write-heavy logging.

5. Testing
 - Test likes/loves/views/downloads with multiple devices/browsers.
 - Verify Storage upload security and access restrictions.

