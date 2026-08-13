# Baby Chloe – Quick Log frontend prototype

This is a standalone mobile-first prototype using only HTML, CSS and vanilla JavaScript.

## Test locally
Open `index.html` in a browser. It uses sample data on first launch and stores changes in `localStorage`.

## Current prototype
- One-tap Wee / Poo / Wee + Poo logging
- Breastfeed side selection
- Live feed timer (timestamp-based, so it stays accurate when the app is backgrounded or the screen is locked)
- Stop feed and calculate duration
- Today timeline
- History view
- Event detail view
- Undo for quick events
- No Airtable connection yet

## Next step
Replace the localStorage data layer with calls to the secure API endpoint that will sit between this frontend and Airtable.

Do not put an Airtable Personal Access Token in `app.js`.
