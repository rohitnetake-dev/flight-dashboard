# Flight Tracking & Operations Dashboard

Angular dashboard for monitoring flights on a Leaflet map, with KPI cards, filters, a flight details panel, dark mode and airport markers. All data is mocked from JSON, there is no backend.

## Tech

- Angular 17 (standalone components), TypeScript, RxJS
- Angular Material for UI components and theming
- Leaflet 1.9 for the map

## Setup

Requires Node 18.13+ 

```bash
npm install
npm start          
npm run build      
```

## Features

- Map with 20 mock flights. Click a marker to see flight number, callsign, origin, destination and status.
- Selecting a flight (marker or list) centers the map on it, draws the route polyline (solid = flown, dashed = remaining) and fills the details panel.
- KPI cards: total, active, delayed and arrived flights. They follow the current filters.
- Filters: callsign search, status, origin, destination (Reactive Forms).
- Dark mode toggle (saved in localStorage) and airport markers.
- Selected flight is kept in the URL, e.g. `/dashboard?flight=3`.

## Project structure

```
src/app
  components/   kpi-cards, filter-bar, flight-map, flight-details, flight-list, status-badge
  pages/        dashboard (holds the state and connects the components)
  services/     flight.service (loads JSON), theme.service (dark mode)
  models/       flight.model.ts
  utils/        geo.utils.ts
src/assets/data flights.json, airports.json
```

## Notes

- `flights.json` stores origin/destination codes and a `progress` value (0 to 1). The service works out the plane position and heading from the airport coordinates.
- Times are shown in UTC.
- Not included: unit tests, marker clustering, weather overlay, flight playback.
