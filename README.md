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

## Live status (optional)

Click "Live API key" and paste a 17TRACK API key. A "Refresh" button then appears on each parcel and shows the latest event. The key is stored only in this browser's localStorage. The browser calls 17TRACK directly, so the request may be blocked by CORS. If it is, the carrier links still work.

## Limits
- Data lives in one browser. Use Export to back it up.
