# Design Explanation

## Approach

The map is the main part of the screen. Everything else supports it: KPI cards sit on top as a slim summary row, filters sit directly above the map, and the flight details and flight list live in a fixed side panel on the right.

## Layout

- **Desktop:** KPI row, then a two column area. Left is filters plus the map, right is a 380px panel with flight details and a scrollable flight list.
- **Tablet (below 1100px):** the columns stack. The map stays first at 55% of the viewport height, the panel goes below it and the page scrolls.
- The flight list is there on purpose. Markers are hard to use with a keyboard or on a crowded map, so every flight can also be picked from the list.

## Architecture

- `DashboardComponent` is the only smart component. It combines flights, filters, selected flight and theme into one `vm$` stream with RxJS and passes plain data down.
- The other components are presentational (`@Input` / `@Output` only), so they can be reused. `StatusBadgeComponent` is used in the details panel, the list and the map popup styling.
- `FlightService` loads the JSON and builds the `Flight` objects (airport lookup, position, heading).
- The selected flight is stored in the query param `?flight=`. This keeps selection in one place and makes a flight shareable by link.
- The filtered list is calculated once and only changes when the data or filters change. Selecting a flight does not redraw the markers, it only updates the highlight and route.

## Map behaviour

- Plane markers are rotated to match the route direction and coloured by status.
- Selected flight: bigger ring on the marker, polyline from origin to destination, origin and destination labels, map flies to the flight (no animation if the user prefers reduced motion).
- When filters change, the map zooms to the flights that are left.
- Airport markers are small dots with a tooltip.

## Colour and typography

- Navy toolbar and brand colour to fit an aviation operations tool. Status colours are the same everywhere (cards, badges, markers): green active, orange delayed, grey arrived, blue scheduled.
- IBM Plex Sans for text, Material theme for form controls.
- Dark mode uses CSS variables plus the Material dark theme, and switches the map tiles to a dark basemap.

## Accessibility

- Semantic landmarks (`header`, `main`, `aside`, labelled sections) and labelled form controls.
- Visible focus outline, buttons for all actions, `aria-live` on the result count.
- Status is shown with text as well as colour.
- Marker colours and badge colours were chosen for readable contrast in both themes.

## Known limits

- Mock positions are a straight line between airports, not a real great-circle path.
- No real-time updates. No unit tests, clustering or weather overlay in this version.
