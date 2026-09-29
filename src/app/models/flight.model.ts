export type FlightStatus = 'Scheduled' | 'Active' | 'Delayed' | 'Arrived';

export interface Airport {
  code: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
}

// shape of one entry in flights.json
export interface FlightData {
  id: number;
  flightNumber: string;
  callsign: string;
  aircraftType: string;
  origin: string;
  destination: string;
  status: FlightStatus;
  estimatedDeparture: string;
  estimatedArrival: string;
  progress: number;
}

export interface Flight {
  id: number;
  flightNumber: string;
  callsign: string;
  aircraftType: string;
  origin: Airport;
  destination: Airport;
  status: FlightStatus;
  estimatedDeparture: string;
  estimatedArrival: string;
  position: [number, number];
  heading: number;
}

export interface FlightFilters {
  search: string;
  status: string;
  origin: string;
  destination: string;
}

export interface FlightKpis {
  total: number;
  active: number;
  delayed: number;
  arrived: number;
}
