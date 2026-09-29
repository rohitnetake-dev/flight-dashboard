import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import * as L from 'leaflet';

import { Airport, Flight } from '../../models/flight.model';

// plain OpenStreetMap tiles, no api key needed. OSM has no official dark style,
// so dark mode reuses the same tiles with a css filter (see styles.scss, .dark-theme .leaflet-tile-pane)
const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

const PLANE_SVG = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
  </svg>`;

const ROUTE_COLOR = '#0091ea';

@Component({
  selector: 'app-flight-map',
  standalone: true,
  template: `<div #mapContainer class="map" role="region" aria-label="Flight map"></div>`,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
      .map {
        height: 100%;
        width: 100%;
      }
    `
  ]
})
export class FlightMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() flights: Flight[] = [];
  @Input() airports: Airport[] = [];
  @Input() selectedFlight: Flight | null = null;
  @Input() darkMode = false;
  @Output() flightSelected = new EventEmitter<Flight>();

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private map!: L.Map;
  private tileLayer?: L.TileLayer;
  private airportLayer = L.layerGroup();
  private routeLayer = L.layerGroup();
  private flightLayer = L.layerGroup();
  private markers = new Map<number, L.Marker>();
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [21, 78],
      zoom: 5
    });

    this.airportLayer.addTo(this.map);
    this.routeLayer.addTo(this.map);
    this.flightLayer.addTo(this.map);

    this.setTiles();
    this.drawAirports();
    this.drawFlights();
    this.highlightSelected();

    // keeps the map correct when the layout changes (tablet rotate etc.)
    this.resizeObserver = new ResizeObserver(() => this.map.invalidateSize());
    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map) {
      return;
    }
    if (changes['airports']) {
      this.drawAirports();
    }
    if (changes['flights']) {
      this.drawFlights();
    }
    if (changes['selectedFlight'] || changes['flights']) {
      this.highlightSelected();
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.map.remove();
  }

  private setTiles(): void {
    if (this.tileLayer) {
      return;
    }
    this.tileLayer = L.tileLayer(TILES, {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);
  }

  private drawAirports(): void {
    this.airportLayer.clearLayers();
    this.airports.forEach(airport => {
      L.circleMarker([airport.lat, airport.lng], {
        radius: 5,
        color: '#ffffff',
        weight: 1.5,
        fillColor: '#0b3d91',
        fillOpacity: 1
      })
        .bindTooltip(`${airport.code} - ${airport.name}`)
        .addTo(this.airportLayer);
    });
  }

  private drawFlights(): void {
    this.flightLayer.clearLayers();
    this.markers.clear();

    this.flights.forEach(flight => {
      const marker = L.marker(flight.position, {
        icon: this.createIcon(flight),
        title: `${flight.flightNumber} (${flight.callsign})`
      });

      marker.bindPopup(this.createPopup(flight), { autoPan: false });
      marker.on('click', () => this.flightSelected.emit(flight));
      marker.addTo(this.flightLayer);
      this.markers.set(flight.id, marker);
    });

    // zoom to whatever is being shown, unless a flight is selected
    if (this.flights.length && !this.selectedFlight) {
      const bounds = L.latLngBounds(this.flights.map(f => f.position));
      this.map.fitBounds(bounds, { padding: [40, 40] });
    }
  }

  private highlightSelected(): void {
    this.routeLayer.clearLayers();

    this.flights.forEach(flight => {
      const marker = this.markers.get(flight.id);
      const selected = flight.id === this.selectedFlight?.id;
      marker?.setIcon(this.createIcon(flight));
      marker?.setZIndexOffset(selected ? 1000 : 0);
    });

    const flight = this.selectedFlight;
    if (!flight) {
      this.map.closePopup();
      return;
    }

    this.drawRoute(flight);
    this.markers.get(flight.id)?.openPopup();
    this.centerOn(flight);
  }

  private drawRoute(flight: Flight): void {
    const origin: L.LatLngTuple = [flight.origin.lat, flight.origin.lng];
    const destination: L.LatLngTuple = [flight.destination.lat, flight.destination.lng];

    // part already flown is solid, the rest is dashed
    L.polyline([origin, flight.position], { color: ROUTE_COLOR, weight: 4 }).addTo(this.routeLayer);
    L.polyline([flight.position, destination], {
      color: ROUTE_COLOR,
      weight: 3,
      dashArray: '8 8'
    }).addTo(this.routeLayer);

    [flight.origin, flight.destination].forEach(airport => {
      L.circleMarker([airport.lat, airport.lng], {
        radius: 7,
        color: ROUTE_COLOR,
        weight: 3,
        fillColor: '#ffffff',
        fillOpacity: 1
      })
        .bindTooltip(airport.code, { permanent: true, direction: 'top' })
        .addTo(this.routeLayer);
    });
  }

  private centerOn(flight: Flight): void {
    const zoom = Math.max(this.map.getZoom(), 6);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      this.map.setView(flight.position, zoom);
    } else {
      this.map.flyTo(flight.position, zoom, { duration: 0.8 });
    }
  }

  private createIcon(flight: Flight): L.DivIcon {
    const selected = flight.id === this.selectedFlight?.id;
    const classes = `plane-marker status-${flight.status.toLowerCase()}${selected ? ' selected' : ''}`;

    return L.divIcon({
      className: 'plane-icon',
      html: `<div class="${classes}" style="transform: rotate(${flight.heading}deg)">${PLANE_SVG}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -16]
    });
  }

  private createPopup(flight: Flight): string {
    return `
      <div class="flight-popup">
        <div class="popup-title">
          <strong>${flight.flightNumber}</strong>
          <span class="status-badge status-${flight.status.toLowerCase()}">${flight.status}</span>
        </div>
        <dl>
          <dt>Callsign</dt><dd>${flight.callsign}</dd>
          <dt>Origin</dt><dd>${flight.origin.city} (${flight.origin.code})</dd>
          <dt>Destination</dt><dd>${flight.destination.city} (${flight.destination.code})</dd>
        </dl>
      </div>`;
  }
}
