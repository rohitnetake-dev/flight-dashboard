import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, shareReplay } from 'rxjs';

import { Airport, Flight, FlightData } from '../models/flight.model';
import { getHeading, interpolate } from '../utils/geo.utils';

@Injectable({ providedIn: 'root' })
export class FlightService {
  private http = inject(HttpClient);

  private airports$ = this.http
    .get<Airport[]>('assets/data/airports.json')
    .pipe(shareReplay(1));

  getAirports(): Observable<Airport[]> {
    return this.airports$;
  }

  getFlights(): Observable<Flight[]> {
    return forkJoin([
      this.airports$,
      this.http.get<FlightData[]>('assets/data/flights.json')
    ]).pipe(
      map(([airports, flights]) => flights.map(f => this.toFlight(f, airports)))
    );
  }

  // the json only has airport codes and progress, position is worked out here
  private toFlight(data: FlightData, airports: Airport[]): Flight {
    const origin = airports.find(a => a.code === data.origin)!;
    const destination = airports.find(a => a.code === data.destination)!;

    const from: [number, number] = [origin.lat, origin.lng];
    const to: [number, number] = [destination.lat, destination.lng];

    return {
      id: data.id,
      flightNumber: data.flightNumber,
      callsign: data.callsign,
      aircraftType: data.aircraftType,
      origin,
      destination,
      status: data.status,
      estimatedDeparture: data.estimatedDeparture,
      estimatedArrival: data.estimatedArrival,
      position: interpolate(from, to, data.progress),
      heading: getHeading(from, to)
    };
  }
}
