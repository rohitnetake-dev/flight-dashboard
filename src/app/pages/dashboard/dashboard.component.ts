import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, map, of, shareReplay } from 'rxjs';

import { FilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { FlightDetailsComponent } from '../../components/flight-details/flight-details.component';
import { FlightListComponent } from '../../components/flight-list/flight-list.component';
import { FlightMapComponent } from '../../components/flight-map/flight-map.component';
import { KpiCardsComponent } from '../../components/kpi-cards/kpi-cards.component';
import { Airport, Flight, FlightFilters, FlightKpis } from '../../models/flight.model';
import { FlightService } from '../../services/flight.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    AsyncPipe,
    KpiCardsComponent,
    FilterBarComponent,
    FlightMapComponent,
    FlightDetailsComponent,
    FlightListComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private flightService = inject(FlightService);
  private themeService = inject(ThemeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  hasError = false;

  private filters$ = new BehaviorSubject<FlightFilters>({
    search: '',
    status: '',
    origin: '',
    destination: ''
  });

  // selected flight lives in the url (?flight=3) so a link opens with it selected
  private selectedId$ = this.route.queryParamMap.pipe(
    map(params => Number(params.get('flight')) || null)
  );

  private allFlights$ = this.flightService.getFlights().pipe(
    catchError(() => {
      this.hasError = true;
      return of([] as Flight[]);
    }),
    shareReplay(1)
  );

  private airports$ = this.flightService.getAirports().pipe(
    catchError(() => of([] as Airport[]))
  );

  private filteredFlights$ = combineLatest([this.allFlights$, this.filters$]).pipe(
    map(([flights, filters]) => this.applyFilters(flights, filters))
  );

  vm$ = combineLatest([
    this.allFlights$,
    this.filteredFlights$,
    this.airports$,
    this.selectedId$,
    this.themeService.isDark$
  ]).pipe(
    map(([allFlights, flights, airports, selectedId, isDark]) => ({
      flights,
      airports,
      isDark,
      kpis: this.getKpis(flights),
      origins: this.uniqueAirports(allFlights.map(f => f.origin)),
      destinations: this.uniqueAirports(allFlights.map(f => f.destination)),
      // if a filter hides the selected flight, nothing stays selected
      selectedFlight: flights.find(f => f.id === selectedId) ?? null
    }))
  );

  onFiltersChange(filters: FlightFilters): void {
    this.filters$.next(filters);
  }

  selectFlight(flight: Flight): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { flight: flight.id },
      queryParamsHandling: 'merge'
    });
  }

  clearSelection(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { flight: null },
      queryParamsHandling: 'merge'
    });
  }

  private applyFilters(flights: Flight[], filters: FlightFilters): Flight[] {
    const search = filters.search.trim().toLowerCase();

    return flights.filter(
      flight =>
        (!search || flight.callsign.toLowerCase().includes(search)) &&
        (!filters.status || flight.status === filters.status) &&
        (!filters.origin || flight.origin.code === filters.origin) &&
        (!filters.destination || flight.destination.code === filters.destination)
    );
  }

  private getKpis(flights: Flight[]): FlightKpis {
    return {
      total: flights.length,
      active: flights.filter(f => f.status === 'Active').length,
      delayed: flights.filter(f => f.status === 'Delayed').length,
      arrived: flights.filter(f => f.status === 'Arrived').length
    };
  }

  private uniqueAirports(airports: Airport[]): Airport[] {
    const unique = airports.filter((a, i) => airports.findIndex(x => x.code === a.code) === i);
    return unique.sort((a, b) => a.city.localeCompare(b.city));
  }
}
