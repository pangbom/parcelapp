# ParcelApp

A small, static parcel tracker. Paste a tracking number, and it detects the carrier, names the parcel for you, and links to the carrier's tracking page.

## Features

- Add parcels by tracking number. Carrier is detected from the number format (UPS, FedEx, USPS, DHL, international post).
- Auto-naming, e.g. "UPS parcel 3". Click a name to rename it.
- Status per parcel: Ordered, Shipped, In transit, Out for delivery, Delivered.
- Archive or delete parcels. Search by name or number.
- Data is stored in the browser's localStorage. Nothing is sent to a server.
- Export and import as JSON for backup or moving between devices.

## Run locally

Open `index.html` in a browser. No build step, no dependencies.

## Hosting

GitHub Pages: repo Settings, Pages, deploy from the `main` branch, root folder.

## Limits

- No live status updates. Carrier pages show live tracking. Adding a tracking API (for example 17TRACK or AfterShip) would be a small change in `app.js`.
- Data lives in one browser. Use Export to back it up.
